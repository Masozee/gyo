import { eq } from 'drizzle-orm';
import { db } from './db-server';
import { users, type User } from './schema';

// Simple password hashing (in production, use bcrypt or similar)
export async function hashPassword(password: string): Promise<string> {
  // For demo purposes, using a simple hash. In production, use bcrypt
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  const hashedInput = await hashPassword(password);
  return hashedInput === hashedPassword;
}

export async function createUser(userData: {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  username?: string;
}): Promise<User> {
  const hashedPassword = await hashPassword(userData.password);
  
  const [user] = await db.insert(users).values({
    ...userData,
    password: hashedPassword,
  }).returning();
  
  return user;
}

export async function authenticateUser(email: string, password: string): Promise<User | null> {
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  
  if (!user) {
    return null;
  }
  
  const isValidPassword = await verifyPassword(password, user.password);
  if (!isValidPassword) {
    return null;
  }
  
  return user;
}

export async function getUserById(id: number): Promise<User | null> {
  const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return user || null;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return user || null;
}

export async function updateUser(id: number, userData: Partial<User>): Promise<User | null> {
  const [updatedUser] = await db.update(users)
    .set({ ...userData, updatedAt: new Date().toISOString() })
    .where(eq(users.id, id))
    .returning();
  
  return updatedUser || null;
} 