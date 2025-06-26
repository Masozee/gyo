import { db } from '@/lib/db-server';
import { clients, type Client, type NewClient } from '@/lib/schema';
import { eq, ilike, desc, count } from 'drizzle-orm';

// Get all clients with optional search
export async function getClientsServer(search?: string): Promise<Client[]> {
  console.log('Clients API called with params:', { search });
  
  let query = db.select().from(clients);
  
  if (search) {
    query = query.where(
      ilike(clients.name, `%${search}%`)
    ) as any;
  }
  
  const result = await query.orderBy(desc(clients.createdAt));
  return result;
}

// Get active clients only
export async function getActiveClientsServer(): Promise<Client[]> {
  console.log('Active clients API called');
  
  const result = await db.select()
    .from(clients)
    .where(eq(clients.isActive, true))
    .orderBy(desc(clients.createdAt));
    
  return result;
}

// Get client by ID
export async function getClientByIdServer(id: number): Promise<Client | null> {
  console.log('Client by ID API called:', id);
  
  const result = await db.select()
    .from(clients)
    .where(eq(clients.id, id))
    .limit(1);
    
  return result[0] || null;
}

// Create new client
export async function createClientServer(clientData: NewClient): Promise<Client> {
  console.log('Create client API called with data:', clientData);
  
  const result = await db.insert(clients)
    .values({
      ...clientData,
      updatedAt: new Date(),
    })
    .returning();
    
  return result[0];
}

// Update client
export async function updateClientServer(id: number, clientData: Partial<NewClient>): Promise<Client> {
  console.log('Update client API called:', id, clientData);
  
  const result = await db.update(clients)
    .set({
      ...clientData,
      updatedAt: new Date(),
    })
    .where(eq(clients.id, id))
    .returning();
    
  if (result.length === 0) {
    throw new Error('Client not found');
  }
  
  return result[0];
}

// Delete client
export async function deleteClientServer(id: number): Promise<void> {
  console.log('Delete client API called:', id);
  
  const result = await db.delete(clients)
    .where(eq(clients.id, id))
    .returning();
    
  if (result.length === 0) {
    throw new Error('Client not found');
  }
}

// Toggle client status
export async function toggleClientStatusServer(id: number): Promise<Client> {
  console.log('Toggle client status API called:', id);
  
  // First get the current status
  const currentClient = await getClientByIdServer(id);
  if (!currentClient) {
    throw new Error('Client not found');
  }
  
  // Toggle the status
  const newStatus = !currentClient.isActive;
  
  const result = await db.update(clients)
    .set({
      isActive: newStatus,
      updatedAt: new Date(),
    })
    .where(eq(clients.id, id))
    .returning();
    
  return result[0];
}

// Get clients count for pagination
export async function getClientsCountServer(search?: string): Promise<number> {
  let query = db.select({ count: count() }).from(clients);
  
  if (search) {
    query = query.where(
      ilike(clients.name, `%${search}%`)
    ) as any;
  }
  
  const result = await query;
  return result[0].count;
} 