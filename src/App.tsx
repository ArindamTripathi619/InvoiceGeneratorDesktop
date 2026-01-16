import { useState, useEffect } from 'react';
import { FileText, Settings as SettingsIcon, Users, History, Moon, Sun, RefreshCw } from 'lucide-react';
import InvoiceForm from './components/InvoiceForm';
import Settings from './components/Settings';
import InvoiceHistory from './components/InvoiceHistory';
import CustomerManagement from './components/CustomerManagement';
import SplashScreen from './components/SplashScreen';
import { UpdateTab } from './components/UpdateTab';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import packageJson from '../package.json';
import { COMPANY_DETAILS, FOOTER_DETAILS } from './utils/constants';
import { dbService } from './services/db';
import { updateService } from './services/updateService';
import { message } from '@tauri-apps/api/dialog';

type TabType = 'create' | 'history' | 'customers' | 'settings' | 'updates';

function AppContent() {
  const [activeTab, setActiveTab] = useState<TabType>('create');
  const [showSplash, setShowSplash] = useState(true);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const initDb = async () => {
      try {
        await dbService.init();
      } catch (error) {
        console.error('Failed to initialize database:', error);
      }
    };
    initDb();
  }, []);

  // Proactive Update Check on Launch
  useEffect(() => {
    const checkOnLaunch = async () => {
      try {
        const info = await updateService.checkUpdates();
        if (info.hasUpdate) {
          const proceed = await message(
            `A new version (v${info.latestVersion}) is available! Would you like to view the update details?`,
            { title: 'Update Available', type: 'info' }
          );
          // If the user clicks 'OK' (or similar based on dialog behavior), we could switch tabs
          // But usually message() returns void or simple status. 
          // For now, it just notifies.
        }
      } catch (e) {
        console.error('Initial update check failed:', e);
      }
    };

    // Small delay to allow splash/db to settle
    const timer = setTimeout(checkOnLaunch, 5000);
    return () => clearTimeout(timer);
  }, []);

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
    { id: 'updates' as TabType, label: 'Updates', icon: RefreshCw },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 transition-colors duration-200">
      <header className="bg-white dark:bg-gray-800 shadow-md border-b-2 border-blue-500 dark:border-blue-600 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-3 md:py-4 lg:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 lg:gap-4 min-w-0">
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white p-1.5 sm:p-2 md:p-2.5 lg:p-3 rounded-lg flex-shrink-0">
                <FileText size={20} className="md:hidden" />
                <FileText size={24} className="hidden md:block lg:hidden" />
                <FileText size={32} className="hidden lg:block" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-800 dark:text-gray-100 transition-colors duration-200 truncate">
                  Apex Solar
                </h1>
                <p className="text-[10px] sm:text-xs md:text-sm text-gray-600 dark:text-gray-400 transition-colors duration-200 hidden sm:block truncate">
                  Invoice System v{packageJson.version}
                </p>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className="p-1.5 sm:p-2 md:p-2.5 lg:p-3 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 flex-shrink-0"
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? (
                <Moon size={16} className="md:hidden text-gray-700" />
              ) : (
                <Sun size={16} className="md:hidden text-gray-300" />
              )}
              {theme === 'light' ? (
                <Moon size={20} className="hidden md:block lg:hidden text-gray-700" />
              ) : (
                <Sun size={20} className="hidden md:block lg:hidden text-gray-300" />
              )}
              {theme === 'light' ? (
                <Moon size={24} className="hidden lg:block text-gray-700 dark:text-gray-300" />
              ) : (
                <Sun size={24} className="hidden lg:block text-gray-300" />
              )}
            </button>
          </div>
        </div>
      </header>

      <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10 transition-colors duration-200 overflow-x-auto">
        <div className="max-w-7xl mx-auto px-0.5 sm:px-1 md:px-2 lg:px-6">
          <div className="flex gap-0.5 sm:gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center justify-center gap-1.5 px-1.5 sm:px-2 md:px-3 lg:px-6 py-2 sm:py-2.5 md:py-3 lg:py-4 font-medium transition-all whitespace-nowrap ${isActive
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-gray-700'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  title={tab.label}
                >
                  <Icon size={16} className="sm:w-[18px] sm:h-[18px] md:w-5 md:h-5" />
                  <span className="hidden lg:inline text-sm">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      <main className="py-2 sm:py-4 md:py-8">
        {activeTab === 'create' && <InvoiceForm />}
        {activeTab === 'history' && <InvoiceHistory />}
        {activeTab === 'customers' && <CustomerManagement />}
        {activeTab === 'settings' && <Settings />}
        {activeTab === 'updates' && <UpdateTab />}
      </main>

      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-4 sm:mt-8 md:mt-12 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 py-3 sm:py-4 md:py-6">
          <div className="text-center text-[10px] sm:text-xs md:text-sm text-gray-600 dark:text-gray-400 transition-colors duration-200">
            <p className="font-semibold text-gray-800 dark:text-gray-200 mb-1">{COMPANY_DETAILS.name}</p>
            <p className="hidden md:block">{FOOTER_DETAILS.addressLine}</p>
            <p className="md:hidden text-[10px]">{FOOTER_DETAILS.cityPincode}</p>
            <p className="mt-1 sm:mt-2 text-[10px] sm:text-xs">Ph: {FOOTER_DETAILS.phone}</p>
            <p className="hidden sm:block text-[10px]">{FOOTER_DETAILS.service}</p>
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
