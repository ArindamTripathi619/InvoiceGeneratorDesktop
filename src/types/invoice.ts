export interface LineItem {
  id: string;
  serialNumber: number;
  description: string;
  hsnSacCode: string;
  rate: number;
  quantity: number;
  unit: string;
  amount: number;
}

export interface Customer {
  id?: string;
  companyName: string;
  addressLine1: string;
  addressLine2?: string;
  addressLine3?: string;
  city?: string;
  state?: string;
  pincode?: string;
  gstNumber?: string;
  panNumber?: string;
}

export interface Invoice {
  id?: string;
  invoiceNumber: string;
  financialYear: string;
  invoiceDate: string;
  workOrderReference: string;
  workOrderDate?: string;
  customer: Customer;
  lineItems: LineItem[];
  totalBasicAmount: number;
  cgstPercentage: number;
  cgstAmount: number;
  sgstPercentage: number;
  sgstAmount: number;
  grandTotal: number;
  amountInWords: string;
}

export interface CompanySettings {
  id?: string;
  accountName: string;
  bankName: string;
  ifscCode: string;
  accountNumber: string;
  gstNumber: string;
  stampSignatureUrl?: string;
}
