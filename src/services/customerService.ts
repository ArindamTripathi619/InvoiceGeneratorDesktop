import { dbService } from './db';
import { Customer } from '../types/invoice';
import { backupService } from './backup';

export class CustomerService {
    private static instance: CustomerService;

    private constructor() { }

    public static getInstance(): CustomerService {
        if (!CustomerService.instance) {
            CustomerService.instance = new CustomerService();
        }
        return CustomerService.instance;
    }

    public async getAllCustomers(): Promise<Customer[]> {
        const db = await dbService.getDb();
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

    public async upsertCustomer(customer: Customer): Promise<void> {
        const db = await dbService.getDb();
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
        const db = await dbService.getDb();
        await db.execute('DELETE FROM customers WHERE id = $1', [id]);
        backupService.notifyChange();
    }
}

export const customerService = CustomerService.getInstance();
