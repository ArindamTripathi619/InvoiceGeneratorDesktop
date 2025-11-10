import { BaseDirectory, createDir, exists, readTextFile, writeTextFile } from '@tauri-apps/api/fs';
import { Invoice, Customer, CompanySettings } from '../types/invoice';

const STORAGE_FILES = {
  DRAFT_INVOICE: 'draft_invoice.json',
  INVOICES: 'invoices.json',
  CUSTOMERS: 'customers.json',
  COMPANY_SETTINGS: 'company_settings.json',
  STAMP_SIGNATURE: 'stamp_signature.txt',
  COMPANY_LOGO: 'company_logo.txt',
};

// Ensure storage directory exists
async function ensureStorageDir(): Promise<void> {
  try {
    const dirExists = await exists('', { dir: BaseDirectory.AppData });
    if (!dirExists) {
      await createDir('', { dir: BaseDirectory.AppData, recursive: true });
    }
  } catch (error) {
    console.error('Error creating storage directory:', error);
  }
}

// Generic read function
async function readJsonFile<T>(filename: string, defaultValue: T): Promise<T> {
  try {
    await ensureStorageDir();
    const fileExists = await exists(filename, { dir: BaseDirectory.AppData });
    if (!fileExists) {
      return defaultValue;
    }
    const content = await readTextFile(filename, { dir: BaseDirectory.AppData });
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error reading ${filename}:`, error);
    return defaultValue;
  }
}

// Generic write function
async function writeJsonFile<T>(filename: string, data: T): Promise<void> {
  try {
    await ensureStorageDir();
    await writeTextFile(filename, JSON.stringify(data, null, 2), { dir: BaseDirectory.AppData });
  } catch (error) {
    console.error(`Error writing ${filename}:`, error);
    throw error;
  }
}

// Draft Invoice Functions
export const saveDraftInvoice = async (invoice: Partial<Invoice>): Promise<void> => {
  await writeJsonFile(STORAGE_FILES.DRAFT_INVOICE, invoice);
};

export const getDraftInvoice = async (): Promise<Partial<Invoice> | null> => {
  return await readJsonFile<Partial<Invoice> | null>(STORAGE_FILES.DRAFT_INVOICE, null);
};

export const clearDraftInvoice = async (): Promise<void> => {
  await writeJsonFile(STORAGE_FILES.DRAFT_INVOICE, null);
};

// Invoice Functions
export const saveInvoice = async (invoice: Invoice): Promise<void> => {
  const invoices = await getAllInvoices();
  const existingIndex = invoices.findIndex(inv => inv.id === invoice.id);

  if (existingIndex >= 0) {
    invoices[existingIndex] = invoice;
  } else {
    invoice.id = `INV-${Date.now()}`;
    invoices.unshift(invoice);
  }

  await writeJsonFile(STORAGE_FILES.INVOICES, invoices);
};

export const getAllInvoices = async (): Promise<Invoice[]> => {
  return await readJsonFile<Invoice[]>(STORAGE_FILES.INVOICES, []);
};

export const getInvoiceById = async (id: string): Promise<Invoice | null> => {
  const invoices = await getAllInvoices();
  return invoices.find(inv => inv.id === id) || null;
};

export const deleteInvoice = async (id: string): Promise<void> => {
  const invoices = await getAllInvoices();
  const filtered = invoices.filter(inv => inv.id !== id);
  await writeJsonFile(STORAGE_FILES.INVOICES, filtered);
};

// Customer Functions
export const saveCustomer = async (customer: Customer): Promise<void> => {
  const customers = await getAllCustomers();
  const existingIndex = customers.findIndex(c => c.id === customer.id);

  if (existingIndex >= 0) {
    customers[existingIndex] = customer;
  } else {
    customer.id = `CUST-${Date.now()}`;
    customers.push(customer);
  }

  await writeJsonFile(STORAGE_FILES.CUSTOMERS, customers);
};

export const getAllCustomers = async (): Promise<Customer[]> => {
  return await readJsonFile<Customer[]>(STORAGE_FILES.CUSTOMERS, []);
};

export const deleteCustomer = async (id: string): Promise<void> => {
  const customers = await getAllCustomers();
  const filtered = customers.filter(c => c.id !== id);
  await writeJsonFile(STORAGE_FILES.CUSTOMERS, filtered);
};

// Company Settings Functions
export const saveCompanySettings = async (settings: CompanySettings): Promise<void> => {
  await writeJsonFile(STORAGE_FILES.COMPANY_SETTINGS, settings);
};

export const getCompanySettings = async (): Promise<CompanySettings> => {
  return await readJsonFile<CompanySettings>(STORAGE_FILES.COMPANY_SETTINGS, {
    accountName: 'APEX SOLAR',
    bankName: 'STATE BANK OF INDIA',
    ifscCode: 'SBIN0007679',
    accountNumber: '40423372674',
    gstNumber: '19AFZPT2526E1ZV',
  });
};

// Image storage (base64 strings)
export const saveStampSignature = async (dataUrl: string): Promise<void> => {
  try {
    await ensureStorageDir();
    await writeTextFile(STORAGE_FILES.STAMP_SIGNATURE, dataUrl, { dir: BaseDirectory.AppData });
  } catch (error) {
    console.error('Error saving stamp/signature:', error);
    throw error;
  }
};

export const getStampSignature = async (): Promise<string | null> => {
  try {
    await ensureStorageDir();
    const fileExists = await exists(STORAGE_FILES.STAMP_SIGNATURE, { dir: BaseDirectory.AppData });
    if (!fileExists) {
      return null;
    }
    return await readTextFile(STORAGE_FILES.STAMP_SIGNATURE, { dir: BaseDirectory.AppData });
  } catch (error) {
    console.error('Error loading stamp/signature:', error);
    return null;
  }
};

export const saveCompanyLogo = async (dataUrl: string): Promise<void> => {
  try {
    await ensureStorageDir();
    await writeTextFile(STORAGE_FILES.COMPANY_LOGO, dataUrl, { dir: BaseDirectory.AppData });
  } catch (error) {
    console.error('Error saving company logo:', error);
    throw error;
  }
};

export const getCompanyLogo = async (): Promise<string | null> => {
  try {
    await ensureStorageDir();
    const fileExists = await exists(STORAGE_FILES.COMPANY_LOGO, { dir: BaseDirectory.AppData });
    if (!fileExists) {
      return null;
    }
    return await readTextFile(STORAGE_FILES.COMPANY_LOGO, { dir: BaseDirectory.AppData });
  } catch (error) {
    console.error('Error loading company logo:', error);
    return null;
  }
};
