import React from 'react';
import { Customer } from '../../types/invoice';

export interface InvoiceFormControl {
    invoiceNumber: string;
    setInvoiceNumber: (val: string) => void;
    financialYear: string;
    invoiceDate: string;
    setInvoiceDate: (val: string) => void;
    workOrderReference: string;
    setWorkOrderReference: (val: string) => void;
    workOrderDate: string;
    setWorkOrderDate: (val: string) => void;
    customers: Customer[];
    selectedCustomerId: string;
    onCustomerSelect: (id: string) => void;
    customer: Customer;
    updateCustomerField: (field: keyof Customer, value: string) => void;
}

interface InvoiceHeaderProps {
    form: InvoiceFormControl;
}

const SmartDateInput: React.FC<{
    label: string,
    value: string, // YYYY-MM-DD
    onChange: (val: string) => void,
    required?: boolean
}> = ({ label, value, onChange, required }) => {
    // Internal state for the display value (DD-MM-YYYY)
    const [displayValue, setDisplayValue] = React.useState('');

    // Sync internal state with external value when it changes
    React.useEffect(() => {
        if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
            const [y, m, d] = value.split('-');
            setDisplayValue(`${d}-${m}-${y}`);
        } else {
            setDisplayValue(value || '');
        }
    }, [value]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value.replace(/\D/g, ''); // Remove non-digits
        if (val.length > 8) val = val.slice(0, 8);

        // Apply masking DD-MM-YYYY
        let formatted = val;
        if (val.length > 2) formatted = val.slice(0, 2) + '-' + val.slice(2);
        if (val.length > 4) formatted = formatted.slice(0, 5) + '-' + formatted.slice(5);

        setDisplayValue(formatted);

        // If complete (8 digits), update parent with YYYY-MM-DD
        if (val.length === 8) {
            const d = val.slice(0, 2);
            const m = val.slice(2, 4);
            const y = val.slice(4, 8);
            onChange(`${y}-${m}-${d}`);
        }
    };

    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-200">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <input
                type="text"
                value={displayValue}
                onChange={handleInputChange}
                placeholder="DD-MM-YYYY"
                maxLength={10}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors duration-200"
            />
            <p className="text-xs text-gray-500 mt-1">Format: DD-MM-YYYY</p>
        </div>
    );
};

export const InvoiceHeader: React.FC<InvoiceHeaderProps> = ({ form }) => {
    const {
        invoiceNumber,
        setInvoiceNumber,
        financialYear,
        invoiceDate,
        setInvoiceDate,
        workOrderReference,
        setWorkOrderReference,
        workOrderDate,
        setWorkOrderDate,
        customers,
        selectedCustomerId,
        onCustomerSelect,
        customer,
        updateCustomerField
    } = form;

    return (
        <div className="space-y-8">
            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg transition-colors duration-200">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4 transition-colors duration-200">
                    Invoice Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-200">
                            Invoice Number <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={invoiceNumber}
                            onChange={(e) => setInvoiceNumber(e.target.value)}
                            placeholder="022"
                            title="Enter the sequential invoice number (e.g., 022). It will be prefixed with the financial year."
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors duration-200"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-500 transition-colors duration-200 mt-1">
                            Will be formatted as: AS/{financialYear}/{invoiceNumber || 'XXX'}
                        </p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-200">
                            Financial Year
                        </label>
                        <input
                            type="text"
                            value={financialYear}
                            disabled
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-400 transition-colors duration-200"
                        />
                    </div>
                    <SmartDateInput
                        label="Invoice Date"
                        value={invoiceDate}
                        onChange={setInvoiceDate}
                        required
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-200">
                            Work Order Reference
                        </label>
                        <input
                            type="text"
                            value={workOrderReference}
                            onChange={(e) => setWorkOrderReference(e.target.value)}
                            placeholder="NIPL/RTS/002/35 Kwp/I & C/24-25/"
                            title="Reference number from the client's work order."
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors duration-200"
                        />
                    </div>
                    <SmartDateInput
                        label="Work Order Date"
                        value={workOrderDate}
                        onChange={setWorkOrderDate}
                    />
                </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg transition-colors duration-200">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4 transition-colors duration-200">
                    Customer Details
                </h2>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-200">
                        Select Existing Customer (Optional)
                    </label>
                    <select
                        value={selectedCustomerId}
                        onChange={(e) => onCustomerSelect(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors duration-200"
                    >
                        <option value="">-- New Customer --</option>
                        {customers.map((c: Customer) => (
                            <option key={c.id} value={c.id}>
                                {c.companyName}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-200">
                            Company Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={customer.companyName}
                            onChange={(e) => updateCustomerField('companyName', e.target.value)}
                            placeholder="NIMBUS IRRIGATION PVT.LTD."
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors duration-200"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-200">
                                Address Line 1 <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={customer.addressLine1}
                                onChange={(e) => updateCustomerField('addressLine1', e.target.value)}
                                placeholder="Suit No. #705, South City Business Park"
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors duration-200"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-200">
                                Address Line 2
                            </label>
                            <input
                                type="text"
                                value={customer.addressLine2}
                                onChange={(e) => updateCustomerField('addressLine2', e.target.value)}
                                placeholder="7th Floor 770, Eastern Metropolitan Bypass"
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors duration-200"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-200">
                                Address Line 3
                            </label>
                            <input
                                type="text"
                                value={customer.addressLine3}
                                onChange={(e) => updateCustomerField('addressLine3', e.target.value)}
                                placeholder="Additional address info"
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors duration-200"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-200">
                                City
                            </label>
                            <input
                                type="text"
                                value={customer.city}
                                onChange={(e) => updateCustomerField('city', e.target.value)}
                                placeholder="Kolkata"
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors duration-200"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-200">
                                State
                            </label>
                            <input
                                type="text"
                                value={customer.state}
                                onChange={(e) => updateCustomerField('state', e.target.value)}
                                placeholder="West Bengal"
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors duration-200"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-200">
                                Pincode
                            </label>
                            <input
                                type="text"
                                value={customer.pincode}
                                onChange={(e) => updateCustomerField('pincode', e.target.value)}
                                placeholder="700107"
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors duration-200"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-200">
                                GST Number
                            </label>
                            <input
                                type="text"
                                value={customer.gstNumber}
                                onChange={(e) => updateCustomerField('gstNumber', e.target.value)}
                                placeholder="19AACN8612L1Z5"
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors duration-200"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-200">
                                PAN Number
                            </label>
                            <input
                                type="text"
                                value={customer.panNumber}
                                onChange={(e) => updateCustomerField('panNumber', e.target.value)}
                                placeholder="AAACN8612L"
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors duration-200"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
