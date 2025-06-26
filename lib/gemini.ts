import { GoogleGenerativeAI } from '@google/generative-ai'

const API_KEY = process.env.GOOGLE_GEMINI_API_KEY || process.env.GEMINI_API_KEY
if (!API_KEY) {
  throw new Error('GOOGLE_GEMINI_API_KEY or GEMINI_API_KEY environment variable is required')
}
const genAI = new GoogleGenerativeAI(API_KEY)

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface ChatResponse {
  success: boolean
  message?: string
  error?: string
  conversationId?: number
}

export async function sendMessageToGemini(message: string, conversationHistory: ChatMessage[] = []): Promise<ChatResponse> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    
    // Build conversation context
    const context = conversationHistory
      .slice(-10) // Keep last 10 messages for context
      .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
      .join('\n')
    
    const prompt = context ? `${context}\nUser: ${message}` : message
    
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    
    return {
      success: true,
      message: text
    }
  } catch (error) {
    console.error('Gemini API error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get response from Gemini'
    }
  }
}

export async function streamMessageToGemini(message: string, conversationHistory: ChatMessage[] = []): Promise<ReadableStream> {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
  
  // Build conversation context
  const context = conversationHistory
    .slice(-10) // Keep last 10 messages for context
    .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
    .join('\n')
  
  const prompt = context ? `${context}\nUser: ${message}` : message
  
  const result = await model.generateContentStream(prompt)
  
  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of result.stream) {
          const chunkText = chunk.text()
          controller.enqueue(new TextEncoder().encode(chunkText))
        }
        controller.close()
      } catch (error) {
        controller.error(error)
      }
    }
  })
}