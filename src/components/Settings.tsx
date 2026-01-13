import { useState, useEffect } from 'react';
import { Upload, Save, Image as ImageIcon, Loader2, Cloud, RefreshCw, Check, Link as LinkIcon, DownloadCloud } from 'lucide-react';
import { message, ask } from '@tauri-apps/api/dialog';
import { open as openUrl } from '@tauri-apps/api/shell';
import { CompanySettings } from '../types/invoice';
import { saveCompanySettings, getCompanySettings, saveStampSignature, getStampSignature, saveCompanyLogo, getCompanyLogo } from '../utils/tauriStorage';
import { driveService } from '../services/drive';

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

  // Drive State
  const [driveConnected, setDriveConnected] = useState(false);
  const [verificationData, setVerificationData] = useState<{ user_code: string, verification_url: string } | null>(null);
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [isConnectingDrive, setIsConnectingDrive] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [backups, setBackups] = useState<any[]>([]);
  const [showBackups, setShowBackups] = useState(false);

  useEffect(() => {
    const checkDriveAuth = async () => {
      const isAuth_ = await driveService.loadToken();
      setDriveConnected(isAuth_);
    };
    checkDriveAuth();
  }, []);

  const handleConnectDrive = async () => {
    if (!clientId) {
      await message('Please enter a Google Cloud Client ID.', { title: 'Missing Credentials', type: 'error' });
      return;
    }

    setIsConnectingDrive(true);
    driveService.setCredentials(clientId, clientSecret);

    try {
      const data = await driveService.startDeviceAuth();
      setVerificationData({
        user_code: data.user_code,
        verification_url: data.verification_url
      });

      // Open URL automatically if possible
      await openUrl(data.verification_url);

      // Poll
      const token = await driveService.pollDeviceToken(data.device_code, data.interval);
      if (token) {
        setDriveConnected(true);
        setVerificationData(null);
        await message('Successfully connected to Google Drive!', { title: 'Connected', type: 'info' });
      }
    } catch (error: any) {
      console.error('Drive auth error:', error);
      await message(`Connection failed: ${error.message}`, { title: 'Error', type: 'error' });
      setVerificationData(null);
    } finally {
      setIsConnectingDrive(false);
    }
  };

  const handleDisconnectDrive = async () => {
    await driveService.logout();
    setDriveConnected(false);
    setVerificationData(null);
    setShowBackups(false);
  };

  const handleBackup = async () => {
    setIsBackingUp(true);
    try {
      await driveService.uploadDatabase();
      await message('Database backup uploaded successfully!', { title: 'Success', type: 'info' });
    } catch (error: any) {
      console.error('Backup error:', error);
      await message(`Backup failed: ${error.message}`, { title: 'Error', type: 'error' });
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleFetchBackups = async () => {
    try {
      const files = await driveService.listBackups();
      setBackups(files);
      setShowBackups(true);
    } catch (error: any) {
      await message(`Failed to list backups: ${error.message}`, { title: 'Error', type: 'error' });
    }
  };

  const handleRestoreBackup = async (fileId: string) => {
    const confirmed = await ask(`Are you sure you want to restore this backup?\n\nThis will OVERWRITE your current data. This action cannot be undone.`, {
      title: 'Confirm Restore',
      type: 'warning'
    });

    if (!confirmed) return;

    setIsRestoring(true);
    try {
      await driveService.restoreBackup(fileId);
      await message('Data restored successfully! The application will restart to apply changes.', { title: 'Restored', type: 'info' });
      // Ideally restart app. user must restart manually for now.
      window.location.reload();
    } catch (error: any) {
      console.error('Restore error:', error);
      await message(`Restore failed: ${error.message}`, { title: 'Error', type: 'error' });
    } finally {
      setIsRestoring(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const loadedSettings = await getCompanySettings();
        setSettings(loadedSettings);
        const loadedStamp = await getStampSignature();
        if (loadedStamp) {
          setPreviewUrl(loadedStamp);
        }
        const loadedLogo = await getCompanyLogo();
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
      await saveCompanySettings(settings);
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
        await saveStampSignature(dataUrl);
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
        await saveCompanyLogo(dataUrl);
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
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 transition-colors duration-200">Google Drive Backup</h2>
                <p className="text-sm text-gray-600 dark:text-gray-300 transition-colors duration-200">
                  Connect your Google Drive to enable cloud backups and restore data.
                </p>
              </div>
              {driveConnected && <span className="flex items-center gap-2 text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900 px-3 py-1 rounded-full text-sm font-medium"><Check size={16} /> Connected</span>}
            </div>

            <div className="space-y-6">
              {!driveConnected && !verificationData && (
                <div className="space-y-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400">To authorize, you need a Google Cloud Client ID (Desktop type).</p>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Client ID</label>
                    <input
                      type="text"
                      value={clientId}
                      onChange={(e) => setClientId(e.target.value)}
                      placeholder="xxxxxxxxxxxx-xxxxxxxxxxxxxxxx.apps.googleusercontent.com"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Client Secret (Optional)</label>
                    <input
                      type="password"
                      value={clientSecret}
                      onChange={(e) => setClientSecret(e.target.value)}
                      placeholder="Client Secret"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <button
                    onClick={handleConnectDrive}
                    disabled={isConnectingDrive || !clientId}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isConnectingDrive ? <Loader2 size={20} className="animate-spin" /> : <LinkIcon size={20} />}
                    Connect Google Drive
                  </button>
                </div>
              )}

              {verificationData && (
                <div className="bg-yellow-50 dark:bg-yellow-900/30 p-4 rounded-lg border border-yellow-200 dark:border-yellow-700">
                  <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Action Required</h3>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-3">
                    Please visit <a href={verificationData.verification_url} target="_blank" className="underline font-bold" onClick={(e) => { e.preventDefault(); openUrl(verificationData.verification_url); }}>{verificationData.verification_url}</a> and enter the code below:
                  </p>
                  <div className="text-2xl font-mono font-bold text-center tracking-widest bg-white dark:bg-gray-800 p-3 rounded border border-gray-300 dark:border-gray-600 select-all">
                    {verificationData.user_code}
                  </div>
                  <div className="mt-4 flex justify-center">
                    <Loader2 className="animate-spin text-yellow-600" />
                    <span className="ml-2 text-sm text-yellow-600">Waiting for authorization...</span>
                  </div>
                </div>
              )}

              {driveConnected && (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-4">
                    <button
                      onClick={handleBackup}
                      disabled={isBackingUp}
                      className="flex items-center gap-2 px-6 py-3 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {isBackingUp ? <Loader2 size={20} className="animate-spin" /> : <Cloud size={20} />}
                      Backup Now
                    </button>

                    <button
                      onClick={handleFetchBackups}
                      className="flex items-center gap-2 px-6 py-3 bg-gray-600 dark:bg-gray-500 text-white rounded-lg hover:bg-gray-700"
                    >
                      <RefreshCw size={20} />
                      List Backups
                    </button>

                    <button
                      onClick={handleDisconnectDrive}
                      className="flex items-center gap-2 px-6 py-3 border border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg ml-auto"
                    >
                      Disconnect
                    </button>
                  </div>

                  {showBackups && (
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden mt-4">
                      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700 font-medium">
                        Available Backups
                      </div>
                      {backups.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">No backups found.</div>
                      ) : (
                        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                          {backups.map(file => (
                            <li key={file.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                              <div>
                                <p className="font-medium text-gray-800 dark:text-gray-200">{file.name}</p>
                                <p className="text-xs text-gray-500">{new Date(file.createdTime).toLocaleString()} • {(file.size / 1024).toFixed(1)} KB</p>
                              </div>
                              <button
                                onClick={() => handleRestoreBackup(file.id)}
                                disabled={isRestoring}
                                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium flex items-center gap-1"
                              >
                                {isRestoring ? <Loader2 size={16} className="animate-spin" /> : <DownloadCloud size={16} />}
                                Restore
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
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
      )}
    </div>
  );
}
