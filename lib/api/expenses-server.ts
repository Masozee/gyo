import { eq, like, or, desc, and } from 'drizzle-orm';
import { db } from '../db-server';
import { expenses, projects, users, type Expense, type NewExpense } from '../schema';

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

// Get all expenses with optional search and filters (SERVER-SIDE)
export async function getExpensesServer(
  search?: string, 
  projectId?: number,
  category?: string,
  startDate?: string,
  endDate?: string,
  userId?: number
): Promise<ExpenseWithRelations[]> {
  const baseQuery = db.select({
    expense: expenses,
    project: projects,
    user: users,
  })
  .from(expenses)
  .leftJoin(projects, eq(expenses.projectId, projects.id))
  .leftJoin(users, eq(expenses.userId, users.id));

  const conditions = [];

  if (search) {
    conditions.push(
      or(
        like(expenses.title, `%${search}%`),
        like(expenses.description, `%${search}%`),
        like(projects.title, `%${search}%`)
      )
    );
  }

  if (projectId) {
    conditions.push(eq(expenses.projectId, projectId));
  }

  if (category) {
    conditions.push(eq(expenses.category, category));
  }

  if (startDate) {
    conditions.push(eq(expenses.date, startDate));
  }

  if (endDate) {
    conditions.push(eq(expenses.date, endDate));
  }

  if (userId) {
    conditions.push(eq(expenses.userId, userId));
  }

  const result = conditions.length > 0 
    ? await baseQuery.where(and(...conditions)).orderBy(desc(expenses.date))
    : await baseQuery.orderBy(desc(expenses.date));
  
  return result.map(row => ({
    ...row.expense,
    project: row.project || undefined,
    user: row.user || undefined,
  })) as ExpenseWithRelations[];
}

// Get expense by ID with relationships (SERVER-SIDE)
export async function getExpenseByIdServer(id: number): Promise<ExpenseWithRelations | null> {
  const [result] = await db.select({
    expense: expenses,
    project: projects,
    user: users,
  })
  .from(expenses)
  .leftJoin(projects, eq(expenses.projectId, projects.id))
  .leftJoin(users, eq(expenses.userId, users.id))
  .where(eq(expenses.id, id))
  .limit(1);

  if (!result) return null;

  return {
    ...result.expense,
    project: result.project || undefined,
    user: result.user || undefined,
  } as ExpenseWithRelations;
}

// Create new expense (SERVER-SIDE)
export async function createExpenseServer(expenseData: NewExpense): Promise<Expense> {
  const [expense] = await db.insert(expenses)
    .values({
      ...expenseData,
      createdAt: new Date(),
    })
    .returning();
  
  return expense;
}

// Update expense (SERVER-SIDE)
export async function updateExpenseServer(id: number, expenseData: Partial<NewExpense>): Promise<Expense | null> {
  const [updatedExpense] = await db.update(expenses)
    .set(expenseData)
    .where(eq(expenses.id, id))
    .returning();
  
  return updatedExpense || null;
}

// Delete expense (SERVER-SIDE)
export async function deleteExpenseServer(id: number): Promise<boolean> {
  try {
    await db.delete(expenses)
      .where(eq(expenses.id, id));
    
    return true;
  } catch (error) {
    console.error('Error deleting expense:', error);
    return false;
  }
}

// Get expenses by project (SERVER-SIDE)
export async function getExpensesByProjectServer(projectId: number): Promise<Expense[]> {
  return await db.select()
    .from(expenses)
    .where(eq(expenses.projectId, projectId))
    .orderBy(desc(expenses.date));
}

// Get expense totals by project (SERVER-SIDE)
export async function getExpenseTotalsByProjectServer(projectId: number): Promise<{
  total: number;
  billableTotal: number;
  nonBillableTotal: number;
  reimbursedTotal: number;
  pendingTotal: number;
}> {
  const projectExpenses = await db.select()
    .from(expenses)
    .where(eq(expenses.projectId, projectId));

  const total = projectExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const billableTotal = projectExpenses.filter(exp => exp.billable).reduce((sum, exp) => sum + exp.amount, 0);
  const nonBillableTotal = projectExpenses.filter(exp => !exp.billable).reduce((sum, exp) => sum + exp.amount, 0);
  const reimbursedTotal = projectExpenses.filter(exp => exp.reimbursed).reduce((sum, exp) => sum + exp.amount, 0);
  const pendingTotal = projectExpenses.filter(exp => !exp.reimbursed).reduce((sum, exp) => sum + exp.amount, 0);

  return {
    total,
    billableTotal,
    nonBillableTotal,
    reimbursedTotal,
    pendingTotal
  };
}

// Get expense statistics (SERVER-SIDE)
export async function getExpenseStatsServer(): Promise<{
  totalExpenses: number;
  totalAmount: number;
  averageAmount: number;
  billableAmount: number;
  reimbursedAmount: number;
}> {
  const allExpenses = await db.select().from(expenses);
  
  const totalExpenses = allExpenses.length;
  const totalAmount = allExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const averageAmount = totalExpenses > 0 ? totalAmount / totalExpenses : 0;
  const billableAmount = allExpenses.filter(exp => exp.billable).reduce((sum, exp) => sum + exp.amount, 0);
  const reimbursedAmount = allExpenses.filter(exp => exp.reimbursed).reduce((sum, exp) => sum + exp.amount, 0);

  return {
    totalExpenses,
    totalAmount,
    averageAmount,
    billableAmount,
    reimbursedAmount
  };
} 