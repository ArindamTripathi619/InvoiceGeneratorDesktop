import { getVersion } from '@tauri-apps/api/app';
import { http, shell, path, fs } from '@tauri-apps/api';

export interface GitHubRelease {
    tag_name: string;
    name: string;
    body: string;
    html_url: string;
    assets: {
        name: string;
        browser_download_url: string;
        size: number;
    }[];
}

export interface UpdateInfo {
    currentVersion: string;
    latestVersion: string;
    hasUpdate: boolean;
    releaseNotes: string;
    downloadUrl: string;
    assetName: string;
}

class UpdateService {
    private GITHUB_API = 'https://api.github.com/repos/ArindamTripathi619/InvoiceGeneratorDesktop/releases/latest';

    async checkUpdates(): Promise<UpdateInfo> {
        try {
            const currentVersion = await getVersion();

            const response = await http.fetch<GitHubRelease>(this.GITHUB_API, {
                method: 'GET',
                headers: {
                    'User-Agent': 'Apex-Solar-Invoice-Generator'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch latest release');
            }

            const latestRelease = response.data;
            const latestVersion = latestRelease.tag_name.replace('v', '');

            // Basic version comparison (v1.0.0 vs 1.1.0)
            const hasUpdate = this.compareVersions(currentVersion, latestVersion) < 0;

            // Find the best asset (looking for .msi or .exe for Windows)
            const asset = latestRelease.assets.find(a =>
                a.name.endsWith('.msi') || a.name.endsWith('.exe')
            );

            return {
                currentVersion,
                latestVersion,
                hasUpdate,
                releaseNotes: latestRelease.body,
                downloadUrl: asset?.browser_download_url || latestRelease.html_url,
                assetName: asset?.name || 'latest-installer.exe'
            };
        } catch (error) {
            console.error('Update check failed:', error);
            throw error;
        }
    }

    private compareVersions(v1: string, v2: string): number {
        const parts1 = v1.split('.').map(Number);
        const parts2 = v2.split('.').map(Number);
        for (let i = 0; i < 3; i++) {
            if ((parts1[i] || 0) > (parts2[i] || 0)) return 1;
            if ((parts1[i] || 0) < (parts2[i] || 0)) return -1;
        }
        return 0;
    }

    async downloadAndInstall(url: string, fileName: string): Promise<void> {
        try {
            const downloadsDir = await path.downloadDir();
            const filePath = await path.join(downloadsDir, fileName);

            // Fetch the executable file
            const response = await http.fetch(url, {
                method: 'GET',
                responseType: http.ResponseType.Binary
            });

            if (!response.ok) {
                throw new Error('Failed to download installer');
            }

            // Write to local downloads folder
            await fs.writeBinaryFile(filePath, new Uint8Array(response.data as ArrayBuffer));

            // Execute the installer and exit
            await shell.open(filePath);

            // We don't relaunch immediately because the installer will usually handle closing/restarting the app
        } catch (error) {
            console.error('Download/Install failed:', error);
            throw error;
        }
    }

    async openReleasePage(url: string) {
        await shell.open(url);
    }
}

export const updateService = new UpdateService();
