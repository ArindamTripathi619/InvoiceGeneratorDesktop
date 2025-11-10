import { useState, useEffect } from 'react';
import { FileText, Settings as SettingsIcon, Users, History, Moon, Sun } from 'lucide-react';
import InvoiceForm from './components/InvoiceForm';
import Settings from './components/Settings';
import InvoiceHistory from './components/InvoiceHistory';
import CustomerManagement from './components/CustomerManagement';
import SplashScreen from './components/SplashScreen';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import packageJson from '../package.json';

type TabType = 'create' | 'history' | 'customers' | 'settings';

function AppContent() {
  const [activeTab, setActiveTab] = useState<TabType>('create');
  const [showSplash, setShowSplash] = useState(true);
  const { theme, toggleTheme } = useTheme();

  // Check if splash has been shown in this session
  useEffect(() => {
    const splashShown = sessionStorage.getItem('splashShown');
    if (splashShown === 'true') {
      setShowSplash(false);
    }
  }, []);

  const handleSplashComplete = () => {
    setShowSplash(false);
    sessionStorage.setItem('splashShown', 'true');
  };

  // Show splash screen on cold start
  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} theme={theme} />;
  }

  const tabs = [
    { id: 'create' as TabType, label: 'Create Invoice', icon: FileText },
    { id: 'history' as TabType, label: 'Invoice History', icon: History },
    { id: 'customers' as TabType, label: 'Customers', icon: Users },
    { id: 'settings' as TabType, label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 transition-colors duration-200">
      <header className="bg-white dark:bg-gray-800 shadow-md border-b-2 border-blue-500 dark:border-blue-600 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white p-3 rounded-lg">
                <FileText size={32} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 transition-colors duration-200">Apex Solar</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-200">Invoice Generation System - Desktop v{packageJson.version}</p>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className="p-3 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200"
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? (
                <Moon size={24} className="text-gray-700 dark:text-gray-300" />
              ) : (
                <Sun size={24} className="text-gray-300" />
              )}
            </button>
          </div>
        </div>
      </header>

      <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium transition-all ${
                    isActive
                      ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-gray-700'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon size={20} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      <main className="py-8">
        {activeTab === 'create' && <InvoiceForm />}
        {activeTab === 'history' && <InvoiceHistory />}
        {activeTab === 'customers' && <CustomerManagement />}
        {activeTab === 'settings' && <Settings />}
      </main>

      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="text-center text-sm text-gray-600 dark:text-gray-400 transition-colors duration-200">
            <p className="font-semibold text-gray-800 dark:text-gray-200 mb-1">APEX SOLAR</p>
            <p>Ramkrishna Nagar, Paschimpara, P.O.- Panchpota, P.S.- Sonarpur, Kolkata - 700 152</p>
            <p className="mt-2">Ph: +91-97327 33031 | E-mail: partha.apexsolar@gmail.com</p>
            <p className="mt-3 text-xs text-gray-500 dark:text-gray-500">Solar Power Plant Installation and Commissioning</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
