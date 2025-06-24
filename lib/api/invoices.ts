


export interface InvoiceFormData {
  projectId: number;
  clientId: number;
  dateIssued: string;
  dueDate?: string;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  notes?: string;
  terms?: string;
  lineItems: {
    description: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }[];
}

export interface InvoiceWithRelations {
  id: number;
  projectId: number;
  clientId: number;
  invoiceNumber: string;
  dateIssued: string;
  dueDate?: string | null;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  paidAmount?: number | null;
  currency: string;
  status: string;
  notes?: string | null;
  terms?: string | null;
  invoiceUrl?: string | null;
  sentAt?: string | null;
  paidAt?: string | null;
  createdAt: string;
  updatedAt: string;
  client?: {
    id: number;
    name: string;
    email: string;
    company?: string | null;
  };
  project?: {
    id: number;
    title: string;
  };
  lineItems?: {
    id: number;
    description: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    order: number;
  }[];
  payments?: {
    id: number;
    amount: number;
    date: string;
    method: string;
  }[];
}

const API_BASE = '/api/invoices';

// Generate automatic invoice number in format: INV001-0001-03-2025
export async function generateInvoiceNumber(clientId: number): Promise<string> {
  const response = await fetch(`${API_BASE}/generate-number?clientId=${clientId}`);
  if (!response.ok) {
    throw new Error('Failed to generate invoice number');
  }
  const data = await response.json();
  return data.invoiceNumber;
}

export async function getInvoices(search?: string): Promise<InvoiceWithRelations[]> {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  
  const response = await fetch(`${API_BASE}?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch invoices');
  }
  const data = await response.json();
  return data.invoices || data;
}

export async function getInvoice(id: number): Promise<InvoiceWithRelations | null> {
  const response = await fetch(`${API_BASE}/${id}`);
  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error('Failed to fetch invoice');
  }
  return response.json();
}

export async function getInvoicesByProject(projectId: number): Promise<InvoiceWithRelations[]> {
  const response = await fetch(`${API_BASE}?projectId=${projectId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch project invoices');
  }
  const data = await response.json();
  return data.invoices || data;
}

export async function getInvoicesByClient(clientId: number): Promise<InvoiceWithRelations[]> {
  const response = await fetch(`${API_BASE}?clientId=${clientId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch client invoices');
  }
  const data = await response.json();
  return data.invoices || data;
}

export async function createInvoice(invoiceData: InvoiceFormData): Promise<InvoiceWithRelations> {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(invoiceData),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create invoice');
  }
  
  return response.json();
}

export async function updateInvoice(id: number, invoiceData: Partial<InvoiceFormData>): Promise<InvoiceWithRelations> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(invoiceData),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update invoice');
  }
  
  return response.json();
}

export async function deleteInvoice(id: number): Promise<void> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete invoice');
  }
}

export async function updateInvoiceStatus(id: number, status: string): Promise<InvoiceWithRelations> {
  const response = await fetch(`${API_BASE}/${id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update invoice status');
  }
  
  return response.json();
}

export async function getInvoiceStats() {
  const response = await fetch(`${API_BASE}/stats`);
  if (!response.ok) {
    throw new Error('Failed to fetch invoice stats');
  }
  return response.json();
} 