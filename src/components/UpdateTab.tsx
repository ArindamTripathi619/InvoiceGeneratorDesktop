import React, { useState, useEffect } from 'react';
import { RefreshCw, Download, ExternalLink, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { updateService, UpdateInfo } from '../services/updateService';
import { message } from '@tauri-apps/api/dialog';

export const UpdateTab: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
    const [error, setError] = useState<string | null>(null);

    const checkUpdates = async () => {
        setLoading(true);
        setError(null);
        try {
            const info = await updateService.checkUpdates();
            setUpdateInfo(info);
        } catch (err: any) {
            setError(err.message || 'Failed to check for updates');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkUpdates();
    }, []);

    const handleUpdate = async () => {
        if (!updateInfo) return;

        try {
            setUpdating(true);
            await updateService.downloadAndInstall(updateInfo.downloadUrl, updateInfo.assetName);
            // On Windows, the installer usually takes over.
            await message('The update has been downloaded and the installer will now start. The application will close to complete the update.',
                { title: 'Update Ready', type: 'info' });
        } catch (err: any) {
            await message(`Update failed: ${err.message}`, { title: 'Error', type: 'error' });
        } finally {
            setUpdating(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm transition-colors duration-200">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">App Updates</h1>
                    <p className="text-gray-600 dark:text-gray-400">Handle application updates directly from GitHub</p>
                </div>
                <button
                    onClick={checkUpdates}
                    disabled={loading || updating}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : <RefreshCw size={20} />}
                    Check Now
                </button>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 text-red-700 dark:text-red-400 flex items-center gap-3">
                    <AlertTriangle size={20} />
                    <p>{error}</p>
                </div>
            )}

            {updateInfo && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-100 dark:border-gray-600">
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Current Version</p>
                            <p className="text-xl font-bold text-gray-800 dark:text-gray-100">v{updateInfo.currentVersion}</p>
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-100 dark:border-gray-600">
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Latest Version</p>
                            <div className="flex items-center gap-2">
                                <p className="text-xl font-bold text-gray-800 dark:text-gray-100">v{updateInfo.latestVersion}</p>
                                {!updateInfo.hasUpdate && (
                                    <span className="flex items-center gap-1 text-xs bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full font-medium">
                                        <CheckCircle size={12} />
                                        Up to date
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {updateInfo.hasUpdate && (
                        <div className="p-6 border-2 border-blue-500 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/10 rounded-xl">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <h3 className="text-lg font-bold text-blue-800 dark:text-blue-300">New Version Available!</h3>
                                    <p className="text-blue-600 dark:text-blue-400">Version {updateInfo.latestVersion} is ready to download.</p>
                                </div>
                                <button
                                    onClick={handleUpdate}
                                    disabled={updating}
                                    className="flex items-center justify-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                                >
                                    {updating ? <Loader2 className="animate-spin" size={20} /> : <Download size={20} />}
                                    {updating ? 'Processing Update...' : 'Download & Install Now'}
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="mt-8">
                        <div className="flex items-center justify-between mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">
                            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Release Notes</h3>
                            <button
                                onClick={() => updateService.openReleasePage(updateInfo.downloadUrl)}
                                className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                            >
                                <ExternalLink size={14} />
                                View on GitHub
                            </button>
                        </div>
                        <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-400 whitespace-pre-wrap p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg font-mono text-sm border border-gray-100 dark:border-gray-600">
                            {updateInfo.releaseNotes || 'No release notes provided.'}
                        </div>
                    </div>
                </div>
            )}

            {!updateInfo && !loading && !error && (
                <div className="text-center py-20 bg-gray-50 dark:bg-gray-700/30 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700">
                    <RefreshCw size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">Click Check Now to fetch latest version info.</p>
                </div>
            )}
        </div>
    );
};
