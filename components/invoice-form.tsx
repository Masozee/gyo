"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Calculator } from 'lucide-react';
import type { InvoiceFormData } from '@/lib/api/invoices';
import type { Client, Project } from '@/lib/schema';
import { formatCurrency, defaultCurrencySettings, getCurrencySymbol } from '@/lib/format-currency';

interface InvoiceFormProps {
  initialData?: Partial<InvoiceFormData>;
  onSubmit: (data: InvoiceFormData) => void;
  isSubmitting: boolean;
}

interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export function InvoiceForm({ initialData, onSubmit, isSubmitting }: InvoiceFormProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [previewInvoiceNumber, setPreviewInvoiceNumber] = useState<string>('');
  const [loadingClients, setLoadingClients] = useState(true);
  const [loadingProjects, setLoadingProjects] = useState(true);

  // Form state
  const [formData, setFormData] = useState<InvoiceFormData>({
    projectId: initialData?.projectId || 0,
    clientId: initialData?.clientId || 0,
    dateIssued: initialData?.dateIssued || new Date().toISOString().split('T')[0],
    dueDate: initialData?.dueDate || '',
    subtotal: initialData?.subtotal || 0,
    taxRate: initialData?.taxRate || 0,
    taxAmount: initialData?.taxAmount || 0,
    totalAmount: initialData?.totalAmount || 0,
    currency: initialData?.currency || 'EUR',
    status: initialData?.status || 'DRAFT',
    notes: initialData?.notes || '',
    terms: initialData?.terms || '',
    lineItems: initialData?.lineItems || [
      { description: '', quantity: 1, unitPrice: 0, totalPrice: 0 }
    ],
  });

  // Load clients and projects
  useEffect(() => {
    const loadData = async () => {
      try {
        const [clientsResponse, projectsResponse] = await Promise.all([
          fetch('/api/clients'),
          fetch('/api/projects'),
        ]);
        
        if (!clientsResponse.ok || !projectsResponse.ok) {
          throw new Error('Failed to fetch data');
        }
        
        const [clientsData, projectsData] = await Promise.all([
          clientsResponse.json(),
          projectsResponse.json(),
        ]);
        
        setClients(clientsData.clients);
        setProjects(projectsData.projects);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoadingClients(false);
        setLoadingProjects(false);
      }
    };

    loadData();
  }, []);

  // Generate preview invoice number when client changes
  useEffect(() => {
    if (formData.clientId > 0) {
      // Preview will be generated on server when creating the invoice
      setPreviewInvoiceNumber('Preview will be generated automatically');
    } else {
      setPreviewInvoiceNumber('');
    }
  }, [formData.clientId]);

  // Calculate totals when line items change
  useEffect(() => {
    const subtotal = formData.lineItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const taxAmount = subtotal * (formData.taxRate / 100);
    const totalAmount = subtotal + taxAmount;

    setFormData(prev => ({
      ...prev,
      subtotal,
      taxAmount,
      totalAmount,
    }));
  }, [formData.lineItems, formData.taxRate]);

  const handleLineItemChange = (index: number, field: keyof LineItem, value: string | number) => {
    const newLineItems = [...formData.lineItems];
    newLineItems[index] = {
      ...newLineItems[index],
      [field]: value,
    };

    // Recalculate total price for this line item
    if (field === 'quantity' || field === 'unitPrice') {
      newLineItems[index].totalPrice = newLineItems[index].quantity * newLineItems[index].unitPrice;
    }

    setFormData(prev => ({ ...prev, lineItems: newLineItems }));
  };

  const addLineItem = () => {
    setFormData(prev => ({
      ...prev,
      lineItems: [
        ...prev.lineItems,
        { description: '', quantity: 1, unitPrice: 0, totalPrice: 0 }
      ],
    }));
  };

  const removeLineItem = (index: number) => {
    if (formData.lineItems.length > 1) {
      setFormData(prev => ({
        ...prev,
        lineItems: prev.lineItems.filter((_, i) => i !== index),
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const formatCurrencyAmount = (amount: number) => {
    // Use the currency from form data
    const currencySettings = {
      ...defaultCurrencySettings,
      defaultCurrency: formData.currency,
      currencySymbol: getCurrencySymbol(formData.currency),
    };
    return formatCurrency(amount, currencySettings);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Invoice Details
            {previewInvoiceNumber && (
              <Badge variant="outline" className="font-mono text-xs">
                Auto-generated on save
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="clientId">Client *</Label>
              <Select
                value={formData.clientId.toString()}
                onValueChange={(value) => setFormData(prev => ({ ...prev, clientId: parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent>
                  {loadingClients ? (
                    <SelectItem value="loading" disabled>Loading clients...</SelectItem>
                  ) : (
                    clients.map(client => (
                      <SelectItem key={client.id} value={client.id.toString()}>
                        {client.name} {client.company && `(${client.company})`}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="projectId">Project *</Label>
              <Select
                value={formData.projectId.toString()}
                onValueChange={(value) => setFormData(prev => ({ ...prev, projectId: parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {loadingProjects ? (
                    <SelectItem value="loading" disabled>Loading projects...</SelectItem>
                  ) : (
                    projects.map(project => (
                      <SelectItem key={project.id} value={project.id.toString()}>
                        {project.title}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="dateIssued">Date Issued *</Label>
              <Input
                id="dateIssued"
                type="date"
                value={formData.dateIssued}
                onChange={(e) => setFormData(prev => ({ ...prev, dateIssued: e.target.value }))}
                required
              />
            </div>

            <div>
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="SENT">Sent</SelectItem>
                  <SelectItem value="PAID">Paid</SelectItem>
                  <SelectItem value="OVERDUE">Overdue</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="currency">Currency</Label>
              <Select
                value={formData.currency}
                onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EUR">EUR - Euro (€)</SelectItem>
                  <SelectItem value="USD">USD - US Dollar ($)</SelectItem>
                  <SelectItem value="GBP">GBP - British Pound (£)</SelectItem>
                  <SelectItem value="CHF">CHF - Swiss Franc</SelectItem>
                  <SelectItem value="SEK">SEK - Swedish Krona (kr)</SelectItem>
                  <SelectItem value="NOK">NOK - Norwegian Krone (kr)</SelectItem>
                  <SelectItem value="DKK">DKK - Danish Krone (kr)</SelectItem>
                  <SelectItem value="PLN">PLN - Polish Złoty (zł)</SelectItem>
                  <SelectItem value="CZK">CZK - Czech Koruna (Kč)</SelectItem>
                  <SelectItem value="JPY">JPY - Japanese Yen (¥)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Line Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Line Items
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addLineItem}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {formData.lineItems.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-4 items-end">
                <div className="col-span-5">
                  <Label>Description</Label>
                  <Input
                    value={item.description}
                    onChange={(e) => handleLineItemChange(index, 'description', e.target.value)}
                    placeholder="Item description"
                  />
                </div>
                <div className="col-span-2">
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.quantity}
                    onChange={(e) => handleLineItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="col-span-2">
                  <Label>Unit Price</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.unitPrice}
                    onChange={(e) => handleLineItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="col-span-2">
                  <Label>Total</Label>
                  <div className="font-medium text-sm p-2 bg-gray-50 rounded">
                    {formatCurrencyAmount(item.totalPrice)}
                  </div>
                </div>
                <div className="col-span-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeLineItem(index)}
                    disabled={formData.lineItems.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Totals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calculator className="h-5 w-5 mr-2" />
            Totals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span>Subtotal:</span>
              <span className="font-medium">{formatCurrencyAmount(formData.subtotal)}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Label htmlFor="taxRate">Tax Rate (%):</Label>
                <Input
                  id="taxRate"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={formData.taxRate}
                  onChange={(e) => setFormData(prev => ({ ...prev, taxRate: parseFloat(e.target.value) || 0 }))}
                  className="w-20"
                />
              </div>
              <span className="font-medium">{formatCurrencyAmount(formData.taxAmount)}</span>
            </div>
            
            <Separator />
            
            <div className="flex justify-between items-center text-lg font-semibold">
              <span>Total Amount:</span>
              <span>{formatCurrencyAmount(formData.totalAmount)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes and Terms */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Additional notes for this invoice"
              rows={3}
            />
          </div>
          
          <div>
            <Label htmlFor="terms">Terms & Conditions</Label>
            <Textarea
              id="terms"
              value={formData.terms}
              onChange={(e) => setFormData(prev => ({ ...prev, terms: e.target.value }))}
              placeholder="Payment terms and conditions"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create Invoice'}
        </Button>
      </div>
    </form>
  );
} 