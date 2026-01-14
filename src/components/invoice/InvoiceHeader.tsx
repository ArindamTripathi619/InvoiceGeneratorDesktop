import React from 'react';
import { Customer } from '../../types/invoice';

interface InvoiceHeaderProps {
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
    companyName: string;
    setCompanyName: (val: string) => void;
    addressLine1: string;
    setAddressLine1: (val: string) => void;
    addressLine2: string;
    setAddressLine2: (val: string) => void;
    addressLine3: string;
    setAddressLine3: (val: string) => void;
    city: string;
    setCity: (val: string) => void;
    state: string;
    setState: (val: string) => void;
    pincode: string;
    setPincode: (val: string) => void;
    gstNumber: string;
    setGstNumber: (val: string) => void;
    panNumber: string;
    setPanNumber: (val: string) => void;
}

export const InvoiceHeader: React.FC<InvoiceHeaderProps> = ({
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
    companyName,
    setCompanyName,
    addressLine1,
    setAddressLine1,
    addressLine2,
    setAddressLine2,
    addressLine3,
    setAddressLine3,
    city,
    setCity,
    state,
    setState,
    pincode,
    setPincode,
    gstNumber,
    setGstNumber,
    panNumber,
    setPanNumber,
}) => {
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
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-200">
                            Invoice Date <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            value={invoiceDate}
                            onChange={(e) => setInvoiceDate(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors duration-200"
                        />
                        <p className="text-xs text-gray-500 mt-1">Format: DD-MM-YYYY</p>
                    </div>
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
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors duration-200"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-200">
                            Work Order Date
                        </label>
                        <input
                            type="date"
                            value={workOrderDate}
                            onChange={(e) => setWorkOrderDate(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors duration-200"
                        />
                        <p className="text-xs text-gray-500 mt-1">Format: DD-MM-YYYY</p>
                    </div>
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
                        {customers.map((customer) => (
                            <option key={customer.id} value={customer.id}>
                                {customer.companyName}
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
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
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
                                value={addressLine1}
                                onChange={(e) => setAddressLine1(e.target.value)}
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
                                value={addressLine2}
                                onChange={(e) => setAddressLine2(e.target.value)}
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
                                value={addressLine3}
                                onChange={(e) => setAddressLine3(e.target.value)}
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
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
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
                                value={state}
                                onChange={(e) => setState(e.target.value)}
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
                                value={pincode}
                                onChange={(e) => setPincode(e.target.value)}
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
                                value={gstNumber}
                                onChange={(e) => setGstNumber(e.target.value)}
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
                                value={panNumber}
                                onChange={(e) => setPanNumber(e.target.value)}
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
