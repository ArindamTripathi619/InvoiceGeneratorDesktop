import { useState, useEffect, useCallback } from 'react';
import { Invoice, LineItem, Customer } from '../types/invoice';
import { getCurrentFinancialYear } from '../utils/numberToWords';
import { customerService } from '../services/customerService';
import { invoiceService } from '../services/invoiceService';

export function useInvoiceForm() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');

    const [invoiceNumber, setInvoiceNumber] = useState<string>('');
    const [financialYear] = useState<string>(getCurrentFinancialYear());
    const [invoiceDate, setInvoiceDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [workOrderReference, setWorkOrderReference] = useState<string>('');
    const [workOrderDate, setWorkOrderDate] = useState<string>('');

    const [customer, setCustomer] = useState<Customer>({
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

    const [lineItems, setLineItems] = useState<LineItem[]>([
        {
            id: '1',
            serialNumber: 1,
            description: '',
            hsnSacCode: '',
            rate: 0,
            quantity: 0,
            unit: 'kWp',
            amount: 0,
        },
    ]);

    const [cgstPercentage, setCgstPercentage] = useState<number>(9);
    const [sgstPercentage, setSgstPercentage] = useState<number>(9);
    const [isGenerating, setIsGenerating] = useState<boolean>(false);

    const loadData = useCallback(async () => {
        try {
            const customerList = await customerService.getAllCustomers();
            setCustomers(customerList);

            const draft = await invoiceService.getDraftInvoice();
            if (draft) {
                if (draft.invoiceNumber) setInvoiceNumber(draft.invoiceNumber);
                if (draft.invoiceDate) setInvoiceDate(draft.invoiceDate);
                if (draft.workOrderReference) setWorkOrderReference(draft.workOrderReference);
                if (draft.workOrderDate) setWorkOrderDate(draft.workOrderDate);
                if (draft.customer) {
                    setCustomer(prev => ({ ...prev, ...draft.customer }));
                }
                if (draft.lineItems && draft.lineItems.length > 0) {
                    setLineItems(draft.lineItems);
                }
                if (draft.cgstPercentage !== undefined) setCgstPercentage(draft.cgstPercentage);
                if (draft.sgstPercentage !== undefined) setSgstPercentage(draft.sgstPercentage);
            }
        } catch (error) {
            console.error('Error loading data:', error);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleAutoSave = useCallback(async () => {
        const draft: Partial<Invoice> = {
            invoiceNumber,
            financialYear,
            invoiceDate,
            workOrderReference,
            workOrderDate,
            customer,
            lineItems,
            cgstPercentage,
            sgstPercentage,
        };
        await invoiceService.saveDraftInvoice(draft);
    }, [invoiceNumber, financialYear, invoiceDate, workOrderReference, workOrderDate, customer, lineItems, cgstPercentage, sgstPercentage]);

    const handleCustomerSelect = (customerId: string) => {
        setSelectedCustomerId(customerId);
        if (customerId) {
            const selectedCustomer = customers.find(c => c.id === customerId);
            if (selectedCustomer) {
                setCustomer({
                    companyName: selectedCustomer.companyName || '',
                    addressLine1: selectedCustomer.addressLine1 || '',
                    addressLine2: selectedCustomer.addressLine2 || '',
                    addressLine3: selectedCustomer.addressLine3 || '',
                    city: selectedCustomer.city || '',
                    state: selectedCustomer.state || '',
                    pincode: selectedCustomer.pincode || '',
                    gstNumber: selectedCustomer.gstNumber || '',
                    panNumber: selectedCustomer.panNumber || '',
                });
            }
        }
    };

    const updateCustomerField = (field: keyof Customer, value: string) => {
        setCustomer(prev => ({ ...prev, [field]: value }));
    };

    const addLineItem = () => {
        const newItem: LineItem = {
            id: Date.now().toString(),
            serialNumber: lineItems.length + 1,
            description: '',
            hsnSacCode: '',
            rate: 0,
            quantity: 0,
            unit: 'kWp',
            amount: 0,
        };
        setLineItems([...lineItems, newItem]);
    };

    const removeLineItem = (id: string) => {
        if (lineItems.length === 1) return;
        const updatedItems = lineItems.filter(item => item.id !== id)
            .map((item, index) => ({ ...item, serialNumber: index + 1 }));
        setLineItems(updatedItems);
    };

    const updateLineItem = (id: string, field: keyof LineItem, value: any) => {
        const updatedItems = lineItems.map(item => {
            if (item.id === id) {
                const updated = { ...item, [field]: value };
                if (field === 'rate' || field === 'quantity') {
                    const KWP_TO_WATT_FACTOR = 1000;
                    const amountPaise = Math.round(updated.rate * updated.quantity * KWP_TO_WATT_FACTOR * 100);
                    updated.amount = amountPaise / 100;
                }
                return updated;
            }
            return item;
        });
        setLineItems(updatedItems);
    };

    const calculateTotals = () => {
        const toPaise = (num: number) => Math.round(num * 100);
        const totalBasicPaise = lineItems.reduce((sum, item) => sum + toPaise(item.amount), 0);
        const cgstPaise = Math.round((totalBasicPaise * cgstPercentage) / 100);
        const sgstPaise = Math.round((totalBasicPaise * sgstPercentage) / 100);
        const grandTotalPaise = totalBasicPaise + cgstPaise + sgstPaise;

        return {
            totalBasicAmount: totalBasicPaise / 100,
            cgstAmount: cgstPaise / 100,
            sgstAmount: sgstPaise / 100,
            grandTotal: grandTotalPaise / 100,
        };
    };

    const handleReset = () => {
        setInvoiceNumber('');
        setInvoiceDate(new Date().toISOString().split('T')[0]);
        setWorkOrderReference('');
        setWorkOrderDate('');
        setSelectedCustomerId('');
        setCustomer({
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
        setLineItems([
            {
                id: '1',
                serialNumber: 1,
                description: '',
                hsnSacCode: '',
                rate: 0,
                quantity: 0,
                unit: 'kWp',
                amount: 0,
            },
        ]);
        setCgstPercentage(9);
        setSgstPercentage(9);
        invoiceService.clearDraftInvoice();
    };

    const validateForm = (): string | null => {
        if (!invoiceNumber.trim()) return 'Please enter invoice number';
        if (!/^\d+$/.test(invoiceNumber.trim())) return 'Invoice number should contain only digits (e.g., 022)';
        if (!invoiceDate) return 'Please select invoice date';
        if (!customer.companyName.trim()) return 'Please enter customer company name';
        if (!customer.addressLine1.trim()) return 'Please enter customer address';
        if (lineItems.length === 0) return 'Please add at least one line item';

        for (const item of lineItems) {
            if (!item.description.trim()) return `Please enter description for item ${item.serialNumber}`;
            if (item.rate <= 0) return `Please enter valid rate for item ${item.serialNumber}`;
            if (item.quantity <= 0) return `Please enter valid quantity for item ${item.serialNumber}`;
        }
        return null;
    };

    return {
        state: {
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
            totals: calculateTotals(),
        },
        actions: {
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
        }
    };
}
