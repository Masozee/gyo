import { eq, desc, and, sql } from 'drizzle-orm'
import { db } from '../db-server'
import {
  chatConversations,
  chatMessages,
  type NewChatConversation,
  type NewChatMessage,
  type ChatConversation,
  type ChatMessage,
  type ChatConversationWithMessages
} from '../schema'

// ─── Conversation Management ───

export async function createChatConversation(data: {
  userId: number
  title: string
  description?: string
}): Promise<ChatConversation> {
  try {
    const newConversation: NewChatConversation = {
      userId: data.userId,
      title: data.title,
      description: data.description,
      messageCount: 0,
      lastMessageAt: new Date(),
    }

    const [result] = await db.insert(chatConversations).values(newConversation).returning()
    return result
  } catch (error) {
    console.error('Error creating chat conversation:', error)
    throw error
  }
}

export async function getChatConversations(userId: number): Promise<ChatConversation[]> {
  try {
    const results = await db
      .select()
      .from(chatConversations)
      .where(
        and(
          eq(chatConversations.userId, userId),
          eq(chatConversations.isArchived, false)
        )
      )
      .orderBy(desc(chatConversations.lastMessageAt))

    return results
  } catch (error) {
    console.error('Error fetching chat conversations:', error)
    throw error
  }
}

export async function getChatConversationWithMessages(
  conversationId: number,
  userId: number
): Promise<ChatConversationWithMessages | null> {
  try {
    // Get conversation
    const [conversation] = await db
      .select()
      .from(chatConversations)
      .where(
        and(
          eq(chatConversations.id, conversationId),
          eq(chatConversations.userId, userId)
        )
      )
      .limit(1)

    if (!conversation) return null

    // Get messages
    const messages = await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.conversationId, conversationId))
      .orderBy(chatMessages.createdAt)

    return {
      ...conversation,
      messages
    }
  } catch (error) {
    console.error('Error fetching conversation with messages:', error)
    throw error
  }
}

export async function updateChatConversation(
  conversationId: number,
  userId: number,
  updates: {
    title?: string
    description?: string
    isStarred?: boolean
    isArchived?: boolean
  }
): Promise<ChatConversation | null> {
  try {
    const [result] = await db
      .update(chatConversations)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(chatConversations.id, conversationId),
          eq(chatConversations.userId, userId)
        )
      )
      .returning()

    return result || null
  } catch (error) {
    console.error('Error updating chat conversation:', error)
    throw error
  }
}

export async function deleteChatConversation(
  conversationId: number,
  userId: number
): Promise<boolean> {
  try {
    await db
      .delete(chatConversations)
      .where(
        and(
          eq(chatConversations.id, conversationId),
          eq(chatConversations.userId, userId)
        )
      )

    return true
  } catch (error) {
    console.error('Error deleting chat conversation:', error)
    return false
  }
}

// ─── Message Management ───

export async function addChatMessage(data: {
  conversationId: number
  role: 'user' | 'assistant'
  content: string
  tokens?: number
  model?: string
}): Promise<ChatMessage> {
  try {
    const newMessage: NewChatMessage = {
      conversationId: data.conversationId,
      role: data.role,
      content: data.content,
      tokens: data.tokens,
      model: data.model || 'gemini-1.5-flash',
    }

    const [result] = await db.insert(chatMessages).values(newMessage).returning()

    // Update conversation metadata
    await db
      .update(chatConversations)
      .set({
        messageCount: sql`${chatConversations.messageCount} + 1`,
        lastMessageAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(chatConversations.id, data.conversationId))

    return result
  } catch (error) {
    console.error('Error adding chat message:', error)
    throw error
  }
}

export async function getChatMessages(
  conversationId: number,
  limit: number = 50,
  offset: number = 0
): Promise<ChatMessage[]> {
  try {
    const results = await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.conversationId, conversationId))
      .orderBy(chatMessages.createdAt)
      .limit(limit)
      .offset(offset)

    return results
  } catch (error) {
    console.error('Error fetching chat messages:', error)
    throw error
  }
}

// ─── Utility Functions ───

export async function generateConversationTitle(firstMessage: string): Promise<string> {
  // Simple title generation from first message
  const words = firstMessage.trim().split(' ').slice(0, 6)
  let title = words.join(' ')
  
  if (firstMessage.length > 50) {
    title += '...'
  }
  
  // Fallback titles based on content
  if (title.toLowerCase().includes('code') || title.toLowerCase().includes('programming')) {
    return title || 'Code Discussion'
  } else if (title.toLowerCase().includes('write') || title.toLowerCase().includes('email')) {
    return title || 'Writing Help'
  } else if (title.toLowerCase().includes('explain') || title.toLowerCase().includes('how')) {
    return title || 'Learning Session'
  } else {
    return title || 'New Conversation'
  }
}

export async function getConversationStats(userId: number): Promise<{
  totalConversations: number
  totalMessages: number
  totalTokens: number
  mostActiveDay: string | null
}> {
  try {
    // Get total conversations
    const [conversationCount] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(chatConversations)
      .where(eq(chatConversations.userId, userId))

    // Get total messages and tokens
    const [messageStats] = await db
      .select({
        totalMessages: sql<number>`COUNT(*)`,
        totalTokens: sql<number>`COALESCE(SUM(${chatMessages.tokens}), 0)`
      })
      .from(chatMessages)
      .innerJoin(chatConversations, eq(chatMessages.conversationId, chatConversations.id))
      .where(eq(chatConversations.userId, userId))

    return {
      totalConversations: conversationCount?.count || 0,
      totalMessages: messageStats?.totalMessages || 0,
      totalTokens: messageStats?.totalTokens || 0,
      mostActiveDay: null // Could implement day-of-week analysis
    }
  } catch (error) {
    console.error('Error fetching conversation stats:', error)
    return {
      totalConversations: 0,
      totalMessages: 0,
      totalTokens: 0,
      mostActiveDay: null
    }
  }
}