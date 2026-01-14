import Database from 'tauri-plugin-sql-api';
import { createDir, exists, BaseDirectory } from '@tauri-apps/api/fs';
import { Invoice, Customer } from '../types/invoice';
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
                json_data TEXT, --Full JSON blob for LineItems and nested data
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                work_order_reference TEXT,
                work_order_date TEXT,
                FOREIGN KEY(customer_id) REFERENCES customers(id)
            );
        `);
    }

    private async migrateFromJsonIfNeeded(): Promise<void> {
        if (!this.db) return;

        // Check if migration flag exists
        const migrated = await this.db.select<any[]>('SELECT value FROM settings WHERE key = "migration_complete"');
        if (migrated.length > 0) return;

        console.log('Starting migration from JSON storage...');

        try {
            // Migrate Customers
            const customers = await getAllCustomers();
            for (const customer of customers) {
                await this.upsertCustomer(customer);
            }

            // Migrate Settings (e.g. Company Settings)
            const companySettings = await getCompanySettings();
            await this.saveSetting('company_settings', JSON.stringify(companySettings));

            // Mark migration as complete
            await this.db.execute('INSERT INTO settings (key, value) VALUES (?, ?)', ['migration_complete', 'true']);

            console.log('Migration completed successfully.');
        } catch (error) {
            console.error('Migration failed:', error);
        }
    }

    // --- Data Access Methods ---

    public async getDb(): Promise<Database> {
        if (!this.db) await this.init();
        return this.db!;
    }

    public async upsertCustomer(customer: Customer): Promise<void> {
        const db = await this.getDb();
        await db.execute(
            `INSERT INTO customers(id, company_name, gst_number, pan_number, address_line1, address_line2, address_line3, city, state, pincode)
             VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
             ON CONFLICT(id) DO UPDATE SET
             company_name = excluded.company_name, gst_number = excluded.gst_number, pan_number = excluded.pan_number,
             address_line1 = excluded.address_line1, address_line2 = excluded.address_line2, address_line3 = excluded.address_line3,
             city = excluded.city, state = excluded.state, pincode = excluded.pincode`,
            [
                customer.id,
                customer.companyName,
                customer.gstNumber || '',
                customer.panNumber || '',
                customer.addressLine1,
                customer.addressLine2 || '',
                customer.addressLine3 || '',
                customer.city || '',
                customer.state || '',
                customer.pincode || '',
            ]
        );
        backupService.notifyChange();
    }

    public async deleteCustomer(id: string): Promise<void> {
        const db = await this.getDb();
        await db.execute('DELETE FROM customers WHERE id = $1', [id]);
        backupService.notifyChange();
    }

    public async getAllCustomers(): Promise<Customer[]> {
        const db = await this.getDb();
        const rows = await db.select<any[]>('SELECT * FROM customers ORDER BY created_at DESC');
        return rows.map(row => ({
            id: row.id,
            companyName: row.company_name,
            gstNumber: row.gst_number,
            panNumber: row.pan_number,
            addressLine1: row.address_line1,
            addressLine2: row.address_line2,
            addressLine3: row.address_line3,
            city: row.city,
            state: row.state,
            pincode: row.pincode,
        }));
    }

    public async saveInvoice(invoice: Invoice): Promise<void> {
        const db = await this.getDb();

        await db.execute(
            `INSERT INTO invoices(invoice_number, financial_year, customer_id, invoice_date, grand_total, status, work_order_reference, work_order_date, json_data)
             VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)
             ON CONFLICT(invoice_number) DO UPDATE SET
             customer_id = excluded.customer_id, invoice_date = excluded.invoice_date, grand_total = excluded.grand_total,
             status = excluded.status, work_order_reference = excluded.work_order_reference, work_order_date = excluded.work_order_date,
             json_data = excluded.json_data`,
            [
                invoice.invoiceNumber,
                invoice.financialYear,
                invoice.customer.id || null, // Use the customer ID from the invoice object
                invoice.invoiceDate,
                invoice.grandTotal,
                'GENERATED',
                invoice.workOrderReference || '',
                invoice.workOrderDate || '',
                JSON.stringify({ ...invoice, id: invoice.invoiceNumber }) // Ensure ID is in JSON
            ]
        );
        backupService.notifyChange();
    }

    public async getAllInvoices(): Promise<Invoice[]> {
        const db = await this.getDb();
        const rows = await db.select<any[]>('SELECT * FROM invoices ORDER BY created_at DESC');
        return rows.map(row => {
            const invoice = JSON.parse(row.json_data);
            return { ...invoice, id: row.invoice_number }; // Force sync ID with PK
        });
    }

    public async deleteInvoice(invoiceNumber: string): Promise<void> {
        const db = await this.getDb();
        await db.execute('DELETE FROM invoices WHERE invoice_number = $1', [invoiceNumber]);
        backupService.notifyChange();
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

    // --- Convenience Wrappers for Settings & Drafts ---

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

    public async getDraftInvoice(): Promise<Partial<Invoice> | null> {
        const val = await this.getSetting('draft_invoice');
        return val ? JSON.parse(val) : null;
    }

    public async saveDraftInvoice(invoice: Partial<Invoice>): Promise<void> {
        await this.saveSetting('draft_invoice', JSON.stringify(invoice));
    }

    public async clearDraftInvoice(): Promise<void> {
        const db = await this.getDb();
        await db.execute('DELETE FROM settings WHERE key = "draft_invoice"');
    }
}

export const dbService = DatabaseService.getInstance();
