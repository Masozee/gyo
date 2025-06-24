import { NextRequest, NextResponse } from 'next/server'
export const runtime = 'nodejs';
import { createEmail } from '@/lib/email-storage'

// For now, use a mock user ID. In a real app, this would come from authentication
const MOCK_USER_ID = 1

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Received general email webhook:', body)

    // Generic email webhook format
    const {
      messageId,
      from,
      fromName,
      to,
      cc,
      bcc,
      subject,
      textContent,
      htmlContent,
      attachments
    } = body

    if (!from || !to || !subject) {
      return NextResponse.json(
        { error: 'Missing required fields: from, to, subject' },
        { status: 400 }
      )
    }

    // Create email in database
    await createEmail({
      messageId,
      from,
      fromName,
      to: Array.isArray(to) ? to.join(', ') : to,
      cc: Array.isArray(cc) ? cc.join(', ') : cc,
      bcc: Array.isArray(bcc) ? bcc.join(', ') : bcc,
      subject,
      textContent,
      htmlContent,
      preview: textContent ? textContent.substring(0, 200) : '',
      folder: 'inbox',
      isRead: false,
      isStarred: false,
      isImportant: false,
      isDraft: false,
      hasAttachments: attachments && attachments.length > 0,
      attachmentCount: attachments ? attachments.length : 0,
      deliveryStatus: 'received',
      receivedAt: new Date().toISOString(),
      userId: MOCK_USER_ID
    })

    console.log('Email saved to database via general webhook:', subject)

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('General webhook processing error:', error)
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'General email webhook endpoint',
    usage: 'POST emails in the format: { messageId, from, fromName, to, cc, bcc, subject, textContent, htmlContent, attachments }'
  })
}