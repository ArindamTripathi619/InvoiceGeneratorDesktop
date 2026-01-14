import { useState, useEffect } from 'react';
import { Upload, Save, Image as ImageIcon, Loader2, Folder, Check, AlertCircle, HardDrive, FileUp, Settings as SettingsIcon, CloudOff, DownloadCloud } from 'lucide-react';
import { message, open, ask } from '@tauri-apps/api/dialog';
import { CompanySettings } from '../types/invoice';
import { dbService } from '../services/db';
import { backupService } from '../services/backup';

export default function Settings() {
  const [settings, setSettings] = useState<CompanySettings>({
    accountName: 'APEX SOLAR',
    bankName: 'STATE BANK OF INDIA',
    ifscCode: 'SBIN0007679',
    accountNumber: '40423372674',
    gstNumber: '19AFZPT2526E1ZV',
  });

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isUploadingStamp, setIsUploadingStamp] = useState<boolean>(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Backup State
  const [backupPath, setBackupPath] = useState('');
  const [autoBackup, setAutoBackup] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [cloudLink, setCloudLink] = useState('');
  const [isCloudRestoring, setIsCloudRestoring] = useState(false);

  useEffect(() => {
    // Poll briefly to ensure service settings are loaded
    const timer = setTimeout(() => {
      setBackupPath(backupService.getBackupPath());
      setAutoBackup(backupService.isAutoBackupEnabled());
      setCloudLink(backupService.getRecoveryLink());
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleSelectBackupFolder = async () => {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
        title: 'Select Backup Folder (e.g., Google Drive)'
      });

      if (selected && typeof selected === 'string') {
        setBackupPath(selected);
        await backupService.setBackupPath(selected);

        // Default to enabling auto-backup when folder is chosen
        if (!autoBackup) {
          setAutoBackup(true);
          await backupService.setAutoBackup(true);
        }

        await message('Backup folder selected successfully!', { title: 'Success', type: 'info' });
      }
    } catch (e: any) {
      console.error(e);
      await message('Failed to select folder', { title: 'Error', type: 'error' });
    }
  };

  const handleToggleAutoBackup = async () => {
    const newVal = !autoBackup;
    setAutoBackup(newVal);
    await backupService.setAutoBackup(newVal);
  };

  const handleBackupNow = async () => {
    setIsBackingUp(true);
    try {
      await backupService.performBackup();
      await message(`Backup successful!`, { title: 'Success', type: 'info' });
    } catch (e: any) {
      await message(`Backup failed: ${e.message}`, { title: 'Error', type: 'error' });
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleRestoreFile = async () => {
    try {
      const selected = await open({
        directory: false,
        multiple: false,
        filters: [{ name: 'SQLite Database', extensions: ['db'] }],
        title: 'Select Database to Restore'
      });

      if (selected && typeof selected === 'string') {
        const confirmed = await ask(`Are you sure you want to restore from:\n${selected}\n\nThis will OVERWRITE your current data.`, {
          title: 'Confirm Restore',
          type: 'warning'
        });

        if (confirmed) {
          setIsRestoring(true);
          try {
            await backupService.restoreFrom(selected);
            await message('Restore successful! The app will reload.', { title: 'Success', type: 'info' });
            window.location.reload();
          } catch (e: any) {
            await message(`Restore failed: ${e.message}`, { title: 'Error', type: 'error' });
            setIsRestoring(false);
          }
        }
      }
    } catch (e: any) {
      await message('Failed to select file', { title: 'Error', type: 'error' });
    }
  };

  const handleCloudRestore = async () => {
    if (!cloudLink) return;
    try {
      const confirmed = await ask('This will overwrite your current database. Are you sure?', { title: 'Disaster Recovery', type: 'warning' });
      if (!confirmed) return;

      setIsCloudRestoring(true);
      await backupService.restoreFromCloudLink(cloudLink);
      await message('Restored successfully from Cloud Link! The app will reload.', { title: 'Success', type: 'info' });
      window.location.reload();
    } catch (e: any) {
      await message(`Cloud Restore failed: ${e.message}`, { title: 'Error', type: 'error' });
      setIsCloudRestoring(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const loadedSettings = await dbService.getCompanySettings();
        if (loadedSettings) {
          setSettings(loadedSettings);
        }
        const loadedStamp = await dbService.getStampSignature();
        if (loadedStamp) {
          setPreviewUrl(loadedStamp);
        }
        const loadedLogo = await dbService.getCompanyLogo();
        if (loadedLogo) {
          setLogoPreviewUrl(loadedLogo);
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      await dbService.saveCompanySettings(settings);
      await message('Company settings have been saved successfully!', {
        title: 'Success',
        type: 'info'
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      await message('Failed to save settings. Please try again.', {
        title: 'Error',
        type: 'error'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      await message('Please upload a valid image file (PNG, JPEG, or JPG)', {
        title: 'Invalid File',
        type: 'error'
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      await message('File size should be less than 5MB. Please choose a smaller file.', {
        title: 'File Too Large',
        type: 'error'
      });
      return;
    }

    setIsUploadingStamp(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const dataUrl = event.target?.result as string;
        setPreviewUrl(dataUrl);
        await dbService.saveStampSignature(dataUrl);
        await message('Stamp and signature have been uploaded successfully!', {
          title: 'Success',
          type: 'info'
        });
      } catch (error) {
        console.error('Error uploading stamp:', error);
        await message('Failed to upload stamp and signature. Please try again.', {
          title: 'Error',
          type: 'error'
        });
      } finally {
        setIsUploadingStamp(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      await message('Please upload a valid image file (PNG, JPEG, or JPG)', {
        title: 'Invalid File',
        type: 'error'
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      await message('File size should be less than 5MB. Please choose a smaller file.', {
        title: 'File Too Large',
        type: 'error'
      });
      return;
    }

    setIsUploadingLogo(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const dataUrl = event.target?.result as string;
        setLogoPreviewUrl(dataUrl);
        await dbService.saveCompanyLogo(dataUrl);
        await message('Company logo has been uploaded successfully!', {
          title: 'Success',
          type: 'info'
        });
      } catch (error) {
        console.error('Error uploading logo:', error);
        await message('Failed to upload company logo. Please try again.', {
          title: 'Error',
          type: 'error'
        });
      } finally {
        setIsUploadingLogo(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="max-w-4xl mx-auto p-2 sm:p-4 md:p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm transition-colors duration-200">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2 transition-colors duration-200">Company Settings</h1>
        <p className="text-gray-600 dark:text-gray-400 transition-colors duration-200">Manage bank details and upload stamp & signature</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 size={48} className="text-blue-600 animate-spin" />
          <span className="ml-3 text-gray-600 dark:text-gray-400 transition-colors duration-200">Loading settings...</span>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4 transition-colors duration-200">Bank Account Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200 mb-2">
                  Account Name
                </label>
                <input
                  type="text"
                  value={settings.accountName}
                  onChange={(e) => setSettings({ ...settings, accountName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200 mb-2">
                  Bank Name
                </label>
                <input
                  type="text"
                  value={settings.bankName}
                  onChange={(e) => setSettings({ ...settings, bankName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors duration-200"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200 mb-2">
                    IFSC Code
                  </label>
                  <input
                    type="text"
                    value={settings.ifscCode}
                    onChange={(e) => setSettings({ ...settings, ifscCode: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200 mb-2">
                    Account Number
                  </label>
                  <input
                    type="text"
                    value={settings.accountNumber}
                    onChange={(e) => setSettings({ ...settings, accountNumber: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors duration-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200 mb-2">
                  GST Number
                </label>
                <input
                  type="text"
                  value={settings.gstNumber}
                  onChange={(e) => setSettings({ ...settings, gstNumber: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors duration-200"
                />
              </div>

              <button
                onClick={handleSaveSettings}
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-all duration-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    Save Settings
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 transition-colors duration-200">Local Backup & Sync</h2>
                <p className="text-sm text-gray-600 dark:text-gray-300 transition-colors duration-200">
                  Configure a local folder (e.g., Google Drive, Dropbox) for automatic backups.
                </p>
              </div>
              {backupPath ? (
                <span className="flex items-center gap-2 text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900 px-3 py-1 rounded-full text-sm font-medium">
                  <Check size={16} /> Active
                </span>
              ) : (
                <span className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900 px-3 py-1 rounded-full text-sm font-medium">
                  <AlertCircle size={16} /> Not Configured
                </span>
              )}
            </div>

            <div className="space-y-6">
              <div className="grid gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Backup Location</label>
                  <div className="flex gap-2">
                    <div className="flex-1 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-300 truncate flex items-center">
                      <Folder size={18} className="mr-2 opacity-50" />
                      {backupPath || 'No folder selected'}
                    </div>
                    <button
                      onClick={handleSelectBackupFolder}
                      className="px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors font-medium flex items-center gap-2"
                    >
                      <SettingsIcon size={18} /> Change
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                  <div
                    onClick={handleToggleAutoBackup}
                    className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${autoBackup ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                  >
                    <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${autoBackup ? 'translate-x-6' : 'translate-x-0'}`} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 dark:text-gray-200">Auto-Backup on Save</p>
                    <p className="text-xs text-gray-500">Automatically creates a backup/sync copy whenever you save data.</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                <button
                  onClick={handleBackupNow}
                  disabled={isBackingUp || !backupPath}
                  className="flex items-center gap-2 px-6 py-3 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isBackingUp ? <Loader2 size={20} className="animate-spin" /> : <HardDrive size={20} />}
                  Backup Now
                </button>

                <button
                  onClick={handleRestoreFile}
                  disabled={isRestoring}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-600 dark:bg-gray-500 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 ml-auto"
                >
                  {isRestoring ? <Loader2 size={20} className="animate-spin" /> : <FileUp size={20} />}
                  Restore from File
                </button>
              </div>
            </div>
          </div>

          <div className="bg-red-50 dark:bg-red-900/10 p-6 rounded-lg border border-red-100 dark:border-red-900/30">
            <h2 className="text-xl font-semibold text-red-800 dark:text-red-200 mb-4 flex items-center gap-2">
              <CloudOff size={24} /> Disaster Recovery
            </h2>
            <p className="text-sm text-red-600 dark:text-red-300 mb-4">
              Pull your database directly from a Google Drive **Folder Link** (containing <code>invoices.db</code>) or a direct File Link.
              Once set, you can use the 'Recover' button anytime to pull the latest version.
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Paste Google Drive Folder Link or File Link"
                value={cloudLink}
                onChange={(e) => setCloudLink(e.target.value)}
                className="flex-1 px-4 py-2 border border-red-200 dark:border-red-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg text-sm"
              />
              <button
                onClick={handleCloudRestore}
                disabled={isCloudRestoring || !cloudLink}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
              >
                {isCloudRestoring ? <Loader2 size={16} className="animate-spin" /> : <DownloadCloud size={16} />}
                Recover
              </button>
            </div>
            <p className="text-xs text-red-500 mt-2">
              * Note: Please ensure you have selected a backup/download folder above first.
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4 transition-colors duration-200">Company Logo</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 transition-colors duration-200">
              Upload your company logo for the letterhead. This will appear at the top of all generated invoices.
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 px-6 py-3 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-all duration-200 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                  {isUploadingLogo ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload size={20} />
                      Upload Logo
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg"
                    onChange={handleLogoUpload}
                    disabled={isUploadingLogo}
                    className="hidden"
                  />
                </label>
                <span className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-200">
                  Recommended: PNG or JPG format
                </span>
              </div>

              {logoPreviewUrl ? (
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-gray-200 dark:border-gray-600 transition-colors duration-200">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 transition-colors duration-200">Current Company Logo:</p>
                  <div className="flex justify-center items-center p-4 bg-gray-50 dark:bg-gray-700 rounded transition-colors duration-200">
                    <img
                      src={logoPreviewUrl}
                      alt="Company Logo"
                      className="max-w-xs max-h-32 object-contain"
                    />
                  </div>
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-800 p-8 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 text-center transition-colors duration-200">
                  <ImageIcon size={48} className="mx-auto text-gray-400 dark:text-gray-500 mb-3 transition-colors duration-200" />
                  <p className="text-gray-500 dark:text-gray-400 transition-colors duration-200">No company logo uploaded</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-1 transition-colors duration-200">Upload an image to see preview</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4 transition-colors duration-200">Stamp & Signature</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 transition-colors duration-200">
              Upload a transparent PNG image containing your stamp and signature. This will appear on all generated invoices.
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 px-6 py-3 bg-green-600 dark:bg-green-500 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-all duration-200 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                  {isUploadingStamp ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload size={20} />
                      Upload Image
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg"
                    onChange={handleFileUpload}
                    disabled={isUploadingStamp}
                    className="hidden"
                  />
                </label>
                <span className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-200">
                  Recommended: PNG with transparent background
                </span>
              </div>

              {previewUrl ? (
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-gray-200 dark:border-gray-600 transition-colors duration-200">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 transition-colors duration-200">Current Stamp & Signature:</p>
                  <div className="flex justify-center items-center p-4 bg-gray-50 dark:bg-gray-700 rounded transition-colors duration-200">
                    <img
                      src={previewUrl}
                      alt="Stamp and Signature"
                      className="max-w-xs max-h-40 object-contain"
                    />
                  </div>
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-800 p-8 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 text-center transition-colors duration-200">
                  <ImageIcon size={48} className="mx-auto text-gray-400 dark:text-gray-500 mb-3 transition-colors duration-200" />
                  <p className="text-gray-500 dark:text-gray-400 transition-colors duration-200">No stamp & signature uploaded</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-1 transition-colors duration-200">Upload an image to see preview</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )
      }
    </div >
  );
}
