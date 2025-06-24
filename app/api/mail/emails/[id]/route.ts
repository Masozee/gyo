import { NextRequest, NextResponse } from 'next/server'
import { getEmailById, updateEmail, deleteEmail } from '@/lib/email-storage'

// For now, use a mock user ID. In a real app, this would come from authentication
const MOCK_USER_ID = 1

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const emailId = parseInt(id)
    if (isNaN(emailId)) {
      return NextResponse.json(
        { error: 'Invalid email ID' },
        { status: 400 }
      )
    }

    const email = await getEmailById(emailId, MOCK_USER_ID)

    if (!email) {
      return NextResponse.json(
        { error: 'Email not found' },
        { status: 404 }
      )
    }

    // Mark as read when fetching individual email
    if (!email.isRead) {
      await updateEmail(emailId, MOCK_USER_ID, { isRead: true })
    }

    // Transform data for frontend compatibility
    const transformedEmail = {
      id: email.id.toString(),
      from: email.from,
      fromName: email.fromName || email.from,
      subject: email.subject,
      content: email.htmlContent || email.textContent || '',
      date: new Date(email.createdAt || email.receivedAt || Date.now()),
      read: true, // We just marked it as read
      starred: email.isStarred || false,
      important: email.isImportant || false,
      labels: email.labels || [],
      attachments: email.attachmentCount || 0,
      folder: email.folder || 'inbox'
    }

    return NextResponse.json({ email: transformedEmail })

  } catch (error) {
    console.error('Email fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch email' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const emailId = parseInt(id)
    if (isNaN(emailId)) {
      return NextResponse.json(
        { error: 'Invalid email ID' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { action, value } = body

    let updates: any = {}

    switch (action) {
      case 'star':
        updates.isStarred = value
        break
      case 'read':
        updates.isRead = value
        break
      case 'important':
        updates.isImportant = value
        break
      case 'archive':
        updates.folder = 'archive'
        break
      case 'delete':
        updates.folder = 'trash'
        break
      case 'move':
        updates.folder = value
        break
      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        )
    }

    // Update email in database
    const updatedEmail = await updateEmail(emailId, MOCK_USER_ID, updates)
    
    if (!updatedEmail) {
      return NextResponse.json(
        { error: 'Email not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Successfully updated email`
    })

  } catch (error) {
    console.error('Email update error:', error)
    return NextResponse.json(
      { error: 'Failed to update email' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const emailId = parseInt(id)
    if (isNaN(emailId)) {
      return NextResponse.json(
        { error: 'Invalid email ID' },
        { status: 400 }
      )
    }

    // Soft delete by moving to trash
    const updatedEmail = await updateEmail(emailId, MOCK_USER_ID, { folder: 'trash' })
    
    if (!updatedEmail) {
      return NextResponse.json(
        { error: 'Email not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Email deleted successfully'
    })

  } catch (error) {
    console.error('Email delete error:', error)
    return NextResponse.json(
      { error: 'Failed to delete email' },
      { status: 500 }
    )
  }
}