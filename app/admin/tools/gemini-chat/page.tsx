"use client"

import { useState, useRef, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Send,
  Bot,
  User,
  Loader2,
  Trash2,
  Download,
  Copy,
  Plus,
  Star,
  MoreVertical,
  Edit3,
  Archive,
  MessageSquare,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface ChatConversation {
  id: number
  title: string
  description?: string
  messageCount: number
  lastMessageAt: string
  isStarred: boolean
  isArchived: boolean
  createdAt: string
  updatedAt: string
}

export default function GeminiChatPage() {
  const { user, isAuthenticated } = useAuth()
  const [conversations, setConversations] = useState<ChatConversation[]>([])
  const [activeConversationId, setActiveConversationId] = useState<number | null>(null)
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
  const [isLoadingConversations, setIsLoadingConversations] = useState(false)
  const [isDevelopmentMode, setIsDevelopmentMode] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Development mode check
  useEffect(() => {
    const devMode = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    setIsDevelopmentMode(devMode)
  }, [])

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

  // Load conversations on mount
  useEffect(() => {
    if (isAuthenticated || isDevelopmentMode) {
      loadConversations()
    }
  }, [isAuthenticated, isDevelopmentMode])

  const loadConversations = async () => {
    if (!isAuthenticated && !isDevelopmentMode) return

    try {
      setIsLoadingConversations(true)
      const token = getAuthToken()
      
      console.log('🔍 Loading conversations...')
      console.log('🔑 Token exists:', !!token)
      console.log('👤 User authenticated:', isAuthenticated)
      console.log('🛠️ Development mode:', isDevelopmentMode)
      console.log('👤 User data:', user)
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }
      
      if (token) {
        headers.Authorization = `Bearer ${token}`
        console.log('🔑 Authorization header set')
      } else if (isDevelopmentMode) {
        console.log('🛠️ Development mode: Skipping auth token')
      } else {
        console.warn('⚠️ No auth token found in localStorage')
      }

      const response = await fetch('/api/chat/conversations', {
        method: 'GET',
        headers,
      })

      console.log('📡 Response status:', response.status)
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()))

      if (response.ok) {
        const data = await response.json()
        console.log('✅ Conversations loaded:', data)
        setConversations(data.conversations || [])
      } else {
        const errorText = await response.text()
        console.error('❌ Failed to load conversations:', response.status, errorText)
        
        if (response.status === 401) {
          console.warn('🔐 Authentication failed')
          if (isDevelopmentMode) {
            console.log('🛠️ Development mode: Continuing without conversations')
            setConversations([])
          }
        }
      }
    } catch (error) {
      console.error('💥 Error loading conversations:', error)
      if (isDevelopmentMode) {
        console.log('🛠️ Development mode: Continuing without conversations')
        setConversations([])
      }
    } finally {
      setIsLoadingConversations(false)
    }
  }

  const loadConversation = async (conversationId: number) => {
    if (!isAuthenticated) return

    try {
      const token = getAuthToken()
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }
      
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }

      const response = await fetch(`/api/chat/conversations/${conversationId}`, {
        method: 'GET',
        headers,
      })

      if (response.ok) {
        const data = await response.json()
        const conversation = data.conversation
        
        // Convert database messages to UI format
        const uiMessages: ChatMessage[] = conversation.messages.map((msg: any) => ({
          id: msg.id.toString(),
          role: msg.role,
          content: msg.content,
          timestamp: new Date(msg.createdAt)
        }))
        
        setMessages(uiMessages)
        setActiveConversationId(conversationId)
      }
    } catch (error) {
      console.error('Error loading conversation:', error)
      toast.error('Failed to load conversation')
    }
  }

  const createNewConversation = () => {
    setActiveConversationId(null)
    setMessages([
      {
        id: '1',
        role: 'assistant',
        content: "Hello! I'm Gemini AI, Google's advanced AI assistant. I can help you with:\n\n• Coding and programming questions\n• Writing and content creation\n• Data analysis and research\n• Problem-solving and brainstorming\n• Learning new topics\n• And much more!\n\nWhat would you like to explore today?",
        timestamp: new Date()
      }
    ])
  }

  const deleteConversation = async (conversationId: number, e: React.MouseEvent) => {
    e.stopPropagation()
    
    if (!isAuthenticated) return

    try {
      const token = getAuthToken()
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }
      
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }

      const response = await fetch(`/api/chat/conversations/${conversationId}`, {
        method: 'DELETE',
        headers,
      })

      if (response.ok) {
        setConversations(prev => prev.filter(conv => conv.id !== conversationId))
        if (activeConversationId === conversationId) {
          createNewConversation()
        }
        toast.success('Conversation deleted')
      } else {
        toast.error('Failed to delete conversation')
      }
    } catch (error) {
      console.error('Error deleting conversation:', error)
      toast.error('Failed to delete conversation')
    }
  }

  const toggleStarConversation = async (conversationId: number, e: React.MouseEvent) => {
    e.stopPropagation()
    
    if (!isAuthenticated) return

    try {
      const conversation = conversations.find(c => c.id === conversationId)
      if (!conversation) return

      const token = getAuthToken()
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }
      
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }

      const response = await fetch(`/api/chat/conversations/${conversationId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          isStarred: !conversation.isStarred
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setConversations(prev => prev.map(conv => 
          conv.id === conversationId 
            ? { ...conv, isStarred: data.conversation.isStarred }
            : conv
        ))
        toast.success(data.conversation.isStarred ? 'Conversation starred' : 'Conversation unstarred')
      }
    } catch (error) {
      console.error('Error toggling star:', error)
      toast.error('Failed to update conversation')
    }
  }

  const sendMessage = async () => {
    if (!isAuthenticated && !isDevelopmentMode) {
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
      } else if (isDevelopmentMode) {
        console.log('🛠️ Development mode: Sending message without auth')
      }

      const response = await fetch('/api/chat/gemini', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          message: userMessage.content,
          conversationId: activeConversationId,
          conversationHistory: messages.slice(-5) // Send last 5 messages for context
        }),
      })

      if (response.status === 401 && !isDevelopmentMode) {
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

        // Update conversation ID if this was a new conversation
        if (data.conversationId && !activeConversationId) {
          setActiveConversationId(data.conversationId)
          // Reload conversations to show the new one
          if (isAuthenticated || isDevelopmentMode) {
            loadConversations()
          }
        }
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

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content)
    toast.success("Message copied to clipboard")
  }

  const exportChat = () => {
    const chatContent = messages.map(msg => 
      `${msg.role === 'user' ? 'You' : 'Gemini'}: ${msg.content}`
    ).join('\n\n')
    
    const blob = new Blob([chatContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `gemini-chat-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success("Chat exported successfully")
  }

  if (!isAuthenticated && !isDevelopmentMode) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <Bot className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Authentication Required</h3>
              <p className="text-muted-foreground mb-4">Please log in to access Gemini AI chat.</p>
              <div className="space-y-2">
                <Button onClick={() => window.location.href = '/login'} className="w-full">
                  Go to Login
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => window.location.href = '/register'} 
                  className="w-full"
                >
                  Create Account
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 h-screen flex gap-6">
      {/* Conversations Sidebar */}
      <div className="w-80 flex flex-col">
        <Card className="flex-1">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Conversations</CardTitle>
              <Button
                onClick={createNewConversation}
                size="sm"
                className="h-8 w-8 p-0"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[calc(100vh-200px)]">
              {isLoadingConversations ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : conversations.length === 0 ? (
                <div className="text-center p-8 text-muted-foreground">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-sm">No conversations yet</p>
                  <p className="text-xs">Start a new chat to begin</p>
                </div>
              ) : (
                <div className="space-y-1 p-2">
                  {conversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      onClick={() => loadConversation(conversation.id)}
                      className={`group flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                        activeConversationId === conversation.id
                          ? 'bg-primary/10 border border-primary/20'
                          : 'hover:bg-muted/50'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-sm truncate">
                            {conversation.title}
                          </h4>
                          {conversation.isStarred && (
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {conversation.messageCount} messages
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(conversation.lastMessageAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={(e) => toggleStarConversation(conversation.id, e)}
                          >
                            <Star className="h-4 w-4 mr-2" />
                            {conversation.isStarred ? 'Unstar' : 'Star'}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => deleteConversation(conversation.id, e)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        <Card className="flex-1 flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs">
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">Gemini AI</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {activeConversationId ? 
                      conversations.find(c => c.id === activeConversationId)?.title || 'Chat Session'
                      : 'New Chat Session'
                    }
                    {isDevelopmentMode && !isAuthenticated && (
                      <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                        DEV MODE
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={exportChat}
                  variant="outline"
                  size="sm"
                  disabled={messages.length <= 1}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button
                  onClick={createNewConversation}
                  variant="outline"
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Chat
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="flex-1 flex flex-col p-0">
            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {message.role === 'assistant' && (
                      <Avatar className="h-8 w-8 mt-1">
                        <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs">
                          <Bot className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`group relative max-w-[80%] rounded-lg px-4 py-3 ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <div className="whitespace-pre-wrap text-sm">
                        {message.content}
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs opacity-70">
                          {message.timestamp.toLocaleTimeString()}
                        </span>
                        <Button
                          onClick={() => copyMessage(message.content)}
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    {message.role === 'user' && (
                      <Avatar className="h-8 w-8 mt-1">
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-3 justify-start">
                    <Avatar className="h-8 w-8 mt-1">
                      <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs">
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-muted rounded-lg px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm text-muted-foreground">
                          Gemini is thinking...
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="border-t p-4">
              <div className="flex gap-3">
                <Textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Ask Gemini anything..."
                  className="flex-1 min-h-[60px] max-h-32 resize-none"
                  disabled={isLoading}
                />
                <Button
                  onClick={sendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className="self-end"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                <span>Press Enter to send, Shift+Enter for new line</span>
                <span>{inputMessage.length}/2000</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}