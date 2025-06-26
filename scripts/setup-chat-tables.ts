import { db } from '../lib/db-server'
import { sql } from 'drizzle-orm'

async function setupChatTables() {
  try {
    console.log('Setting up chat tables in Supabase...')

    // Create chat_conversations table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "chat_conversations" (
        "id" serial PRIMARY KEY NOT NULL,
        "user_id" integer NOT NULL,
        "title" text NOT NULL,
        "description" text,
        "message_count" integer DEFAULT 0,
        "last_message_at" timestamp,
        "is_starred" boolean DEFAULT false,
        "is_archived" boolean DEFAULT false,
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now()
      )
    `)

    // Create chat_messages table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "chat_messages" (
        "id" serial PRIMARY KEY NOT NULL,
        "conversation_id" integer NOT NULL,
        "role" text NOT NULL,
        "content" text NOT NULL,
        "tokens" integer,
        "model" text DEFAULT 'gemini-1.5-flash',
        "created_at" timestamp DEFAULT now()
      )
    `)

    // Add foreign key constraints
    await db.execute(sql`
      DO $$ BEGIN
        ALTER TABLE "chat_conversations" ADD CONSTRAINT "chat_conversations_user_id_users_id_fk" 
        FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `)

    await db.execute(sql`
      DO $$ BEGIN
        ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_conversation_id_chat_conversations_id_fk" 
        FOREIGN KEY ("conversation_id") REFERENCES "chat_conversations"("id") ON DELETE cascade ON UPDATE no action;
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `)

    // Create indexes for better performance
    await db.execute(sql`CREATE INDEX IF NOT EXISTS "chat_conversations_user_id_idx" ON "chat_conversations" ("user_id")`)
    await db.execute(sql`CREATE INDEX IF NOT EXISTS "chat_conversations_last_message_at_idx" ON "chat_conversations" ("last_message_at")`)
    await db.execute(sql`CREATE INDEX IF NOT EXISTS "chat_messages_conversation_id_idx" ON "chat_messages" ("conversation_id")`)
    await db.execute(sql`CREATE INDEX IF NOT EXISTS "chat_messages_created_at_idx" ON "chat_messages" ("created_at")`)

    console.log('✅ Chat tables set up successfully!')
    
    // Test the tables by checking if they exist
    const result = await db.execute(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('chat_conversations', 'chat_messages')
    `)
    
    console.log('📋 Chat tables found:', result.map(r => r.table_name))
    
  } catch (error) {
    console.error('❌ Error setting up chat tables:', error)
    throw error
  }
}

setupChatTables()
  .then(() => {
    console.log('🎉 Chat tables setup completed!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Setup failed:', error)
    process.exit(1)
  }) 