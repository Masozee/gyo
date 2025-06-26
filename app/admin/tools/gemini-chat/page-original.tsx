"use client"

import { useState, useRef, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import {
  Send,
  Bot,
  User,
  Loader2,
  Trash2,
  Download,
  Copy,
  RefreshCw,
} from "lucide-react"
import { toast } from "sonner"
import GeminiChat from "@/components/gemini-chat"

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export default function GeminiChatPage() {
  const { user, isAuthenticated } = useAuth()
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm Gemini AI, Google's advanced AI assistant. I can help you with:\n\n• Coding and programming questions\n• Writing and content creation\n• Data analysis and research\n• Problem-solving and brainstorming\n• Learning new topics\n• And much more!\n\nWhat would you like to explore today?",
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Get auth token from localStorage
  const getAuthToken = () => {
    const session = localStorage.getItem('session')
    if (session) {
      try {
        const sessionData = JSON.parse(session)
        return sessionData.accessToken
      } catch (error) {
        console.error('Error parsing session:', error)
      }
    }
    return null
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async () => {
    if (!isAuthenticated) {
      toast.error("Please log in to use Gemini chat")
      return
    }

    if (!inputMessage.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage("")
    setIsLoading(true)

    try {
      const token = getAuthToken()
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }
      
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }

      const response = await fetch('/api/chat/gemini', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          message: userMessage.content,
          conversationHistory: messages.slice(-8) // Send last 8 messages for context
        }),
      })

      if (response.status === 401) {
        toast.error('Session expired. Please log in again.')
        return
      }

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to get response')
      }

      const data = await response.json()

      if (data.success && data.message) {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.message,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, assistantMessage])
      } else {
        throw new Error(data.error || 'Failed to get response')
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to send message")
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Sorry, I'm having trouble responding right now. Please try again.",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const clearChat = () => {
    setMessages([
      {
        id: '1',
        role: 'assistant',
        content: "Hello! I'm Gemini AI, Google's advanced AI assistant. I can help you with:\n\n• Coding and programming questions\n• Writing and content creation\n• Data analysis and research\n• Problem-solving and brainstorming\n• Learning new topics\n• And much more!\n\nWhat would you like to explore today?",
        timestamp: new Date()
      }
    ])
    toast.success("Chat cleared")
  }

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content)
    toast.success("Message copied to clipboard")
  }

  const exportChat = () => {
    const chatText = messages.map(msg => 
      `[${msg.timestamp.toLocaleString()}] ${msg.role.toUpperCase()}: ${msg.content}`
    ).join('\n\n')
    
    const blob = new Blob([chatText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `gemini-chat-${new Date().toISOString().split('T')[0]}.txt`
    a.click()
    URL.revokeObjectURL(url)
    toast.success("Chat exported successfully")
  }

  return (
    <>
    <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Bot className="h-8 w-8 text-blue-600" />
            Chat with Gemini AI
          </h1>
          <p className="text-gray-600 mt-2">
            Have conversations with Google's advanced AI assistant. Get help with coding, writing, research, and more.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportChat} size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" onClick={clearChat} size="sm">
            <Trash2 className="h-4 w-4 mr-2" />
            Clear
          </Button>
        </div>
      </div>

      {/* Chat Interface */}
      <Card className="h-[600px] flex flex-col">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-blue-600" />
            Gemini AI Assistant
            <span className="text-sm font-normal text-gray-500 ml-auto">
              {messages.length - 1} messages
            </span>
          </CardTitle>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0">
          {/* Messages */}
          <ScrollArea className="flex-1 p-6">
            <div className="space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-4 w-full ${
                    message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  <Avatar className="h-10 w-10 flex-shrink-0">
                    <AvatarFallback className={`${
                      message.role === 'assistant'
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                        : 'bg-gray-300 text-gray-700'
                    }`}>
                      {message.role === 'assistant' ? <Bot className="h-5 w-5" /> : <User className="h-5 w-5" />}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className={`flex-1 max-w-[80%] ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                    <div
                      className={`inline-block rounded-lg px-4 py-3 ${
                        message.role === 'user'
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="whitespace-pre-wrap text-left">{message.content}</p>
                      <div className="flex items-center justify-between mt-2">
                        <p className={`text-xs ${
                          message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {message.timestamp.toLocaleString()}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyMessage(message.content)}
                          className={`h-6 w-6 p-0 ml-2 ${
                            message.role === 'user' 
                              ? 'text-blue-100 hover:text-white hover:bg-white/20' 
                              : 'text-gray-400 hover:text-gray-600'
                          }`}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-4 w-full flex-row">
                  <Avatar className="h-10 w-10 flex-shrink-0">
                    <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                      <Bot className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 max-w-[80%]">
                    <div className="inline-block bg-gray-100 rounded-lg px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Gemini is thinking...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-6 border-t bg-gray-50/50">
            <div className="space-y-3">
              <Textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message... (Press Enter to send, Shift+Enter for new line)"
                disabled={isLoading || !isAuthenticated}
                className="min-h-[100px] resize-none"
              />
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  {!isAuthenticated ? (
                    <span className="text-red-500">Please log in to use Gemini chat</span>
                  ) : (
                    <span>Powered by Google Gemini AI • {inputMessage.length} characters</span>
                  )}
                </div>
                <Button
                  onClick={sendMessage}
                  disabled={isLoading || !inputMessage.trim() || !isAuthenticated}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Message
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Prompts */}
      {messages.length === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Start Prompts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                "Help me debug this JavaScript code",
                "Explain React hooks with examples",
                "Write a professional email",
                "Create a business plan outline",
                "Analyze this data for insights",
                "Generate creative writing ideas"
              ].map((prompt, index) => (
                <Button
                  key={index}
                  variant="outline"
                  onClick={() => setInputMessage(prompt)}
                  className="text-left justify-start h-auto p-3 whitespace-normal"
                >
                  {prompt}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
    
    {/* Sticky Chat Widget - Only on this page */}
    <GeminiChat />
    </>
  )
}