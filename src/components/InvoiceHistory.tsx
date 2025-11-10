import { useState, useEffect } from 'react';
import { FileText, Download, Trash2, Search, Loader2 } from 'lucide-react';
import { ask, message } from '@tauri-apps/api/dialog';
import { Invoice } from '../types/invoice';
import { getAllInvoices, deleteInvoice, getCompanySettings, getStampSignature, getCompanyLogo } from '../utils/tauriStorage';
import { generateInvoicePDF } from '../services/pdfGenerator';

export default function InvoiceHistory() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [generatingPdfId, setGeneratingPdfId] = useState<string | null>(null);

  useEffect(() => {
    loadInvoices();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredInvoices(invoices);
    } else {
      const filtered = invoices.filter(
        (invoice) =>
          invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          invoice.customer.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          invoice.workOrderReference.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredInvoices(filtered);
    }
  }, [searchTerm, invoices]);

  const loadInvoices = async () => {
    setIsLoading(true);
    try {
      const allInvoices = await getAllInvoices();
      setInvoices(allInvoices);
      setFilteredInvoices(allInvoices);
    } catch (error) {
      console.error('Error loading invoices:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegeneratePDF = async (invoice: Invoice) => {
    if (!invoice.id) return;
    setGeneratingPdfId(invoice.id);
    try {
      const companySettings = await getCompanySettings();
      const stampSignature = await getStampSignature();
      const companyLogo = await getCompanyLogo();
      await generateInvoicePDF(invoice, companySettings, stampSignature || undefined, companyLogo || undefined);
      await message('PDF has been generated and saved successfully!', { 
        title: 'Success', 
        type: 'info' 
      });
    } catch (error) {
      console.error('Error regenerating PDF:', error);
      await message('Failed to generate PDF. Please check your settings and try again.', { 
        title: 'Error', 
        type: 'error' 
      });
    } finally {
      setGeneratingPdfId(null);
    }
  };

  const handleDeleteInvoice = async (id: string, invoiceNumber: string, financialYear: string) => {
    const formattedInvoiceNumber = `AS/${financialYear}/${invoiceNumber}`;
    const confirmed = await ask(
      `Are you sure you want to delete invoice ${formattedInvoiceNumber}?\n\nThis action cannot be undone.`,
      { 
        title: 'Confirm Deletion', 
        type: 'warning' 
      }
    );
    
    if (confirmed) {
      try {
        await deleteInvoice(id);
        await loadInvoices();
        await message(`Invoice ${formattedInvoiceNumber} has been deleted successfully.`, { 
          title: 'Deleted', 
          type: 'info' 
        });
      } catch (error) {
        console.error('Error deleting invoice:', error);
        await message('Failed to delete invoice. Please try again.', { 
          title: 'Error', 
          type: 'error' 
        });
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-2 sm:p-4 md:p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm transition-colors duration-200">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2 transition-colors duration-200">Invoice History</h1>
        <p className="text-gray-600 dark:text-gray-400 transition-colors duration-200">View and manage all generated invoices</p>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by invoice number, customer name, or work order..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 size={48} className="text-blue-600 animate-spin" />
          <span className="ml-3 text-gray-600 dark:text-gray-400 transition-colors duration-200">Loading invoices...</span>
        </div>
      ) : filteredInvoices.length === 0 ? (
        <div className="text-center py-12">
          <FileText size={64} className="mx-auto text-gray-300 dark:text-gray-600 transition-colors duration-200 mb-4" />
          <p className="text-gray-500 dark:text-gray-400 transition-colors duration-200 text-lg">
            {searchTerm ? 'No invoices found matching your search' : 'No invoices generated yet'}
          </p>
          <p className="text-gray-400 mt-2">
            {searchTerm ? 'Try a different search term' : 'Create your first invoice to get started'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredInvoices.map((invoice) => (
            <div
              key={invoice.id}
              className="bg-gray-50 dark:bg-gray-700 dark:bg-gray-700 p-6 rounded-lg border border-gray-200 dark:border-gray-600 transition-colors duration-200 hover:border-blue-300 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <FileText size={24} className="text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-800">
                      AS/{invoice.financialYear}/{invoice.invoiceNumber}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-200">Customer</p>
                      <p className="font-medium text-gray-800">{invoice.customer.companyName}</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-200">Invoice Date</p>
                      <p className="font-medium text-gray-800">
                        {new Date(invoice.invoiceDate).toLocaleDateString('en-GB')}
                      </p>
                    </div>

                    {invoice.workOrderReference && (
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-200">Work Order</p>
                        <p className="font-medium text-gray-800">{invoice.workOrderReference}</p>
                      </div>
                    )}

                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-200">Grand Total</p>
                      <p className="font-semibold text-blue-600 text-lg">
                        Rs. {invoice.grandTotal.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-200">Line Items</p>
                    <p className="text-sm text-gray-800">
                      {invoice.lineItems.length} item(s) - Total Basic: Rs. {invoice.totalBasicAmount.toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleRegeneratePDF(invoice)}
                    disabled={generatingPdfId === invoice.id}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 dark:bg-green-500 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-all duration-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Download PDF"
                  >
                    {generatingPdfId === invoice.id ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <Download size={18} />
                        PDF
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => invoice.id && handleDeleteInvoice(invoice.id, invoice.invoiceNumber, invoice.financialYear)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 dark:bg-red-500 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-600 transition-all duration-200 transition-colors"
                    title="Delete Invoice"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredInvoices.length > 0 && (
        <div className="mt-6 text-center text-sm text-gray-500">
          Showing {filteredInvoices.length} of {invoices.length} invoice(s)
        </div>
      )}
    </div>
  );
}
