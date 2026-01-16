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
        const n1 = v1.split('-')[0].split('.').map(Number);
        const n2 = v2.split('-')[0].split('.').map(Number);
        const length = Math.max(n1.length, n2.length);

        for (let i = 0; i < length; i++) {
            const num1 = n1[i] || 0;
            const num2 = n2[i] || 0;
            if (num1 > num2) return 1;
            if (num1 < num2) return -1;
        }

        // Handle pre-release tags (v1.0.0-beta < v1.0.0)
        // Note: Simple logic here: if one has a tag and the other doesn't, 
        // the one without a tag is newer (e.g. 1.0.0 vs 1.0.0-alpha)
        if (v1.includes('-') && !v2.includes('-')) return -1;
        if (!v1.includes('-') && v2.includes('-')) return 1;

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
