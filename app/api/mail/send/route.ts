import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createEmail } from '@/lib/email-storage'

const resend = new Resend(process.env.RESEND_API_KEY || 're_3PZ25XXm_4ZEJzUoDqXif2v1ahSDsXDVQ')

// For now, use a mock user ID. In a real app, this would come from authentication
const MOCK_USER_ID = 1

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { to, cc, bcc, subject, html, text, replyTo } = body

    // Validation
    if (!to || !subject || (!html && !text)) {
      return NextResponse.json(
        { error: 'Missing required fields: to, subject, and content' },
        { status: 400 }
      )
    }

    // Send email via Resend
    const emailData: any = {
      from: 'Nuroji Lukmansyah <mail@nurojilukmansyah.com>',
      to: Array.isArray(to) ? to : [to],
      subject,
      replyTo: replyTo || 'mail@nurojilukmansyah.com',
    }

    // Add CC and BCC if provided
    if (cc && cc.length > 0) {
      emailData.cc = Array.isArray(cc) ? cc : [cc]
    }
    if (bcc && bcc.length > 0) {
      emailData.bcc = Array.isArray(bcc) ? bcc : [bcc]
    }

    // Add content
    if (html) {
      emailData.html = html
    }
    if (text) {
      emailData.text = text
    }
    if (!text && html) {
      // Generate text version from HTML if not provided
      emailData.text = html.replace(/<[^>]*>/g, '')
    }

    const result = await resend.emails.send(emailData)

    if (result.error) {
      console.error('Resend error:', result.error)
      return NextResponse.json(
        { error: 'Failed to send email', details: result.error },
        { status: 500 }
      )
    }

    // Save email to database for sent folder
    try {
      await createEmail({
        messageId: result.data?.id,
        from: 'mail@nurojilukmansyah.com',
        fromName: 'Nuroji Lukmansyah',
        to: Array.isArray(to) ? to.join(', ') : to,
        cc: cc && cc.length > 0 ? (Array.isArray(cc) ? cc.join(', ') : cc) : undefined,
        bcc: bcc && bcc.length > 0 ? (Array.isArray(bcc) ? bcc.join(', ') : bcc) : undefined,
        replyTo: replyTo || 'mail@nurojilukmansyah.com',
        subject,
        textContent: text || (html ? html.replace(/<[^>]*>/g, '') : ''),
        htmlContent: html,
        preview: text ? text.substring(0, 200) : (html ? html.replace(/<[^>]*>/g, '').substring(0, 200) : ''),
        folder: 'sent',
        isRead: true, // Sent emails are always read
        isStarred: false,
        isImportant: false,
        isDraft: false,
        deliveryStatus: 'sent',
        sentAt: new Date().toISOString(),
        userId: MOCK_USER_ID
      })
    } catch (dbError) {
      console.error('Failed to save sent email to database:', dbError)
      // Don't fail the API call if database save fails, email was still sent
    }

    return NextResponse.json({
      success: true,
      id: result.data?.id,
      message: 'Email sent successfully'
    })

  } catch (error) {
    console.error('Email send error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}