import { useState, useEffect } from 'react';
import { Users, Plus, Trash2, CreditCard as Edit2, X, Save, Loader2 } from 'lucide-react';
import { ask, message } from '@tauri-apps/api/dialog';
import { Customer } from '../types/invoice';
import { getAllCustomers, saveCustomer, deleteCustomer } from '../utils/tauriStorage';

export default function CustomerManagement() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isAddingCustomer, setIsAddingCustomer] = useState<boolean>(false);
  const [editingCustomerId, setEditingCustomerId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const [formData, setFormData] = useState<Omit<Customer, 'id'>>({
    companyName: '',
    addressLine1: '',
    addressLine2: '',
    addressLine3: '',
    city: '',
    state: '',
    pincode: '',
    gstNumber: '',
    panNumber: '',
  });

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    setIsLoading(true);
    try {
      const customers = await getAllCustomers();
      setCustomers(customers);
    } catch (error) {
      console.error('Error loading customers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      companyName: '',
      addressLine1: '',
      addressLine2: '',
      addressLine3: '',
      city: '',
      state: '',
      pincode: '',
      gstNumber: '',
      panNumber: '',
    });
    setIsAddingCustomer(false);
    setEditingCustomerId(null);
  };

  const handleSaveCustomer = async () => {
    if (!formData.companyName.trim()) {
      await message('Please enter company name', { 
        title: 'Validation Error', 
        type: 'error' 
      });
      return;
    }
    
    if (!formData.addressLine1.trim()) {
      await message('Please enter at least the first line of address', { 
        title: 'Validation Error', 
        type: 'error' 
      });
      return;
    }

    setIsSaving(true);
    try {
      const customerToSave: Customer = editingCustomerId
        ? { ...formData, id: editingCustomerId }
        : { ...formData };

      await saveCustomer(customerToSave);
      await loadCustomers();
      resetForm();
      await message(
        editingCustomerId 
          ? `Customer "${formData.companyName}" has been updated successfully!` 
          : `Customer "${formData.companyName}" has been added successfully!`,
        { 
          title: 'Success', 
          type: 'info' 
        }
      );
    } catch (error) {
      console.error('Error saving customer:', error);
      await message('Failed to save customer. Please try again.', { 
        title: 'Error', 
        type: 'error' 
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditCustomer = (customer: Customer) => {
    setFormData({
      companyName: customer.companyName,
      addressLine1: customer.addressLine1,
      addressLine2: customer.addressLine2,
      addressLine3: customer.addressLine3,
      city: customer.city,
      state: customer.state,
      pincode: customer.pincode,
      gstNumber: customer.gstNumber,
      panNumber: customer.panNumber,
    });
    setEditingCustomerId(customer.id || null);
    setIsAddingCustomer(true);
  };

  const handleDeleteCustomer = async (id: string, companyName: string) => {
    const confirmed = await ask(
      `Are you sure you want to delete customer "${companyName}"?\n\nThis action cannot be undone.`,
      { 
        title: 'Confirm Deletion', 
        type: 'warning' 
      }
    );
    
    if (confirmed) {
      try {
        await deleteCustomer(id);
        await loadCustomers();
        await message(`Customer "${companyName}" has been deleted successfully.`, { 
          title: 'Deleted', 
          type: 'info' 
        });
      } catch (error) {
        console.error('Error deleting customer:', error);
        await message('Failed to delete customer. Please try again.', { 
          title: 'Error', 
          type: 'error' 
        });
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white rounded-lg shadow-sm">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Customer Management</h1>
            <p className="text-gray-600">Manage customer templates for quick invoice creation</p>
          </div>
          {!isAddingCustomer && (
            <button
              onClick={() => setIsAddingCustomer(true)}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} />
              Add Customer
            </button>
          )}
        </div>
      </div>

      {isAddingCustomer && (
        <div className="bg-gray-50 p-6 rounded-lg mb-8 border-2 border-blue-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              {editingCustomerId ? 'Edit Customer' : 'Add New Customer'}
            </h2>
            <button
              onClick={resetForm}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                placeholder="Company Name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address Line 1 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.addressLine1}
                  onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                  placeholder="Address Line 1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address Line 2
                </label>
                <input
                  type="text"
                  value={formData.addressLine2}
                  onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
                  placeholder="Address Line 2"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address Line 3
                </label>
                <input
                  type="text"
                  value={formData.addressLine3}
                  onChange={(e) => setFormData({ ...formData, addressLine3: e.target.value })}
                  placeholder="Address Line 3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="City"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State
                </label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  placeholder="State"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pincode
                </label>
                <input
                  type="text"
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  placeholder="Pincode"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  GST Number
                </label>
                <input
                  type="text"
                  value={formData.gstNumber}
                  onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                  placeholder="GST Number"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  PAN Number
                </label>
                <input
                  type="text"
                  value={formData.panNumber}
                  onChange={(e) => setFormData({ ...formData, panNumber: e.target.value })}
                  placeholder="PAN Number"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={resetForm}
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCustomer}
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    {editingCustomerId ? 'Update' : 'Save'} Customer
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 size={48} className="text-blue-600 animate-spin" />
          <span className="ml-3 text-gray-600">Loading customers...</span>
        </div>
      ) : customers.length === 0 ? (
        <div className="text-center py-12">
          <Users size={64} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg">No customers saved yet</p>
          <p className="text-gray-400 mt-2">Add customer templates for quick invoice creation</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {customers.map((customer) => (
            <div
              key={customer.id}
              className="bg-gray-50 p-6 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-800">{customer.companyName}</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditCustomer(customer)}
                    className="text-blue-600 hover:text-blue-700"
                    title="Edit Customer"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => customer.id && handleDeleteCustomer(customer.id, customer.companyName)}
                    className="text-red-600 hover:text-red-700"
                    title="Delete Customer"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                <p>{customer.addressLine1}</p>
                {customer.addressLine2 && <p>{customer.addressLine2}</p>}
                {customer.addressLine3 && <p>{customer.addressLine3}</p>}
                <p>
                  {[customer.city, customer.state, customer.pincode].filter(Boolean).join(', ')}
                </p>
                {customer.gstNumber && (
                  <p className="mt-3">
                    <span className="font-medium text-gray-700">GST:</span> {customer.gstNumber}
                  </p>
                )}
                {customer.panNumber && (
                  <p>
                    <span className="font-medium text-gray-700">PAN:</span> {customer.panNumber}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
