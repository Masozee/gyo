import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

// Database connection for Drizzle ORM (server-side only)
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres.vvzhwzzotfqbfvivjgyv:yur4v3bl1z4__@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres';

// Debug logging (can be removed in production)
// console.log('🗃️ Database connection info:');
// console.log('  - Environment DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
// console.log('  - Using connection with password:', connectionString.replace(/:[^:@]+@/, ':***@'));

const client = postgres(connectionString, {
  max: 1, // Use a single connection for serverless environments
  ssl: 'require', // Force SSL for Supabase connections
  idle_timeout: 20,
  max_lifetime: 60 * 30, // 30 minutes
});

export const db = drizzle(client);