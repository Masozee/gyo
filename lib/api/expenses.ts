import { config } from '@/lib/config';
import { type Expense, type NewExpense } from '../schema';

const API_BASE_URL = config.apiUrl;

export interface ExpenseWithRelations extends Expense {
  project?: {
    id: number;
    title: string;
  };
  user?: {
    id: number;
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
}

export interface ExpenseFormData {
  title: string;
  description?: string;
  projectId: number;
  userId: number;
  amount: number;
  category?: string;
  date: string;
  billable?: boolean;
  reimbursed?: boolean;
  receipt?: string;
}

// Get all expenses with optional search and filters
export async function getExpenses(
  search?: string, 
  projectId?: number,
  category?: string,
  startDate?: string,
  endDate?: string
): Promise<ExpenseWithRelations[]> {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (projectId) params.append('projectId', projectId.toString());
  if (category) params.append('category', category);
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);

  const response = await fetch(`${API_BASE_URL}/expenses?${params.toString()}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch expenses: ${response.statusText}`);
  }
  
  return response.json();
}

// Get expense by ID with relationships
export async function getExpenseById(id: number): Promise<ExpenseWithRelations | null> {
  const response = await fetch(`${API_BASE_URL}/expenses/${id}`);
  
  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error(`Failed to fetch expense: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.expense;
}

// Create new expense
export async function createExpense(expenseData: ExpenseFormData): Promise<Expense> {
  const response = await fetch(`${API_BASE_URL}/expenses`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(expenseData),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || `Failed to create expense: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.expense;
}

// Update expense
export async function updateExpense(id: number, expenseData: Partial<ExpenseFormData>): Promise<Expense | null> {
  const response = await fetch(`${API_BASE_URL}/expenses/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(expenseData),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || `Failed to update expense: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.expense;
}

// Delete expense
export async function deleteExpense(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/expenses/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || `Failed to delete expense: ${response.statusText}`);
  }
}

// Get expenses by project
export async function getExpensesByProject(projectId: number): Promise<Expense[]> {
  return getExpenses(undefined, projectId);
}

// Get expenses by user
export async function getExpensesByUser(userId: number): Promise<Expense[]> {
  const params = new URLSearchParams();
  params.append('userId', userId.toString());

  const response = await fetch(`${API_BASE_URL}/expenses?${params.toString()}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch user expenses: ${response.statusText}`);
  }
  
  return response.json();
}

// Get expense totals by project
export async function getExpenseTotalsByProject(projectId: number): Promise<{
  totalAmount: number;
  billableAmount: number;
  reimbursedAmount: number;
}> {
  const response = await fetch(`${API_BASE_URL}/expenses/project/${projectId}/totals`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch expense totals: ${response.statusText}`);
  }
  
  return response.json();
}

// Get expense statistics
export async function getExpenseStats(): Promise<{
  total: number;
  thisMonth: number;
  billable: number;
  reimbursed: number;
  categories: { [key: string]: number };
}> {
  const response = await fetch(`${API_BASE_URL}/expenses/stats`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch expense stats: ${response.statusText}`);
  }
  
  return response.json();
} 