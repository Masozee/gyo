import { config } from '@/lib/config';
import { User } from '@/lib/schema';

const API_BASE_URL = config.apiUrl;

// Get user by email
export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/users/email/${encodeURIComponent(email)}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        return null; // User not found
      }
      throw new Error(`Failed to fetch user: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.user;
  } catch (error) {
    console.error('Error fetching user by email:', error);
    return null;
  }
}

// Get user by ID
export async function getUserById(id: number): Promise<User | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${id}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        return null; // User not found
      }
      throw new Error(`Failed to fetch user: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.user;
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    return null;
  }
}