import { useState, useEffect } from 'react';
import { Plus, Trash2, Download, Save } from 'lucide-react';
import { message } from '@tauri-apps/api/dialog';
import { Invoice, LineItem, Customer } from '../types/invoice';
import { numberToWordsIndian, getCurrentFinancialYear } from '../utils/numberToWords';
import { 
  saveDraftInvoice, 
  getDraftInvoice, 
  clearDraftInvoice, 
  saveInvoice, 
  getAllCustomers, 
  getCompanySettings, 
  getStampSignature, 
  getCompanyLogo 
} from '../utils/tauriStorage';
import { generateInvoicePDF } from '../services/pdfGenerator';

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
      const customerList = await getAllCustomers();
      setCustomers(customerList);
      
      const draft = await getDraftInvoice();
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
    await saveDraftInvoice(draft);
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

      const companySettings = await getCompanySettings();
      const stampSignature = await getStampSignature();
      const companyLogo = await getCompanyLogo();

      await generateInvoicePDF(invoice, companySettings, stampSignature || undefined, companyLogo || undefined);

      await saveInvoice(invoice);
      await clearDraftInvoice();

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
    clearDraftInvoice();
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white rounded-lg shadow-sm">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Create Invoice</h1>
        <p className="text-gray-600">Generate professional invoices for Apex Solar</p>
      </div>

      <div className="space-y-8">
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Invoice Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Invoice Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                placeholder="022"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Will be formatted as: AS/{financialYear}/{invoiceNumber || 'XXX'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Financial Year
              </label>
              <input
                type="text"
                value={financialYear}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Invoice Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Work Order Reference
              </label>
              <input
                type="text"
                value={workOrderReference}
                onChange={(e) => setWorkOrderReference(e.target.value)}
                placeholder="NIPL/RTS/002/35 Kwp/I & C/24-25/"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Work Order Date
              </label>
              <input
                type="date"
                value={workOrderDate}
                onChange={(e) => setWorkOrderDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Customer Details</h2>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Existing Customer (Optional)
            </label>
            <select
              value={selectedCustomerId}
              onChange={(e) => handleCustomerSelect(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">-- New Customer --</option>
              {customers.map(customer => (
                <option key={customer.id} value={customer.id}>
                  {customer.companyName}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="NIMBUS IRRIGATION PVT.LTD."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address Line 1 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                  placeholder="Suit No. #705, South City Business Park"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address Line 2
                </label>
                <input
                  type="text"
                  value={addressLine2}
                  onChange={(e) => setAddressLine2(e.target.value)}
                  placeholder="7th Floor 770, Eastern Metropolitan Bypass"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address Line 3
                </label>
                <input
                  type="text"
                  value={addressLine3}
                  onChange={(e) => setAddressLine3(e.target.value)}
                  placeholder="Additional address info"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Kolkata"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State
                </label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="West Bengal"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pincode
                </label>
                <input
                  type="text"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="700107"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  GST Number
                </label>
                <input
                  type="text"
                  value={gstNumber}
                  onChange={(e) => setGstNumber(e.target.value)}
                  placeholder="19AACN8612L1Z5"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  PAN Number
                </label>
                <input
                  type="text"
                  value={panNumber}
                  onChange={(e) => setPanNumber(e.target.value)}
                  placeholder="AAACN8612L"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Service Line Items</h2>
            <button
              onClick={addLineItem}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} />
              Add Item
            </button>
          </div>

          <div className="space-y-4">
            {lineItems.map((item) => (
              <div key={item.id} className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-medium text-gray-700">Item {item.serialNumber}</h3>
                  {lineItems.length > 1 && (
                    <button
                      onClick={() => removeLineItem(item.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={item.description}
                      onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                      rows={3}
                      placeholder="Installation, testing & commissioning include lifting of all materials from site store to actual installation site for 35 kwp Rooftop Solar Power plant..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      HSN/SAC Code
                    </label>
                    <input
                      type="text"
                      value={item.hsnSacCode}
                      onChange={(e) => updateLineItem(item.id, 'hsnSacCode', e.target.value)}
                      placeholder="995444"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Unit
                    </label>
                    <input
                      type="text"
                      value={item.unit}
                      onChange={(e) => updateLineItem(item.id, 'unit', e.target.value)}
                      placeholder="kWp"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rate (Rs.) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={item.rate}
                      onChange={(e) => updateLineItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                      placeholder="1.50"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantity <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.001"
                      value={item.quantity}
                      onChange={(e) => updateLineItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                      placeholder="35"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amount (Rs.)
                    </label>
                    <input
                      type="text"
                      value={item.amount.toFixed(2)}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 font-semibold"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Financial Summary</h2>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CGST Percentage
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={cgstPercentage}
                  onChange={(e) => setCgstPercentage(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SGST Percentage
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={sgstPercentage}
                  onChange={(e) => setSgstPercentage(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border-2 border-blue-200">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Total Basic Amount:</span>
                  <span className="font-semibold text-gray-900">Rs. {totals.totalBasicAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">CGST ({cgstPercentage}%):</span>
                  <span className="font-semibold text-gray-900">Rs. {totals.cgstAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">SGST ({sgstPercentage}%):</span>
                  <span className="font-semibold text-gray-900">Rs. {totals.sgstAmount.toFixed(2)}</span>
                </div>
                <div className="border-t-2 border-gray-200 pt-2 mt-2">
                  <div className="flex justify-between text-lg">
                    <span className="font-bold text-gray-800">Grand Total:</span>
                    <span className="font-bold text-blue-600">Rs. {totals.grandTotal.toFixed(2)}</span>
                  </div>
                </div>
                <div className="mt-3 p-3 bg-blue-50 rounded">
                  <p className="text-xs font-medium text-gray-700">Amount in Words:</p>
                  <p className="text-sm font-semibold text-blue-900 mt-1">
                    {numberToWordsIndian(totals.grandTotal)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-4 justify-end">
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
            className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors ${
              isGenerating
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            <Download size={20} />
            {isGenerating ? 'Generating...' : 'Generate PDF'}
          </button>
        </div>
      </div>
    </div>
  );
}
