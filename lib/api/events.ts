import { Event, NewEvent } from '../schema';
import { config } from '@/lib/config';

const API_BASE_URL = config.apiUrl;

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

export interface EventFormData {
  title: string;
  description?: string;
  startDate: string; // YYYY-MM-DD
  endDate?: string;
  startTime?: string; // HH:MM
  endTime?: string;
  allDay?: boolean;
  type?: string;
  status?: string;
  priority?: string;
  color?: string;
  location?: string;
  isVirtual?: boolean;
  meetingUrl?: string;
  attendees?: string; // JSON string
  projectId?: number;
  clientId?: number;
  userId: number;
  isRecurring?: boolean;
  recurrenceRule?: string;
  reminderMinutes?: number;
  notes?: string;
}

// Get all events with optional filters
export async function getEvents(
  userId?: number,
  startDate?: string,
  endDate?: string,
  projectId?: number,
  clientId?: number,
  type?: string
): Promise<EventWithRelations[]> {
  const params = new URLSearchParams();
  if (userId) params.append('userId', userId.toString());
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  if (projectId) params.append('projectId', projectId.toString());
  if (clientId) params.append('clientId', clientId.toString());
  if (type) params.append('type', type);

  const response = await fetch(`${API_BASE_URL}/events?${params.toString()}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch events: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.events || [];
}

// Get event by ID
export async function getEvent(id: number): Promise<EventWithRelations> {
  const response = await fetch(`${API_BASE_URL}/events/${id}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch event: ${response.statusText}`);
  }
  
  return response.json();
}

// Create new event
export async function createEvent(eventData: EventFormData): Promise<Event> {
  const response = await fetch(`${API_BASE_URL}/events`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(eventData),
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create event: ${error}`);
  }
  
  return response.json();
}

// Update event
export async function updateEvent(id: number, eventData: Partial<EventFormData>): Promise<Event> {
  const response = await fetch(`${API_BASE_URL}/events/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(eventData),
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to update event: ${error}`);
  }
  
  return response.json();
}

// Delete event
export async function deleteEvent(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/events/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error(`Failed to delete event: ${response.statusText}`);
  }
}

// Get upcoming events for a user
export async function getUpcomingEvents(userId: number, limit: number = 10): Promise<EventWithRelations[]> {
  const response = await fetch(`${API_BASE_URL}/events/upcoming/${userId}?limit=${limit}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch upcoming events: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.events || [];
}

// Get events by date range
export async function getEventsByDateRange(
  userId: number,
  startDate: string,
  endDate: string
): Promise<EventWithRelations[]> {
  const response = await fetch(
    `${API_BASE_URL}/events/range/${userId}?startDate=${startDate}&endDate=${endDate}`
  );
  
  if (!response.ok) {
    throw new Error(`Failed to fetch events by date range: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.events || [];
}

// Get events by project
export async function getEventsByProject(projectId: number): Promise<EventWithRelations[]> {
  return getEvents(undefined, undefined, undefined, projectId);
}

// Get events by client
export async function getEventsByClient(clientId: number): Promise<EventWithRelations[]> {
  return getEvents(undefined, undefined, undefined, undefined, clientId);
}

// Get events by type
export async function getEventsByType(userId: number, type: string): Promise<EventWithRelations[]> {
  return getEvents(userId, undefined, undefined, undefined, undefined, type);
}