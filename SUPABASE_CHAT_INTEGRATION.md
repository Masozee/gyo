# Supabase Chat Integration

This document describes the Supabase integration for the Gemini AI chat feature in the GYA application.

## Overview

The Gemini AI chat feature is fully integrated with Supabase for:
- **Authentication**: Using Supabase Auth for user management
- **Database**: Storing chat conversations and messages in PostgreSQL
- **Real-time capabilities**: Leveraging Supabase's real-time features

## Database Schema

### Chat Conversations Table (`chat_conversations`)

```sql
CREATE TABLE "chat_conversations" (
  "id" serial PRIMARY KEY NOT NULL,
  "user_id" integer NOT NULL,
  "title" text NOT NULL,
  "description" text,
  "message_count" integer DEFAULT 0,
  "last_message_at" timestamp,
  "is_starred" boolean DEFAULT false,
  "is_archived" boolean DEFAULT false,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now(),
  FOREIGN KEY ("user_id") REFERENCES "users"("id")
);
```

### Chat Messages Table (`chat_messages`)

```sql
CREATE TABLE "chat_messages" (
  "id" serial PRIMARY KEY NOT NULL,
  "conversation_id" integer NOT NULL,
  "role" text NOT NULL, -- 'user' or 'assistant'
  "content" text NOT NULL,
  "tokens" integer, -- For cost tracking
  "model" text DEFAULT 'gemini-1.5-flash',
  "created_at" timestamp DEFAULT now(),
  FOREIGN KEY ("conversation_id") REFERENCES "chat_conversations"("id") ON DELETE CASCADE
);
```

## API Endpoints

All chat endpoints are protected by Supabase authentication and located under `/api/chat/`:

### Conversation Management
- `GET /api/chat/conversations` - List user's conversations
- `POST /api/chat/conversations` - Create new conversation
- `GET /api/chat/conversations/:id` - Get conversation with messages
- `PUT /api/chat/conversations/:id` - Update conversation (star, archive, etc.)
- `DELETE /api/chat/conversations/:id` - Delete conversation

### Gemini AI Integration
- `POST /api/chat/gemini` - Send message to Gemini AI
- `POST /api/chat/gemini/stream` - Stream response from Gemini AI

### Statistics
- `GET /api/chat/stats` - Get user's chat statistics

## Features

### 🔐 Authentication
- Supabase Auth integration
- JWT token validation
- User session management

### 💾 Persistent Storage
- All conversations saved to Supabase PostgreSQL
- Message history preserved
- Conversation metadata (title, description, timestamps)

### ⭐ Conversation Management
- Star/unstar conversations
- Archive conversations
- Delete conversations
- Auto-generated conversation titles

### 🤖 AI Integration
- Google Gemini AI integration
- Context-aware conversations
- Token usage tracking
- Multiple model support

### 📊 Analytics
- Message count tracking
- Token usage statistics
- Conversation analytics

## Setup Instructions

### 1. Database Setup

Run the chat table setup script:

```bash
npm run db:setup-chat
```

This will create the necessary tables and indexes in your Supabase database.

### 2. Environment Variables

Ensure these environment variables are set:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
DATABASE_URL=postgresql://postgres:password@db.project.supabase.co:5432/postgres
GOOGLE_GEMINI_API_KEY=your_gemini_api_key
```

### 3. Authentication

The chat feature requires users to be authenticated via Supabase Auth. Users must log in before accessing the chat functionality.

## Usage

### Frontend Integration

The chat interface is available at `/admin/tools/gemini-chat` and includes:

- **Conversation Sidebar**: List of user's conversations
- **Chat Interface**: Message exchange with Gemini AI
- **Message Management**: Copy, export, and manage messages
- **Real-time Updates**: Live conversation updates

### Backend Integration

The backend automatically:
- Creates new conversations when users start chatting
- Saves all messages to the database
- Generates conversation titles based on first message
- Tracks token usage for cost monitoring
- Manages conversation metadata

## Security

- All API endpoints require valid Supabase authentication
- Row Level Security (RLS) can be enabled for additional protection
- User data is isolated per authenticated user
- SQL injection protection via Drizzle ORM

## Performance Optimizations

- Database indexes on frequently queried columns
- Conversation pagination support
- Message limiting for context
- Efficient query patterns

## Monitoring

- Error logging for all database operations
- API request/response logging
- Token usage tracking
- Conversation statistics

## Troubleshooting

### Common Issues

1. **Authentication Errors**: Ensure Supabase Auth is properly configured
2. **Database Connection**: Verify DATABASE_URL is correct
3. **Missing Tables**: Run `npm run db:setup-chat` to create tables
4. **API Errors**: Check server logs for detailed error messages

### Debug Commands

```bash
# Check database tables
npm run db:studio

# Verify chat tables exist
npm run db:setup-chat

# Check authentication
# Verify SUPABASE_URL and SUPABASE_ANON_KEY in environment
```

## Future Enhancements

- Real-time collaboration features
- Message search functionality
- Conversation sharing
- Advanced analytics dashboard
- Multi-language support
- Voice message integration

## Contributing

When contributing to the chat feature:

1. Follow the existing schema patterns
2. Add proper error handling
3. Include authentication checks
4. Update documentation
5. Add tests for new functionality

## License

This integration is part of the GYA project and follows the same license terms. 