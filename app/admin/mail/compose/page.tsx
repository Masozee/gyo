"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  Send,
  Paperclip,
  Type,
  Bold,
  Italic,
  Link,
  Image,
  Save,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { toast } from "sonner"

export default function ComposePage() {
  const router = useRouter()
  const [to, setTo] = React.useState("")
  const [cc, setCc] = React.useState("")
  const [bcc, setBcc] = React.useState("")
  const [subject, setSubject] = React.useState("")
  const [body, setBody] = React.useState("")
  const [showCc, setShowCc] = React.useState(false)
  const [showBcc, setShowBcc] = React.useState(false)
  const [sending, setSending] = React.useState(false)
  const [saving, setSaving] = React.useState(false)

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const validateEmails = (emails: string) => {
    if (!emails.trim()) return true
    const emailList = emails.split(',').map(e => e.trim())
    return emailList.every(validateEmail)
  }

  const handleSend = async () => {
    // Validation
    if (!to.trim()) {
      toast.error("Please enter at least one recipient")
      return
    }

    if (!validateEmails(to)) {
      toast.error("Please enter valid email addresses in 'To' field")
      return
    }

    if (cc && !validateEmails(cc)) {
      toast.error("Please enter valid email addresses in 'CC' field")
      return
    }

    if (bcc && !validateEmails(bcc)) {
      toast.error("Please enter valid email addresses in 'BCC' field")
      return
    }

    if (!subject.trim()) {
      toast.error("Please enter a subject")
      return
    }

    if (!body.trim()) {
      toast.error("Please enter email content")
      return
    }

    try {
      setSending(true)
      
      const emailData = {
        to: to.split(',').map(e => e.trim()).filter(e => e),
        cc: cc ? cc.split(',').map(e => e.trim()).filter(e => e) : undefined,
        bcc: bcc ? bcc.split(',').map(e => e.trim()).filter(e => e) : undefined,
        subject: subject.trim(),
        text: body.trim(),
        html: body.replace(/\n/g, '<br>').trim(), // Simple conversion
        replyTo: "mail@nurojilukmansyah.com"
      }

      const response = await fetch('/api/mail/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to send email')
      }

      const result = await response.json()
      toast.success("Email sent successfully!")
      
      // Clear form or redirect
      router.push('/admin/mail/sent')
      
    } catch (error) {
      console.error('Error sending email:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to send email')
    } finally {
      setSending(false)
    }
  }

  const handleSaveDraft = async () => {
    try {
      setSaving(true)
      
      const draftData = {
        to: to.trim(),
        cc: cc.trim() || undefined,
        bcc: bcc.trim() || undefined,
        subject: subject.trim(),
        textContent: body.trim(),
        htmlContent: body.replace(/\n/g, '<br>').trim(),
      }

      const response = await fetch('/api/mail/drafts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(draftData)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save draft')
      }

      toast.success("Draft saved successfully!")
      
    } catch (error) {
      console.error('Error saving draft:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to save draft')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <h1 className="text-xl font-semibold">Compose Email</h1>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={handleSaveDraft}
            disabled={saving || sending}
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Saving..." : "Save Draft"}
          </Button>
          <Button 
            onClick={handleSend}
            disabled={sending || saving}
          >
            <Send className="w-4 h-4 mr-2" />
            {sending ? "Sending..." : "Send"}
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle>New Message</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* To Field */}
            <div className="space-y-2">
              <Label htmlFor="to">To</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="to"
                  placeholder="Enter email addresses..."
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="flex-1"
                />
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCc(!showCc)}
                    className={showCc ? "bg-muted" : ""}
                  >
                    Cc
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowBcc(!showBcc)}
                    className={showBcc ? "bg-muted" : ""}
                  >
                    Bcc
                  </Button>
                </div>
              </div>
            </div>

            {/* CC Field */}
            {showCc && (
              <div className="space-y-2">
                <Label htmlFor="cc">Cc</Label>
                <Input
                  id="cc"
                  placeholder="Enter CC email addresses..."
                  value={cc}
                  onChange={(e) => setCc(e.target.value)}
                />
              </div>
            )}

            {/* BCC Field */}
            {showBcc && (
              <div className="space-y-2">
                <Label htmlFor="bcc">Bcc</Label>
                <Input
                  id="bcc"
                  placeholder="Enter BCC email addresses..."
                  value={bcc}
                  onChange={(e) => setBcc(e.target.value)}
                />
              </div>
            )}

            {/* Subject Field */}
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="Enter subject..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>

            <Separator />

            {/* Formatting Toolbar */}
            <div className="flex items-center gap-1 p-2 border rounded-md bg-muted/30">
              <Button variant="ghost" size="sm">
                <Bold className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Italic className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Link className="w-4 h-4" />
              </Button>
              <Separator orientation="vertical" className="h-4" />
              <Button variant="ghost" size="sm">
                <Paperclip className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Image className="w-4 h-4" />
              </Button>
              <div className="flex-1" />
              <span className="text-xs text-muted-foreground">
                Rich text editor will be implemented with email service
              </span>
            </div>

            {/* Message Body */}
            <div className="space-y-2">
              <Label htmlFor="body">Message</Label>
              <Textarea
                id="body"
                placeholder="Type your message here..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="min-h-[300px] resize-none"
              />
            </div>

            {/* Email Service Notice */}
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Note:</strong> Email functionality is ready for integration. 
                Configure your email service credentials in .env and implement the 
                email sending logic to enable full email management capabilities.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}