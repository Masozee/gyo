import { eq, like, or, desc, and } from 'drizzle-orm';
import { db } from '../db-server';
import { invoices, projects, clients, type Invoice, type NewInvoice, invoiceLineItems } from '../schema';

export interface InvoiceWithRelations extends Invoice {
  project?: {
    id: number;
    title: string;
  };
  client?: {
    id: number;
    name: string;
    email: string | null;
  };
  lineItems?: {
    id: number;
    description: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    order: number;
  }[];
}

// Get all invoices with optional filters (SERVER-SIDE)
export async function getInvoicesServer(
  search?: string,
  status?: string,
  projectId?: number,
  clientId?: number
): Promise<InvoiceWithRelations[]> {
  const baseQuery = db.select({
    invoice: invoices,
    project: projects,
    client: clients,
  })
  .from(invoices)
  .leftJoin(projects, eq(invoices.projectId, projects.id))
  .leftJoin(clients, eq(invoices.clientId, clients.id));

  const conditions = [];

  if (search) {
    conditions.push(
      or(
        like(invoices.invoiceNumber, `%${search}%`),
        like(clients.name, `%${search}%`),
        like(projects.title, `%${search}%`)
      )
    );
  }

  if (status) {
    conditions.push(eq(invoices.status, status));
  }

  if (projectId) {
    conditions.push(eq(invoices.projectId, projectId));
  }

  if (clientId) {
    conditions.push(eq(invoices.clientId, clientId));
  }

  const result = conditions.length > 0 
    ? await baseQuery.where(and(...conditions)).orderBy(desc(invoices.dateIssued))
    : await baseQuery.orderBy(desc(invoices.dateIssued));
  
  return result.map(row => ({
    ...row.invoice,
    project: row.project || undefined,
    client: row.client || undefined,
  })) as InvoiceWithRelations[];
}

// Get invoice by ID with relationships (SERVER-SIDE)
export async function getInvoiceByIdServer(id: number): Promise<InvoiceWithRelations | null> {
  const [result] = await db.select({
    invoice: invoices,
    project: projects,
    client: clients,
  })
  .from(invoices)
  .leftJoin(projects, eq(invoices.projectId, projects.id))
  .leftJoin(clients, eq(invoices.clientId, clients.id))
  .where(eq(invoices.id, id))
  .limit(1);

  if (!result) return null;

  // Get line items separately
  const lineItems = await db.select()
    .from(invoiceLineItems)
    .where(eq(invoiceLineItems.invoiceId, id))
    .orderBy(invoiceLineItems.order);

  return {
    ...result.invoice,
    project: result.project || undefined,
    client: result.client || undefined,
    lineItems: lineItems.map(item => ({
      id: item.id,
      description: item.description,
      quantity: item.quantity || 1,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
      order: item.order || 0,
    })),
  } as InvoiceWithRelations;
}

// Create new invoice (SERVER-SIDE)
export async function createInvoiceServer(invoiceData: NewInvoice): Promise<Invoice> {
  const [invoice] = await db.insert(invoices)
    .values({
      ...invoiceData,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();
  
  return invoice;
}

// Update invoice (SERVER-SIDE)
export async function updateInvoiceServer(id: number, invoiceData: Partial<NewInvoice>): Promise<Invoice | null> {
  const [updatedInvoice] = await db.update(invoices)
    .set({
      ...invoiceData,
      updatedAt: new Date(),
    })
    .where(eq(invoices.id, id))
    .returning();
  
  return updatedInvoice || null;
}

// Delete invoice (SERVER-SIDE)
export async function deleteInvoiceServer(id: number): Promise<boolean> {
  try {
    await db.delete(invoices)
      .where(eq(invoices.id, id));
    
    return true;
  } catch (error) {
    console.error('Error deleting invoice:', error);
    return false;
  }
} 