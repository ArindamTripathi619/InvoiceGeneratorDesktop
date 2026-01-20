import Database from 'tauri-plugin-sql-api';
import { createDir, exists, BaseDirectory } from '@tauri-apps/api/fs';
import { backupService } from './backup';
import { getCompanySettings, getAllCustomers } from '../utils/tauriStorage';

const DB_NAME = 'sqlite:invoices.db';

export class DatabaseService {
    private static instance: DatabaseService;
    private db: Database | null = null;

    private constructor() { }

    public static getInstance(): DatabaseService {
        if (!DatabaseService.instance) {
            DatabaseService.instance = new DatabaseService();
        }
        return DatabaseService.instance;
    }

    public async init(): Promise<void> {
        if (this.db) return;

        // Ensure generated directory exists for PDFs
        try {
            const hasDir = await exists('generated', { dir: BaseDirectory.AppData });
            if (!hasDir) {
                await createDir('generated', { dir: BaseDirectory.AppData, recursive: true });
            }
        } catch (e) {
            console.error('Error creating generated directory:', e);
        }

        this.db = await Database.load(DB_NAME);
        await this.initSchema();
        await this.migrateFromJsonIfNeeded();
    }

    private async initSchema(): Promise<void> {
        if (!this.db) throw new Error('Database not initialized');

        // Settings Table
        await this.db.execute(`
            CREATE TABLE IF NOT EXISTS settings(
                key TEXT PRIMARY KEY,
                value TEXT
            );
        `);

        // Customers Table
        await this.db.execute(`
            CREATE TABLE IF NOT EXISTS customers(
                id TEXT PRIMARY KEY,
                company_name TEXT,
                gst_number TEXT,
                pan_number TEXT,
                address_line1 TEXT,
                address_line2 TEXT,
                address_line3 TEXT,
                city TEXT,
                state TEXT,
                pincode TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Invoices Table
        await this.db.execute(`
            CREATE TABLE IF NOT EXISTS invoices(
                invoice_number TEXT PRIMARY KEY,
                financial_year TEXT,
                customer_id TEXT,
                invoice_date TEXT,
                grand_total REAL,
                status TEXT, -- 'DRAFT', 'GENERATED'
                json_data TEXT, -- Keep for legacy/backup during migration
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                work_order_reference TEXT,
                work_order_date TEXT,
                FOREIGN KEY(customer_id) REFERENCES customers(id)
            );
        `);

        // Invoice Items Table (Relational)
        await this.db.execute(`
            CREATE TABLE IF NOT EXISTS invoice_items(
                id TEXT PRIMARY KEY,
                invoice_number TEXT,
                serial_number INTEGER,
                description TEXT,
                hsn_sac_code TEXT,
                rate REAL,
                quantity REAL,
                unit TEXT,
                amount REAL,
                FOREIGN KEY(invoice_number) REFERENCES invoices(invoice_number) ON DELETE CASCADE
            );
        `);
    }

    private async migrateFromJsonIfNeeded(): Promise<void> {
        if (!this.db) return;

        // 1. Initial Migration (Files to DB)
        const migrated = await this.db.select<any[]>('SELECT value FROM settings WHERE key = "migration_complete"');
        if (migrated.length === 0) {
            console.log('Starting migration from legacy storage...');
            try {
                const { customerService } = await import('./customerService');
                const customers = await getAllCustomers();
                for (const customer of customers) {
                    await customerService.upsertCustomer(customer);
                }
                const companySettings = await getCompanySettings();
                await this.saveSetting('company_settings', JSON.stringify(companySettings));
                await this.db.execute('INSERT INTO settings (key, value) VALUES (?, ?)', ['migration_complete', 'true']);
                console.log('Initial migration completed.');
            } catch (error) {
                console.error('Initial migration failed:', error);
            }
        }

        // 2. Relational Migration (JSON Blobs to invoice_items table)
        const relationalMigrated = await this.db.select<any[]>('SELECT value FROM settings WHERE key = "relational_migration_complete"');
        if (relationalMigrated.length === 0) {
            console.log('Starting relational migration (JSON to Table)...');
            try {
                const invoices = await this.db.select<any[]>('SELECT invoice_number, json_data FROM invoices');
                for (const inv of invoices) {
                    if (inv.json_data) {
                        const data = JSON.parse(inv.json_data);
                        if (data.lineItems && Array.isArray(data.lineItems)) {
                            for (const item of data.lineItems) {
                                // Check if item already exists to avoid duplicates if migration partially ran
                                const existing = await this.db.select<any[]>('SELECT id FROM invoice_items WHERE id = $1', [item.id]);
                                if (existing.length === 0) {
                                    await this.db.execute(
                                        `INSERT INTO invoice_items(id, invoice_number, serial_number, description, hsn_sac_code, rate, quantity, unit, amount)
                                         VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
                                        [item.id, inv.invoice_number, item.serialNumber, item.description, item.hsnSacCode, item.rate, item.quantity, item.unit, item.amount]
                                    );
                                }
                            }
                        }
                    }
                }
                await this.db.execute('INSERT INTO settings (key, value) VALUES (?, ?)', ['relational_migration_complete', 'true']);
                console.log('Relational migration completed.');
            } catch (error) {
                console.error('Relational migration failed:', error);
            }
        }
    }

    // --- Data Access Methods ---

    public async getDb(): Promise<Database> {
        if (!this.db) await this.init();
        return this.db!;
    }

    public async getSetting(key: string): Promise<string | null> {
        const db = await this.getDb();
        const result = await db.select<any[]>('SELECT value FROM settings WHERE key = $1', [key]);
        return result.length > 0 ? result[0].value : null;
    }

    public async saveSetting(key: string, value: string): Promise<void> {
        const db = await this.getDb();
        await db.execute('INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT(key) DO UPDATE SET value=excluded.value', [key, value]);
        backupService.notifyChange();
    }

    // --- Convenience Wrappers for Settings ---

    public async getCompanySettings(): Promise<any> {
        const val = await this.getSetting('company_settings');
        return val ? JSON.parse(val) : null;
    }

    public async saveCompanySettings(settings: any): Promise<void> {
        await this.saveSetting('company_settings', JSON.stringify(settings));
    }

    public async getStampSignature(): Promise<string | null> {
        return await this.getSetting('stamp_signature');
    }

    public async saveStampSignature(dataUrl: string): Promise<void> {
        await this.saveSetting('stamp_signature', dataUrl);
    }

    public async getCompanyLogo(): Promise<string | null> {
        return await this.getSetting('company_logo');
    }

    public async saveCompanyLogo(dataUrl: string): Promise<void> {
        await this.saveSetting('company_logo', dataUrl);
    }
}

export const dbService = DatabaseService.getInstance();
