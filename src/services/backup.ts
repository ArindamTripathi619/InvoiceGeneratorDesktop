import { invoke } from '@tauri-apps/api/tauri';
import * as path from '@tauri-apps/api/path';
import { dbService } from './db';

const BACKUP_PATH_KEY = 'backup_path';
const AUTO_BACKUP_KEY = 'auto_backup_enabled';
const RECOVERY_LINK_KEY = 'cloud_recovery_link';

export class BackupService {
    private static instance: BackupService;
    private backupPath: string = '';
    private autoBackup: boolean = false;
    private recoveryLink: string = '';
    private debounceTimer: any = null;

    private constructor() {
        this.init();
    }

    public static getInstance(): BackupService {
        if (!BackupService.instance) {
            BackupService.instance = new BackupService();
        }
        return BackupService.instance;
    }

    private async init() {
        this.backupPath = await dbService.getSetting(BACKUP_PATH_KEY) || '';
        this.autoBackup = (await dbService.getSetting(AUTO_BACKUP_KEY)) === 'true';
        this.recoveryLink = await dbService.getSetting(RECOVERY_LINK_KEY) || '';
    }

    public async setBackupPath(path: string) {
        this.backupPath = path;
        await dbService.saveSetting(BACKUP_PATH_KEY, path);
        // Trigger an immediate backup to verify
        await this.performBackup();
    }

    public getBackupPath(): string {
        return this.backupPath;
    }

    public async saveRecoveryLink(link: string) {
        this.recoveryLink = link;
        await dbService.saveSetting(RECOVERY_LINK_KEY, link);
    }

    public getRecoveryLink(): string {
        return this.recoveryLink;
    }

    public async setAutoBackup(enabled: boolean) {
        this.autoBackup = enabled;
        await dbService.saveSetting(AUTO_BACKUP_KEY, String(enabled));
    }

    public isAutoBackupEnabled(): boolean {
        return this.autoBackup;
    }

    public async performBackup(): Promise<string> {
        if (!this.backupPath) {
            throw new Error('Backup path not configured');
        }

        // Construct target filename: invoices.db (Sync Style)
        // We assume the user wants the folder to contain the "live" copy.
        // However, Rust's export_database takes a full path.
        // We need to decide if we strictly use `invoices.db` or allow versioning.
        // The user asked for "dir ... synced ... pull". A single file `invoices.db` is best for sync.

        // We need to append filename to path.
        if (!this.backupPath) throw new Error('No backup path configured');
        const targetPath = await path.join(this.backupPath, 'invoices.db');

        try {
            await invoke('export_database', { targetPath });
        } catch (e) {
            console.error('Database backup failed', e);
            throw e; // Re-throw if DB backup fails
        }

        // Backup Images
        try {
            // dynamic import to avoid circular dependency
            const { dbService } = await import('./db');

            const logo = await dbService.getCompanyLogo();
            if (logo) {
                await this.saveImage(logo, 'company_logo.png');
            }

            const signature = await dbService.getStampSignature();
            if (signature) {
                await this.saveImage(signature, 'stamp_signature.png');
            }
        } catch (e) {
            console.error('Failed to backup images:', e);
            // Don't fail the whole backup if images fail, just log the error
        }
        return targetPath; // Return the path to the backed-up database
    }

    private async saveImage(base64Data: string, fileName: string) {
        try {
            // Remove data URL prefix if present
            const base64 = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;

            // Decode base64
            const binaryString = atob(base64);
            const len = binaryString.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }

            const filePath = await path.join(this.backupPath, fileName);
            await invoke('save_file_content', { path: filePath, content: Array.from(bytes) });
        } catch (e) {
            console.error(`Failed to save image ${fileName}`, e);
        }
    }

    public async restoreFrom(sourcePath: string): Promise<void> {
        // This will overwrite current DB.
        try {
            await invoke('import_database', { sourcePath });
        } catch (e) {
            console.error('Restore failed', e);
            throw e;
        }
    }

    public async restoreFromCloudLink(url?: string): Promise<void> {
        let targetUrl = url;
        if (!targetUrl) {
            targetUrl = this.recoveryLink;
        } else {
            await this.saveRecoveryLink(targetUrl);
        }

        if (!targetUrl) throw new Error('Please provide a Google Drive Link or configure it first.');

        // If backup path is not set, we can't save the file easily.
        // We could default to AppData but user needs to know where it is?
        // Actually, we restore immediately.
        // We can use a temp file in AppData if backupPath is missing?
        // But for "Synced" strategy, backupPath is key.
        if (!this.backupPath) throw new Error('Please select a Backup Folder (Local Sync Folder) first.');

        const tempPath = await path.join(this.backupPath, 'restored_invoices.db');
        console.log('Downloading to:', tempPath);

        try {
            await invoke('download_gdrive_file', { url: targetUrl, outputPath: tempPath });
            console.log('Download complete. Restoring...');
            await this.restoreFrom(tempPath);
        } catch (e) {
            console.error('Cloud restore failed', e);
            throw e;
        }
    }

    // Hook for DB changes
    public notifyChange() {
        if (!this.autoBackup || !this.backupPath) return;

        if (this.debounceTimer) clearTimeout(this.debounceTimer);

        this.debounceTimer = setTimeout(async () => {
            try {
                console.log('Auto-backing up...');
                await this.performBackup();
                console.log('Auto-backup complete');
            } catch (e) {
                console.error('Auto-backup failed', e);
            }
        }, 5000); // 5 second debounce
    }
}

export const backupService = BackupService.getInstance();
