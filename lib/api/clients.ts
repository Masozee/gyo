import { Client, NewClient } from '../schema';
import { config } from '@/lib/config';

const API_BASE_URL = config.apiUrl;

// Get all clients with optional search
export async function fetchClients(search?: string): Promise<Client[]> {
  const url = new URL(`${API_BASE_URL}/clients`);
  if (search) {
    url.searchParams.set('search', search);
  }

  const response = await fetch(url.toString());
  
  if (!response.ok) {
    throw new Error(`Failed to fetch clients: ${response.statusText}`);
  }
  
  return response.json();
}

// Get active clients only
export async function fetchActiveClients(): Promise<Client[]> {
  const response = await fetch(`${API_BASE_URL}/clients/active`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch active clients: ${response.statusText}`);
  }
  
  return response.json();
}

// Get client by ID
export async function fetchClientById(id: number): Promise<Client> {
  const response = await fetch(`${API_BASE_URL}/clients/${id}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch client: ${response.statusText}`);
  }
  
  return response.json();
}

// Create new client
export async function createClientApi(clientData: NewClient): Promise<Client> {
  const response = await fetch(`${API_BASE_URL}/clients`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(clientData),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || `Failed to create client: ${response.statusText}`);
  }
  
  return response.json();
}

// Update client
export async function updateClientApi(id: number, clientData: Partial<NewClient>): Promise<Client> {
  const response = await fetch(`${API_BASE_URL}/clients/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(clientData),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || `Failed to update client: ${response.statusText}`);
  }
  
  return response.json();
}

// Delete client
export async function deleteClientApi(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/clients/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || `Failed to delete client: ${response.statusText}`);
  }
}

// Toggle client status
export async function toggleClientStatusApi(id: number): Promise<Client> {
  const response = await fetch(`${API_BASE_URL}/clients/${id}/toggle-status`, {
    method: 'PATCH',
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || `Failed to toggle client status: ${response.statusText}`);
  }
  
  return response.json();
} 