import { NextRequest, NextResponse } from 'next/server'
import { createEmail } from '@/lib/email-storage'

// For now, use a mock user ID. In a real app, this would come from authentication
const MOCK_USER_ID = 1

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Received webhook from Resend:', body)

    // Resend webhook payload structure
    const { type, data } = body

    if (type === 'email.received') {
      const email = data
      
      // Create email in database
      await createEmail({
        messageId: email.id || email.message_id,
        from: email.from?.email || email.from,
        fromName: email.from?.name || email.from,
        to: email.to?.map((t: any) => t.email || t).join(', ') || email.to,
        cc: email.cc?.map((c: any) => c.email || c).join(', '),
        bcc: email.bcc?.map((b: any) => b.email || b).join(', '),
        subject: email.subject || '(No subject)',
        textContent: email.text,
        htmlContent: email.html,
        preview: email.text ? email.text.substring(0, 200) : '',
        folder: 'inbox',
        isRead: false,
        isStarred: false,
        isImportant: false,
        isDraft: false,
        hasAttachments: email.attachments && email.attachments.length > 0,
        attachmentCount: email.attachments ? email.attachments.length : 0,
        deliveryStatus: 'received',
        receivedAt: new Date().toISOString(),
        userId: MOCK_USER_ID
      })

      console.log('Email saved to database:', email.subject)
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    )
  }
}

// Handle other HTTP methods
export async function GET() {
  return NextResponse.json({ message: 'Resend webhook endpoint' })
}