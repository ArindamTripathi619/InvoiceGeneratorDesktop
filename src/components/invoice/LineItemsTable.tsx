import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { LineItem } from '../../types/invoice';

interface LineItemsTableProps {
    lineItems: LineItem[];
    onAdd: () => void;
    onRemove: (id: string) => void;
    onUpdate: (id: string, field: keyof LineItem, value: any) => void;
}

export const LineItemsTable: React.FC<LineItemsTableProps> = ({
    lineItems,
    onAdd,
    onRemove,
    onUpdate,
}) => {
    return (
        <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg transition-colors duration-200">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 transition-colors duration-200">
                    Service Line Items
                </h2>
                <button
                    onClick={onAdd}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-all duration-200 transition-colors"
                >
                    <Plus size={20} />
                    Add Item
                </button>
            </div>

            <div className="space-y-4">
                {lineItems.map((item) => (
                    <div
                        key={item.id}
                        className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors duration-200"
                    >
                        <div className="flex justify-between items-start mb-3">
                            <h3 className="font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200">
                                Item {item.serialNumber}
                            </h3>
                            {lineItems.length > 1 && (
                                <button
                                    onClick={() => onRemove(item.id)}
                                    className="text-red-600 hover:text-red-700"
                                >
                                    <Trash2 size={18} />
                                </button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-200">
                                    Description <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={item.description}
                                    onChange={(e) => onUpdate(item.id, 'description', e.target.value)}
                                    rows={3}
                                    placeholder="Installation, testing & commissioning..."
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors duration-200"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-200">
                                    HSN/SAC Code
                                </label>
                                <input
                                    type="text"
                                    value={item.hsnSacCode}
                                    onChange={(e) => onUpdate(item.id, 'hsnSacCode', e.target.value)}
                                    placeholder="995444"
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors duration-200"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-200">
                                    Unit
                                </label>
                                <input
                                    type="text"
                                    value={item.unit}
                                    onChange={(e) => onUpdate(item.id, 'unit', e.target.value)}
                                    placeholder="kWp"
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors duration-200"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-200">
                                    Rate (Rs.) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={item.rate}
                                    onChange={(e) =>
                                        onUpdate(item.id, 'rate', parseFloat(e.target.value) || 0)
                                    }
                                    placeholder="1.50"
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors duration-200"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-200">
                                    Quantity <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    step="0.001"
                                    value={item.quantity}
                                    onChange={(e) =>
                                        onUpdate(item.id, 'quantity', parseFloat(e.target.value) || 0)
                                    }
                                    placeholder="35"
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors duration-200"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-200">
                                    Amount (Rs.)
                                </label>
                                <input
                                    type="text"
                                    value={item.amount.toFixed(2)}
                                    disabled
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-400 transition-colors duration-200 font-semibold"
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
