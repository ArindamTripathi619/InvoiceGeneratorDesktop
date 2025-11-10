import { useState } from 'react';
import { FileText, Settings as SettingsIcon, Users, History } from 'lucide-react';
import InvoiceForm from './components/InvoiceForm';
import Settings from './components/Settings';
import InvoiceHistory from './components/InvoiceHistory';
import CustomerManagement from './components/CustomerManagement';
import packageJson from '../package.json';

type TabType = 'create' | 'history' | 'customers' | 'settings';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('create');

  const tabs = [
    { id: 'create' as TabType, label: 'Create Invoice', icon: FileText },
    { id: 'history' as TabType, label: 'Invoice History', icon: History },
    { id: 'customers' as TabType, label: 'Customers', icon: Users },
    { id: 'settings' as TabType, label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white shadow-md border-b-2 border-blue-500">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white p-3 rounded-lg">
              <FileText size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Apex Solar</h1>
              <p className="text-sm text-gray-600">Invoice Generation System - Desktop v{packageJson.version}</p>
            </div>
          </div>
        </div>
      </header>

      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
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
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
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

      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="text-center text-sm text-gray-600">
            <p className="font-semibold text-gray-800 mb-1">APEX SOLAR</p>
            <p>Ramkrishna Nagar, Paschimpara, P.O.- Panchpota, P.S.- Sonarpur, Kolkata - 700 152</p>
            <p className="mt-2">Ph: +91-97327 33031 | E-mail: partha.apexsolar@gmail.com</p>
            <p className="mt-3 text-xs text-gray-500">Solar Power Plant Installation and Commissioning</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
