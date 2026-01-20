import { dbService } from './db';
import { Invoice } from '../types/invoice';
import { backupService } from './backup';

export class InvoiceService {
    private static instance: InvoiceService;

    private constructor() { }

    public static getInstance(): InvoiceService {
        if (!InvoiceService.instance) {
            InvoiceService.instance = new InvoiceService();
        }
        return InvoiceService.instance;
    }

    public async saveInvoice(invoice: Invoice): Promise<void> {
        const db = await dbService.getDb();

        // 1. Save main invoice record
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
                invoice.customer.id || null,
                invoice.invoiceDate,
                invoice.grandTotal,
                'GENERATED',
                invoice.workOrderReference || '',
                invoice.workOrderDate || '',
                JSON.stringify({ ...invoice, id: invoice.invoiceNumber }) // Keep for backward compatibility/backup
            ]
        );

        // 2. Save line items relationally
        // First clear existing items for this invoice number (transactional-ish)
        await db.execute('DELETE FROM invoice_items WHERE invoice_number = $1', [invoice.invoiceNumber]);

        for (const item of invoice.lineItems) {
            await db.execute(
                `INSERT INTO invoice_items(id, invoice_number, serial_number, description, hsn_sac_code, rate, quantity, unit, amount)
                 VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
                [item.id, invoice.invoiceNumber, item.serialNumber, item.description, item.hsnSacCode, item.rate, item.quantity, item.unit, item.amount]
            );
        }

        backupService.notifyChange();
    }

    public async getAllInvoices(): Promise<Invoice[]> {
        const db = await dbService.getDb();
        const rows = await db.select<any[]>('SELECT * FROM invoices ORDER BY created_at DESC');

        const invoices: Invoice[] = [];

        for (const row of rows) {
            // First try to load from relational table
            const items = await db.select<any[]>('SELECT * FROM invoice_items WHERE invoice_number = $1 ORDER BY serial_number', [row.invoice_number]);

            let invoice: Invoice;
            if (items.length > 0) {
                // Construct from relational data
                const fallbackData = JSON.parse(row.json_data);
                invoice = {
                    ...fallbackData,
                    invoiceNumber: row.invoice_number,
                    id: row.invoice_number,
                    lineItems: items.map(p => ({
                        id: p.id,
                        serialNumber: p.serial_number,
                        description: p.description,
                        hsnSacCode: p.hsn_sac_code,
                        rate: p.rate,
                        quantity: p.quantity,
                        unit: p.unit,
                        amount: p.amount
                    }))
                };
            } else {
                // Fallback to JSON blob if no relational items found (shouldn't happen after migration)
                invoice = JSON.parse(row.json_data);
                invoice.id = row.invoice_number;
            }
            invoices.push(invoice);
        }

        return invoices;
    }

    public async deleteInvoice(invoiceNumber: string): Promise<void> {
        const db = await dbService.getDb();
        await db.execute('DELETE FROM invoices WHERE invoice_number = $1', [invoiceNumber]);
        backupService.notifyChange();
    }

    public async getDraftInvoice(): Promise<Partial<Invoice> | null> {
        const val = await dbService.getSetting('draft_invoice');
        return val ? JSON.parse(val) : null;
    }

    public async saveDraftInvoice(invoice: Partial<Invoice>): Promise<void> {
        await dbService.saveSetting('draft_invoice', JSON.stringify(invoice));
    }

    public async clearDraftInvoice(): Promise<void> {
        const db = await dbService.getDb();
        await db.execute('DELETE FROM settings WHERE key = "draft_invoice"');
    }
}

export const invoiceService = InvoiceService.getInstance();
