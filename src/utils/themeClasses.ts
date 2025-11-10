// Common theme-aware Tailwind classes for consistent styling across components

export const themeClasses = {
  // Container backgrounds
  cardBg: 'bg-white dark:bg-gray-800 transition-colors duration-200',
  sectionBg: 'bg-gray-50 dark:bg-gray-700 transition-colors duration-200',
  
  // Text colors
  textPrimary: 'text-gray-800 dark:text-gray-100 transition-colors duration-200',
  textSecondary: 'text-gray-600 dark:text-gray-400 transition-colors duration-200',
  textTertiary: 'text-gray-500 dark:text-gray-500 transition-colors duration-200',
  labelText: 'text-gray-700 dark:text-gray-300 transition-colors duration-200',
  
  // Input fields
  input: 'w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors duration-200',
  inputDisabled: 'w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-400 transition-colors duration-200',
  
  // Buttons
  btnPrimary: 'px-6 py-3 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-all duration-200',
  btnSuccess: 'px-6 py-3 bg-green-600 dark:bg-green-500 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-all duration-200',
  btnDanger: 'px-6 py-3 bg-red-600 dark:bg-red-500 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-600 transition-all duration-200',
  btnSecondary: 'px-6 py-3 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-all duration-200',
  
  // Borders
  border: 'border-gray-200 dark:border-gray-700 transition-colors duration-200',
  borderHover: 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors duration-200',
  
  // Cards/Boxes
  itemCard: 'bg-gray-50 dark:bg-gray-700 p-6 rounded-lg border border-gray-200 dark:border-gray-600 transition-colors duration-200',
  itemCardHover: 'bg-gray-50 dark:bg-gray-700 p-6 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 transition-colors duration-200',
  
  // Empty states
  emptyIcon: 'text-gray-300 dark:text-gray-600 transition-colors duration-200',
  emptyText: 'text-gray-500 dark:text-gray-400 transition-colors duration-200',
  
  // Summary/Total boxes
  summaryBox: 'bg-white dark:bg-gray-700 p-6 rounded-lg border-2 border-gray-200 dark:border-gray-600 transition-colors duration-200',
};
