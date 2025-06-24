import { eq, like, or, desc } from 'drizzle-orm';
import { db } from './db';
import { clients, type Client, type NewClient } from './schema';

// Get all clients with optional search
export async function getClients(search?: string): Promise<Client[]> {
  if (search) {
    return await db.select()
      .from(clients)
      .where(
        or(
          like(clients.name, `%${search}%`),
          like(clients.email, `%${search}%`),
          like(clients.company, `%${search}%`)
        )
      )
      .orderBy(desc(clients.createdAt));
  }
  
  return await db.select()
    .from(clients)
    .orderBy(desc(clients.createdAt));
}

// Get client by ID
export async function getClientById(id: number): Promise<Client | null> {
  const [client] = await db.select()
    .from(clients)
    .where(eq(clients.id, id))
    .limit(1);
  
  return client || null;
}

// Create new client
export async function createClient(clientData: NewClient): Promise<Client> {
  const [client] = await db.insert(clients)
    .values({
      ...clientData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    .returning();
  
  return client;
}

// Update client
export async function updateClient(id: number, clientData: Partial<NewClient>): Promise<Client | null> {
  const [updatedClient] = await db.update(clients)
    .set({
      ...clientData,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(clients.id, id))
    .returning();
  
  return updatedClient || null;
}

// Delete client
export async function deleteClient(id: number): Promise<boolean> {
  try {
    await db.delete(clients)
      .where(eq(clients.id, id));
    
    return true;
  } catch (error) {
    console.error('Error deleting client:', error);
    return false;
  }
}

// Get active clients only
export async function getActiveClients(): Promise<Client[]> {
  return await db.select()
    .from(clients)
    .where(eq(clients.isActive, true))
    .orderBy(desc(clients.createdAt));
}

// Toggle client active status
export async function toggleClientStatus(id: number): Promise<Client | null> {
  const client = await getClientById(id);
  if (!client) return null;
  
  const [updatedClient] = await db.update(clients)
    .set({
      isActive: !client.isActive,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(clients.id, id))
    .returning();
  
  return updatedClient || null;
} 