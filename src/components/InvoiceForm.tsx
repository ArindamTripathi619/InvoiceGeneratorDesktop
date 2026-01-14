import { useState, useEffect } from 'react';
import { Download, Save } from 'lucide-react';
import { message } from '@tauri-apps/api/dialog';
import { Invoice, LineItem, Customer } from '../types/invoice';
import { numberToWordsIndian, getCurrentFinancialYear } from '../utils/numberToWords';
import { generateInvoicePDF } from '../services/pdfGenerator';
import { InvoiceHeader } from './invoice/InvoiceHeader';
import { LineItemsTable } from './invoice/LineItemsTable';
import { TaxSummary } from './invoice/TaxSummary';
import { dbService } from '../services/db';

export default function InvoiceForm() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');

  const [invoiceNumber, setInvoiceNumber] = useState<string>('');
  const [financialYear] = useState<string>(getCurrentFinancialYear());
  const [invoiceDate, setInvoiceDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [workOrderReference, setWorkOrderReference] = useState<string>('');
  const [workOrderDate, setWorkOrderDate] = useState<string>('');

  const [companyName, setCompanyName] = useState<string>('');
  const [addressLine1, setAddressLine1] = useState<string>('');
  const [addressLine2, setAddressLine2] = useState<string>('');
  const [addressLine3, setAddressLine3] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [state, setState] = useState<string>('');
  const [pincode, setPincode] = useState<string>('');
  const [gstNumber, setGstNumber] = useState<string>('');
  const [panNumber, setPanNumber] = useState<string>('');

  const [lineItems, setLineItems] = useState<LineItem[]>([
    {
      id: '1',
      serialNumber: 1,
      description: '',
      hsnSacCode: '',
      rate: 0,
      quantity: 0,
      unit: 'kWp',
      amount: 0,
    },
  ]);

  const [cgstPercentage, setCgstPercentage] = useState<number>(9);
  const [sgstPercentage, setSgstPercentage] = useState<number>(9);

  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const customerList = await dbService.getAllCustomers();
      setCustomers(customerList);

      const draft = await dbService.getDraftInvoice();
      if (draft) {
        if (draft.invoiceNumber) setInvoiceNumber(draft.invoiceNumber);
        if (draft.invoiceDate) setInvoiceDate(draft.invoiceDate);
        if (draft.workOrderReference) setWorkOrderReference(draft.workOrderReference);
        if (draft.workOrderDate) setWorkOrderDate(draft.workOrderDate);
        if (draft.customer) {
          setCompanyName(draft.customer.companyName || '');
          setAddressLine1(draft.customer.addressLine1 || '');
          setAddressLine2(draft.customer.addressLine2 || '');
          setAddressLine3(draft.customer.addressLine3 || '');
          setCity(draft.customer.city || '');
          setState(draft.customer.state || '');
          setPincode(draft.customer.pincode || '');
          setGstNumber(draft.customer.gstNumber || '');
          setPanNumber(draft.customer.panNumber || '');
        }
        if (draft.lineItems && draft.lineItems.length > 0) {
          setLineItems(draft.lineItems);
        }
        if (draft.cgstPercentage !== undefined) setCgstPercentage(draft.cgstPercentage);
        if (draft.sgstPercentage !== undefined) setSgstPercentage(draft.sgstPercentage);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      handleAutoSave();
    }, 30000);

    return () => clearInterval(interval);
  }, [invoiceNumber, invoiceDate, workOrderReference, workOrderDate, companyName, addressLine1, addressLine2, addressLine3, city, state, pincode, gstNumber, panNumber, lineItems, cgstPercentage, sgstPercentage]);

  const handleAutoSave = async () => {
    const draft: Partial<Invoice> = {
      invoiceNumber,
      financialYear,
      invoiceDate,
      workOrderReference,
      workOrderDate,
      customer: {
        companyName,
        addressLine1,
        addressLine2,
        addressLine3,
        city,
        state,
        pincode,
        gstNumber,
        panNumber,
      },
      lineItems,
      cgstPercentage,
      sgstPercentage,
    };
    await dbService.saveDraftInvoice(draft);
  };

  const handleCustomerSelect = (customerId: string) => {
    setSelectedCustomerId(customerId);
    if (customerId) {
      const customer = customers.find(c => c.id === customerId);
      if (customer) {
        setCompanyName(customer.companyName || '');
        setAddressLine1(customer.addressLine1 || '');
        setAddressLine2(customer.addressLine2 || '');
        setAddressLine3(customer.addressLine3 || '');
        setCity(customer.city || '');
        setState(customer.state || '');
        setPincode(customer.pincode || '');
        setGstNumber(customer.gstNumber || '');
        setPanNumber(customer.panNumber || '');
      }
    }
  };

  const addLineItem = () => {
    const newItem: LineItem = {
      id: Date.now().toString(),
      serialNumber: lineItems.length + 1,
      description: '',
      hsnSacCode: '',
      rate: 0,
      quantity: 0,
      unit: 'kWp',
      amount: 0,
    };
    setLineItems([...lineItems, newItem]);
  };

  const removeLineItem = (id: string) => {
    if (lineItems.length === 1) return;
    const updatedItems = lineItems.filter(item => item.id !== id);
    updatedItems.forEach((item, index) => {
      item.serialNumber = index + 1;
    });
    setLineItems(updatedItems);
  };

  const updateLineItem = (id: string, field: keyof LineItem, value: any) => {
    const updatedItems = lineItems.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'rate' || field === 'quantity') {
          // For kWp calculations, multiply by 1000 to convert to watts
          updated.amount = parseFloat((updated.rate * updated.quantity * 1000).toFixed(2));
        }
        return updated;
      }
      return item;
    });
    setLineItems(updatedItems);
  };

  const calculateTotals = () => {
    const totalBasic = lineItems.reduce((sum, item) => sum + item.amount, 0);
    const cgstAmount = (totalBasic * cgstPercentage) / 100;
    const sgstAmount = (totalBasic * sgstPercentage) / 100;
    const grandTotal = totalBasic + cgstAmount + sgstAmount;

    return {
      totalBasicAmount: parseFloat(totalBasic.toFixed(2)),
      cgstAmount: parseFloat(cgstAmount.toFixed(2)),
      sgstAmount: parseFloat(sgstAmount.toFixed(2)),
      grandTotal: parseFloat(grandTotal.toFixed(2)),
    };
  };

  const totals = calculateTotals();

  const validateForm = (): string | null => {
    if (!invoiceNumber.trim()) return 'Please enter invoice number';
    if (!/^\d+$/.test(invoiceNumber.trim())) return 'Invoice number should contain only digits (e.g., 022)';
    if (!invoiceDate) return 'Please select invoice date';
    if (!companyName.trim()) return 'Please enter customer company name';
    if (!addressLine1.trim()) return 'Please enter customer address';
    if (lineItems.length === 0) return 'Please add at least one line item';

    for (const item of lineItems) {
      if (!item.description.trim()) return `Please enter description for item ${item.serialNumber}`;
      if (item.rate <= 0) return `Please enter valid rate for item ${item.serialNumber}`;
      if (item.quantity <= 0) return `Please enter valid quantity for item ${item.serialNumber}`;
    }

    return null;
  };

  const handleGeneratePDF = async () => {
    const error = validateForm();
    if (error) {
      await message(error, { title: 'Validation Error', type: 'error' });
      return;
    }

    setIsGenerating(true);

    try {
      const invoice: Invoice = {
        invoiceNumber,
        financialYear,
        invoiceDate,
        workOrderReference,
        workOrderDate,
        customer: {
          id: selectedCustomerId || undefined,
          companyName,
          addressLine1,
          addressLine2,
          addressLine3,
          city,
          state,
          pincode,
          gstNumber,
          panNumber,
        },
        lineItems,
        totalBasicAmount: totals.totalBasicAmount,
        cgstPercentage,
        cgstAmount: totals.cgstAmount,
        sgstPercentage,
        sgstAmount: totals.sgstAmount,
        grandTotal: totals.grandTotal,
        amountInWords: numberToWordsIndian(totals.grandTotal),
      };

      const companySettings = await dbService.getCompanySettings();
      const stampSignature = await dbService.getStampSignature();
      const companyLogo = await dbService.getCompanyLogo();

      await generateInvoicePDF(invoice, companySettings, stampSignature || undefined, companyLogo || undefined);

      await dbService.saveInvoice(invoice);
      await dbService.clearDraftInvoice();

      await message('Invoice generated successfully!', { title: 'Success', type: 'info' });

      handleReset();
    } catch (error) {
      console.error('Error generating PDF:', error);
      await message('Error generating PDF. Please try again.', { title: 'Error', type: 'error' });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setInvoiceNumber('');
    setInvoiceDate(new Date().toISOString().split('T')[0]);
    setWorkOrderReference('');
    setWorkOrderDate('');
    setSelectedCustomerId('');
    setCompanyName('');
    setAddressLine1('');
    setAddressLine2('');
    setAddressLine3('');
    setCity('');
    setState('');
    setPincode('');
    setGstNumber('');
    setPanNumber('');
    setLineItems([
      {
        id: '1',
        serialNumber: 1,
        description: '',
        hsnSacCode: '',
        rate: 0,
        quantity: 0,
        unit: 'kWp',
        amount: 0,
      },
    ]);
    setCgstPercentage(9);
    setSgstPercentage(9);
    dbService.clearDraftInvoice();
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm transition-colors duration-200">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2 transition-colors duration-200">Create Invoice</h1>
        <p className="text-gray-600 dark:text-gray-400 transition-colors duration-200">Generate professional invoices for Apex Solar</p>
      </div>

      <InvoiceHeader
        invoiceNumber={invoiceNumber}
        setInvoiceNumber={setInvoiceNumber}
        financialYear={financialYear}
        invoiceDate={invoiceDate}
        setInvoiceDate={setInvoiceDate}
        workOrderReference={workOrderReference}
        setWorkOrderReference={setWorkOrderReference}
        workOrderDate={workOrderDate}
        setWorkOrderDate={setWorkOrderDate}
        customers={customers}
        selectedCustomerId={selectedCustomerId}
        onCustomerSelect={handleCustomerSelect}
        companyName={companyName}
        setCompanyName={setCompanyName}
        addressLine1={addressLine1}
        setAddressLine1={setAddressLine1}
        addressLine2={addressLine2}
        setAddressLine2={setAddressLine2}
        addressLine3={addressLine3}
        setAddressLine3={setAddressLine3}
        city={city}
        setCity={setCity}
        state={state}
        setState={setState}
        pincode={pincode}
        setPincode={setPincode}
        gstNumber={gstNumber}
        setGstNumber={setGstNumber}
        panNumber={panNumber}
        setPanNumber={setPanNumber}
      />

      <div className="mt-8">
        <LineItemsTable
          lineItems={lineItems}
          onAdd={addLineItem}
          onRemove={removeLineItem}
          onUpdate={updateLineItem}
        />
      </div>

      <div className="mt-8">
        <TaxSummary
          cgstPercentage={cgstPercentage}
          sgstPercentage={sgstPercentage}
          onCgstChange={setCgstPercentage}
          onSgstChange={setSgstPercentage}
          totals={totals}
        />
      </div>

      <div className="flex gap-4 justify-end mt-8">
        <button
          onClick={handleAutoSave}
          className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          <Save size={20} />
          Save Draft
        </button>
        <button
          onClick={handleGeneratePDF}
          disabled={isGenerating}
          className={`flex items - center gap - 2 px - 6 py - 3 rounded - lg transition - colors ${isGenerating
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-green-600 hover:bg-green-700 text-white'
            } `}
        >
          <Download size={20} />
          {isGenerating ? 'Generating...' : 'Generate PDF'}
        </button>
      </div>
    </div>
  );
}
