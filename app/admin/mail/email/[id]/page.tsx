"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Reply, ReplyAll, Forward, Trash2, Archive, Star } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "sonner"

interface Email {
  id: string
  from: string
  fromName: string
  subject: string
  content: string
  date: Date
  read: boolean
  starred: boolean
  important: boolean
  labels: string[]
  attachments: number
  folder: string
}

export default function EmailDetailPage() {
  const { user, isAuthenticated } = useAuth()
  const params = useParams()
  const router = useRouter()
  const [email, setEmail] = React.useState<Email | null>(null)
  const [loading, setLoading] = React.useState(true)

  // Get auth token from localStorage
  const getAuthToken = React.useCallback(() => {
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
  }, [])

  React.useEffect(() => {
    const fetchEmail = async () => {
      if (!isAuthenticated) return
      
      try {
        setLoading(true)
        const token = getAuthToken()
        const headers: HeadersInit = {
          'Content-Type': 'application/json'
        }
        
        if (token) {
          headers.Authorization = `Bearer ${token}`
        }
        
        const response = await fetch(`/api/mail/emails/${params.id}`, { headers })
        
        if (response.status === 401) {
          toast.error('Session expired. Please log in again.')
          router.push('/login')
          return
        }
        
        if (!response.ok) throw new Error('Failed to fetch email')
        
        const data = await response.json()
        setEmail({
          ...data.email,
          date: new Date(data.email.date)
        })
      } catch (error) {
        console.error('Error fetching email:', error)
        toast.error('Failed to load email')
        router.push('/admin/mail/inbox')
      } finally {
        setLoading(false)
      }
    }

    if (params.id && isAuthenticated) {
      fetchEmail()
    }
  }, [params.id, router, isAuthenticated, getAuthToken])

  const handleAction = async (action: string) => {
    if (!email || !isAuthenticated) return

    try {
      const token = getAuthToken()
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      }
      
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }
      
      const response = await fetch(`/api/mail/emails/${email.id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ action })
      })

      if (response.status === 401) {
        toast.error('Session expired. Please log in again.')
        router.push('/login')
        return
      }

      if (!response.ok) throw new Error(`Failed to ${action}`)
      
      toast.success(`Email ${action} successfully`)
      
      if (action === 'delete') {
        router.push('/admin/mail/inbox')
      } else {
        // Update local state
        setEmail(prev => prev ? { ...prev, starred: action === 'star' ? !prev.starred : prev.starred } : null)
      }
    } catch (error) {
      console.error(`Error ${action} email:`, error)
      toast.error(`Failed to ${action} email`)
    }
  }

  const handleReply = () => {
    if (!email) return
    router.push(`/admin/mail/compose?reply=${email.id}&to=${email.from}&subject=Re: ${email.subject}`)
  }

  const handleForward = () => {
    if (!email) return
    router.push(`/admin/mail/compose?forward=${email.id}&subject=Fwd: ${email.subject}`)
  }

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-4 border-b">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Loading email...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!email) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-4 border-b">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Email not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Inbox
        </Button>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleAction('star')}
          >
            <Star className={`w-4 h-4 ${email.starred ? 'fill-current text-yellow-500' : ''}`} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleAction('archive')}
          >
            <Archive className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleAction('delete')}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Email Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Email Header */}
          <Card>
            <CardHeader>
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-2xl font-bold">{email.subject}</h1>
                    <div className="flex items-center gap-2 mt-2">
                      {email.labels.map((label) => (
                        <Badge key={label} variant="secondary" className="text-xs">
                          {label}
                        </Badge>
                      ))}
                      {email.important && (
                        <Badge variant="destructive" className="text-xs">
                          Important
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground text-right">
                    {formatDistanceToNow(email.date, { addSuffix: true })}
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{email.fromName}</p>
                    <p className="text-sm text-muted-foreground">{email.from}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleReply}>
                      <Reply className="w-4 h-4 mr-2" />
                      Reply
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleForward}>
                      <Forward className="w-4 h-4 mr-2" />
                      Forward
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Email Body */}
          <Card>
            <CardContent className="p-6">
              <div 
                className="prose dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: email.content }}
              />
            </CardContent>
          </Card>

          {/* Attachments */}
          {email.attachments > 0 && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">
                  Attachments ({email.attachments})
                </h3>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Attachment handling will be implemented with file storage integration.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex justify-center gap-4">
            <Button onClick={handleReply}>
              <Reply className="w-4 h-4 mr-2" />
              Reply
            </Button>
            <Button variant="outline" onClick={handleForward}>
              <Forward className="w-4 h-4 mr-2" />
              Forward
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}