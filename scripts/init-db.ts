import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { migrate } from 'drizzle-orm/postgres-js/migrator';

async function initDatabase() {
  try {
    console.log('Initializing Supabase database...');
    
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('DATABASE_URL environment variable is required');
    }

    const client = postgres(databaseUrl, { prepare: false });
    const db = drizzle(client);
    
    // Run migrations to create all tables
    console.log('Running database migrations...');
    await migrate(db, { migrationsFolder: './drizzle' });
    
    console.log('Supabase database initialized successfully!');
    await client.end();
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

initDatabase(); 