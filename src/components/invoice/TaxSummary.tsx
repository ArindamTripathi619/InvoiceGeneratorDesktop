import React from 'react';
import { numberToWordsIndian } from '../../utils/numberToWords';

interface TaxSummaryProps {
    cgstPercentage: number;
    sgstPercentage: number;
    onCgstChange: (value: number) => void;
    onSgstChange: (value: number) => void;
    totals: {
        totalBasicAmount: number;
        cgstAmount: number;
        sgstAmount: number;
        grandTotal: number;
    };
}

export const TaxSummary: React.FC<TaxSummaryProps> = ({
    cgstPercentage,
    sgstPercentage,
    onCgstChange,
    onSgstChange,
    totals,
}) => {
    return (
        <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg transition-colors duration-200">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4 transition-colors duration-200">
                Financial Summary
            </h2>

            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-200">
                            CGST Percentage
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            value={cgstPercentage}
                            onChange={(e) => onCgstChange(parseFloat(e.target.value) || 0)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors duration-200"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-200">
                            SGST Percentage
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            value={sgstPercentage}
                            onChange={(e) => onSgstChange(parseFloat(e.target.value) || 0)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors duration-200"
                        />
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-blue-200 dark:border-blue-400 transition-colors duration-200">
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200">
                                Total Basic Amount:
                            </span>
                            <span className="font-semibold text-gray-900 dark:text-gray-100 transition-colors duration-200">
                                Rs. {totals.totalBasicAmount.toFixed(2)}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200">
                                CGST ({cgstPercentage}%):
                            </span>
                            <span className="font-semibold text-gray-900 dark:text-gray-100 transition-colors duration-200">
                                Rs. {totals.cgstAmount.toFixed(2)}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200">
                                SGST ({sgstPercentage}%):
                            </span>
                            <span className="font-semibold text-gray-900 dark:text-gray-100 transition-colors duration-200">
                                Rs. {totals.sgstAmount.toFixed(2)}
                            </span>
                        </div>
                        <div className="border-t-2 border-gray-200 dark:border-gray-700 pt-2 mt-2">
                            <div className="flex justify-between text-lg">
                                <span className="font-bold text-gray-800 dark:text-gray-200 transition-colors duration-200">
                                    Grand Total:
                                </span>
                                <span className="font-bold text-blue-600 dark:text-blue-400 transition-colors duration-200">
                                    Rs. {totals.grandTotal.toFixed(2)}
                                </span>
                            </div>
                        </div>
                        <div className="mt-3 p-3 bg-blue-50 dark:bg-gray-700 rounded transition-colors duration-200">
                            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200">
                                Amount in Words:
                            </p>
                            <p className="text-sm font-semibold text-blue-900 dark:text-blue-300 mt-1 transition-colors duration-200">
                                {numberToWordsIndian(totals.grandTotal)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
