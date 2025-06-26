import { eq, like, or, desc, and, gte, lte, asc } from 'drizzle-orm';
import { db } from '../db-server';
import { events, projects, clients, users, type Event, type NewEvent } from '../schema';

export interface EventWithRelations extends Event {
  project?: {
    id: number;
    title: string;
    status: string;
  };
  client?: {
    id: number;
    name: string;
    company?: string | null;
  };
  user?: {
    id: number;
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
}

// Get all events with optional filters (SERVER-SIDE)
export async function getEventsServer(
  userId?: number,
  startDate?: string,
  endDate?: string,
  projectId?: number,
  clientId?: number,
  type?: string
): Promise<EventWithRelations[]> {
  try {
    // First try to get just events without joins to test table existence
    console.log('Fetching events from database...')
    
    const conditions = [];

    if (userId) {
      conditions.push(eq(events.userId, userId));
    }

    if (startDate) {
      conditions.push(gte(events.startDate, startDate));
    }

    if (endDate) {
      conditions.push(lte(events.startDate, endDate));
    }

    if (projectId) {
      conditions.push(eq(events.projectId, projectId));
    }

    if (clientId) {
      conditions.push(eq(events.clientId, clientId));
    }

    if (type) {
      conditions.push(eq(events.type, type));
    }

    // Simple query first to test if table exists
    const simpleResult = conditions.length > 0 
      ? await db.select().from(events).where(and(...conditions)).orderBy(asc(events.startDate))
      : await db.select().from(events).orderBy(asc(events.startDate));
    
    console.log(`Found ${simpleResult.length} events`)
    
    // If simple query works, try with joins
    if (simpleResult.length === 0) {
      return simpleResult.map(event => ({
        ...event,
        project: undefined,
        client: undefined,
        user: undefined,
      })) as EventWithRelations[];
    }

    // Now try with joins
    const baseQuery = db.select({
      event: events,
      project: projects,
      client: clients,
      user: users,
    })
    .from(events)
    .leftJoin(projects, eq(events.projectId, projects.id))
    .leftJoin(clients, eq(events.clientId, clients.id))
    .leftJoin(users, eq(events.userId, users.id));

    const result = conditions.length > 0 
      ? await baseQuery.where(and(...conditions)).orderBy(asc(events.startDate))
      : await baseQuery.orderBy(asc(events.startDate));
    
    return result.map(row => ({
      ...row.event,
      project: row.project ? {
        id: row.project.id,
        title: row.project.title,
        status: row.project.status,
      } : undefined,
      client: row.client ? {
        id: row.client.id,
        name: row.client.name,
        company: row.client.company,
      } : undefined,
      user: row.user ? {
        id: row.user.id,
        firstName: row.user.firstName,
        lastName: row.user.lastName,
        email: row.user.email,
      } : undefined,
    })) as EventWithRelations[];
  } catch (error) {
    console.error('Error in getEventsServer:', error);
    throw error;
  }
}

// Get event by ID with relationships (SERVER-SIDE)
export async function getEventByIdServer(id: number): Promise<EventWithRelations | null> {
  const [result] = await db.select({
    event: events,
    project: projects,
    client: clients,
    user: users,
  })
  .from(events)
  .leftJoin(projects, eq(events.projectId, projects.id))
  .leftJoin(clients, eq(events.clientId, clients.id))
  .leftJoin(users, eq(events.userId, users.id))
  .where(eq(events.id, id))
  .limit(1);

  if (!result) return null;

  return {
    ...result.event,
    project: result.project ? {
      id: result.project.id,
      title: result.project.title,
      status: result.project.status,
    } : undefined,
    client: result.client ? {
      id: result.client.id,
      name: result.client.name,
      company: result.client.company,
    } : undefined,
    user: result.user ? {
      id: result.user.id,
      firstName: result.user.firstName,
      lastName: result.user.lastName,
      email: result.user.email,
    } : undefined,
  } as EventWithRelations;
}

// Create new event (SERVER-SIDE)
export async function createEventServer(eventData: NewEvent): Promise<Event> {
  const [event] = await db.insert(events)
    .values({
      ...eventData,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();
  
  return event;
}

// Update event (SERVER-SIDE)
export async function updateEventServer(id: number, eventData: Partial<NewEvent>): Promise<Event | null> {
  const [updatedEvent] = await db.update(events)
    .set({
      ...eventData,
      updatedAt: new Date(),
    })
    .where(eq(events.id, id))
    .returning();
  
  return updatedEvent || null;
}

// Delete event (SERVER-SIDE)
export async function deleteEventServer(id: number): Promise<boolean> {
  try {
    await db.delete(events)
      .where(eq(events.id, id));
    
    return true;
  } catch (error) {
    console.error('Error deleting event:', error);
    return false;
  }
}

// Get events for a specific date range (for calendar view)
export async function getEventsByDateRangeServer(
  userId: number,
  startDate: string,
  endDate: string
): Promise<EventWithRelations[]> {
  return getEventsServer(userId, startDate, endDate);
}

// Get events for a specific project
export async function getEventsByProjectServer(projectId: number): Promise<EventWithRelations[]> {
  return getEventsServer(undefined, undefined, undefined, projectId);
}

// Get upcoming events for a user
export async function getUpcomingEventsServer(userId: number, limit: number = 10): Promise<EventWithRelations[]> {
  const today = new Date().toISOString().split('T')[0];
  
  const result = await db.select({
    event: events,
    project: projects,
    client: clients,
    user: users,
  })
  .from(events)
  .leftJoin(projects, eq(events.projectId, projects.id))
  .leftJoin(clients, eq(events.clientId, clients.id))
  .leftJoin(users, eq(events.userId, users.id))
  .where(and(
    eq(events.userId, userId),
    gte(events.startDate, today),
    eq(events.status, 'confirmed')
  ))
  .orderBy(asc(events.startDate), asc(events.startTime))
  .limit(limit);
  
  return result.map(row => ({
    ...row.event,
    project: row.project ? {
      id: row.project.id,
      title: row.project.title,
      status: row.project.status,
    } : undefined,
    client: row.client ? {
      id: row.client.id,
      name: row.client.name,
      company: row.client.company,
    } : undefined,
    user: row.user ? {
      id: row.user.id,
      firstName: row.user.firstName,
      lastName: row.user.lastName,
      email: row.user.email,
    } : undefined,
  })) as EventWithRelations[];
}

// Get events by status
export async function getEventsByStatusServer(
  userId: number,
  status: string
): Promise<EventWithRelations[]> {
  const result = await db.select({
    event: events,
    project: projects,
    client: clients,
    user: users,
  })
  .from(events)
  .leftJoin(projects, eq(events.projectId, projects.id))
  .leftJoin(clients, eq(events.clientId, clients.id))
  .leftJoin(users, eq(events.userId, users.id))
  .where(and(
    eq(events.userId, userId),
    eq(events.status, status)
  ))
  .orderBy(asc(events.startDate), asc(events.startTime));
  
  return result.map(row => ({
    ...row.event,
    project: row.project ? {
      id: row.project.id,
      title: row.project.title,
      status: row.project.status,
    } : undefined,
    client: row.client ? {
      id: row.client.id,
      name: row.client.name,
      company: row.client.company,
    } : undefined,
    user: row.user ? {
      id: row.user.id,
      firstName: row.user.firstName,
      lastName: row.user.lastName,
      email: row.user.email,
    } : undefined,
  })) as EventWithRelations[];
}