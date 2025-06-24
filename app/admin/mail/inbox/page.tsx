"use client"

import * as React from "react"
import { EmailList } from "@/components/email-list"
import { EmailToolbar } from "@/components/email-toolbar"
import { toast } from "sonner"

interface Email {
  id: string
  from: string
  fromName: string
  subject: string
  preview: string
  date: Date
  read: boolean
  starred: boolean
  important: boolean
  labels: string[]
  attachments: number
}

export default function InboxPage() {
  const [selectedEmails, setSelectedEmails] = React.useState<string[]>([])
  const [emails, setEmails] = React.useState<Email[]>([])
  const [loading, setLoading] = React.useState(true)
  const [unreadCount, setUnreadCount] = React.useState(0)

  // Fetch emails from API
  const fetchEmails = React.useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/mail/emails?folder=inbox')
      if (!response.ok) throw new Error('Failed to fetch emails')
      
      const data = await response.json()
      setEmails(data.emails.map((email: any) => ({
        ...email,
        date: new Date(email.date)
      })))
      setUnreadCount(data.unread)
    } catch (error) {
      console.error('Error fetching emails:', error)
      toast.error('Failed to load emails')
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchEmails()
  }, [fetchEmails])

  const handleSelectEmail = (emailId: string) => {
    setSelectedEmails(prev => 
      prev.includes(emailId) 
        ? prev.filter(id => id !== emailId)
        : [...prev, emailId]
    )
  }

  const handleSelectAll = () => {
    setSelectedEmails(
      selectedEmails.length === emails.length 
        ? [] 
        : emails.map(email => email.id)
    )
  }

  const updateEmails = async (action: string, value?: any) => {
    try {
      const response = await fetch('/api/mail/emails', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emailIds: selectedEmails,
          action,
          value
        })
      })

      if (!response.ok) throw new Error(`Failed to ${action} emails`)
      
      toast.success(`Successfully ${action} ${selectedEmails.length} email(s)`)
      setSelectedEmails([])
      fetchEmails() // Refresh the list
    } catch (error) {
      console.error(`Error ${action} emails:`, error)
      toast.error(`Failed to ${action} emails`)
    }
  }

  const handleDeleteEmails = () => updateEmails('delete')
  const handleArchiveEmails = () => updateEmails('archive')
  const handleMarkAsRead = () => updateEmails('markAsRead', true)
  const handleMarkAsUnread = () => updateEmails('markAsRead', false)

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold">Inbox</h1>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Loading emails...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold">Inbox</h1>
          {unreadCount > 0 && (
            <span className="text-sm text-muted-foreground">
              {unreadCount} unread
            </span>
          )}
        </div>
      </div>

      <EmailToolbar
        selectedCount={selectedEmails.length}
        totalCount={emails.length}
        onSelectAll={handleSelectAll}
        onDelete={handleDeleteEmails}
        onArchive={handleArchiveEmails}
        onMarkAsRead={handleMarkAsRead}
        onMarkAsUnread={handleMarkAsUnread}
      />

      <div className="flex-1 overflow-auto">
        <EmailList
          emails={emails}
          selectedEmails={selectedEmails}
          onSelectEmail={handleSelectEmail}
        />
      </div>
    </div>
  )
}