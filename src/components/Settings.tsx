import { useState, useEffect } from 'react';
import { Upload, Save, Image as ImageIcon, Loader2 } from 'lucide-react';
import { message } from '@tauri-apps/api/dialog';
import { CompanySettings } from '../types/invoice';
import { saveCompanySettings, getCompanySettings, saveStampSignature, getStampSignature, saveCompanyLogo, getCompanyLogo } from '../utils/tauriStorage';

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
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-sm">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Company Settings</h1>
        <p className="text-gray-600">Manage bank details and upload stamp & signature</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 size={48} className="text-blue-600 animate-spin" />
          <span className="ml-3 text-gray-600">Loading settings...</span>
        </div>
      ) : (
        <div className="space-y-8">
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Bank Account Details</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account Name
              </label>
              <input
                type="text"
                value={settings.accountName}
                onChange={(e) => setSettings({ ...settings, accountName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bank Name
              </label>
              <input
                type="text"
                value={settings.bankName}
                onChange={(e) => setSettings({ ...settings, bankName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  IFSC Code
                </label>
                <input
                  type="text"
                  value={settings.ifscCode}
                  onChange={(e) => setSettings({ ...settings, ifscCode: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Number
                </label>
                <input
                  type="text"
                  value={settings.accountNumber}
                  onChange={(e) => setSettings({ ...settings, accountNumber: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                GST Number
              </label>
              <input
                type="text"
                value={settings.gstNumber}
                onChange={(e) => setSettings({ ...settings, gstNumber: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <button
              onClick={handleSaveSettings}
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Company Logo</h2>
          <p className="text-sm text-gray-600 mb-4">
            Upload your company logo for the letterhead. This will appear at the top of all generated invoices.
          </p>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
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
              <span className="text-sm text-gray-600">
                Recommended: PNG or JPG format
              </span>
            </div>

            {logoPreviewUrl ? (
              <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
                <p className="text-sm font-medium text-gray-700 mb-3">Current Company Logo:</p>
                <div className="flex justify-center items-center p-4 bg-gray-50 rounded">
                  <img
                    src={logoPreviewUrl}
                    alt="Company Logo"
                    className="max-w-xs max-h-32 object-contain"
                  />
                </div>
              </div>
            ) : (
              <div className="bg-white p-8 rounded-lg border-2 border-dashed border-gray-300 text-center">
                <ImageIcon size={48} className="mx-auto text-gray-400 mb-3" />
                <p className="text-gray-500">No company logo uploaded</p>
                <p className="text-sm text-gray-400 mt-1">Upload an image to see preview</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Stamp & Signature</h2>
          <p className="text-sm text-gray-600 mb-4">
            Upload a transparent PNG image containing your stamp and signature. This will appear on all generated invoices.
          </p>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
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
              <span className="text-sm text-gray-600">
                Recommended: PNG with transparent background
              </span>
            </div>

            {previewUrl ? (
              <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
                <p className="text-sm font-medium text-gray-700 mb-3">Current Stamp & Signature:</p>
                <div className="flex justify-center items-center p-4 bg-gray-50 rounded">
                  <img
                    src={previewUrl}
                    alt="Stamp and Signature"
                    className="max-w-xs max-h-40 object-contain"
                  />
                </div>
              </div>
            ) : (
              <div className="bg-white p-8 rounded-lg border-2 border-dashed border-gray-300 text-center">
                <ImageIcon size={48} className="mx-auto text-gray-400 mb-3" />
                <p className="text-gray-500">No stamp & signature uploaded</p>
                <p className="text-sm text-gray-400 mt-1">Upload an image to see preview</p>
              </div>
            )}
          </div>
        </div>
        </div>
      )}
    </div>
  );
}
