import React, { useEffect } from 'react';
import { Download, RotateCcw } from 'lucide-react';
import { message } from '@tauri-apps/api/dialog';
import { generateInvoicePDF } from '../services/pdfGenerator';
import { dbService } from '../services/db';
import { invoiceService } from '../services/invoiceService';
import { InvoiceHeader, InvoiceFormControl } from './invoice/InvoiceHeader';
import { LineItemsTable } from './invoice/LineItemsTable';
import { TaxSummary } from './invoice/TaxSummary';
import { useInvoiceForm } from '../hooks/useInvoiceForm';

import { numberToWordsIndian } from '../utils/numberToWords';

export const InvoiceForm: React.FC = () => {
  const { state, actions } = useInvoiceForm();
  const {
    customers,
    selectedCustomerId,
    invoiceNumber,
    financialYear,
    invoiceDate,
    workOrderReference,
    workOrderDate,
    customer,
    lineItems,
    cgstPercentage,
    sgstPercentage,
    isGenerating,
    totals,
  } = state;

  const {
    setInvoiceNumber,
    setInvoiceDate,
    setWorkOrderReference,
    setWorkOrderDate,
    setCgstPercentage,
    setSgstPercentage,
    setIsGenerating,
    handleCustomerSelect,
    updateCustomerField,
    addLineItem,
    removeLineItem,
    updateLineItem,
    handleAutoSave,
    handleReset,
    validateForm,
  } = actions;

  // Auto-save debounced
  useEffect(() => {
    const timer = setTimeout(() => {
      handleAutoSave();
    }, 1000);
    return () => clearTimeout(timer);
  }, [handleAutoSave]);

  const handleGeneratePDF = async () => {
    const error = validateForm();
    if (error) {
      await message(error, { title: 'Validation Error', type: 'error' });
      return;
    }

    setIsGenerating(true);
    try {
      const companySettings = await dbService.getCompanySettings();
      if (!companySettings) {
        await message('Please configure company settings first!', {
          title: 'Settings Missing',
          type: 'error',
        });
        return;
      }

      const stampSignature = await dbService.getStampSignature();
      const companyLogo = await dbService.getCompanyLogo();

      const invoice = {
        invoiceNumber,
        financialYear,
        invoiceDate,
        customer,
        lineItems,
        totalBasicAmount: totals.totalBasicAmount,
        cgstPercentage,
        sgstPercentage,
        cgstAmount: totals.cgstAmount,
        sgstAmount: totals.sgstAmount,
        grandTotal: totals.grandTotal,
        amountInWords: numberToWordsIndian(totals.grandTotal),
        workOrderReference,
        workOrderDate,
      };

      await generateInvoicePDF(
        invoice as any,
        companySettings,
        stampSignature || undefined,
        companyLogo || undefined
      );
      await invoiceService.saveInvoice(invoice as any);
      await message('Invoice generated and saved successfully!', 'Success');
    } catch (error) {
      console.error('PDF Generation Error:', error);
      await message('Failed to generate PDF. Please check console for details.', {
        title: 'Error',
        type: 'error',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const headerFormControl: InvoiceFormControl = {
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
    onCustomerSelect: handleCustomerSelect,
    customer,
    updateCustomerField
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white transition-colors duration-200">
            Create Invoice
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 transition-colors duration-200">
            Enter details to generate a professional GST invoice
          </p>
        </div>
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200"
        >
          <RotateCcw size={20} />
          Reset Form
        </button>
      </div>

      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <InvoiceHeader form={headerFormControl} />

        <LineItemsTable
          lineItems={lineItems}
          onAdd={addLineItem}
          onRemove={removeLineItem}
          onUpdate={updateLineItem}
        />

        <TaxSummary
          cgstPercentage={cgstPercentage}
          sgstPercentage={sgstPercentage}
          onCgstChange={setCgstPercentage}
          onSgstChange={setSgstPercentage}
          totals={totals}
        />

        <div className="flex justify-end pt-4 pb-12">
          <button
            onClick={handleGeneratePDF}
            disabled={isGenerating}
            className={`flex items-center gap-3 px-8 py-4 bg-blue-600 dark:bg-blue-500 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 dark:hover:bg-blue-600 transform transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${isGenerating ? 'animate-pulse' : ''
              }`}
          >
            <Download size={24} />
            {isGenerating ? 'Generating PDF...' : 'Generate & Save Invoice'}
          </button>
        </div>
      </div>
    </div>
  );
};
