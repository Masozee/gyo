import { NextRequest, NextResponse } from 'next/server'
import { getEmails, updateEmails, deleteEmails, getUnreadCount } from '@/lib/email-storage'

// For now, use a mock user ID. In a real app, this would come from authentication
const MOCK_USER_ID = 1

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const folder = searchParams.get('folder') || 'inbox'
    const starred = searchParams.get('starred') === 'true'
    const search = searchParams.get('search') || undefined
    const label = searchParams.get('label') || undefined
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0

    // Get emails from database
    const emailList = await getEmails({
      userId: MOCK_USER_ID,
      folder,
      starred: starred || undefined,
      search,
      label,
      limit,
      offset
    })

    // Get unread count
    const unreadCount = await getUnreadCount(MOCK_USER_ID, folder)

    // Transform data for frontend compatibility
    const transformedEmails = emailList.map(email => ({
      id: email.id.toString(),
      from: email.from,
      fromName: email.fromName || email.from,
      subject: email.subject,
      preview: email.preview || email.textContent?.substring(0, 200) || '',
      content: email.htmlContent || email.textContent || '',
      date: new Date(email.createdAt || email.receivedAt || Date.now()),
      read: email.isRead || false,
      starred: email.isStarred || false,
      important: email.isImportant || false,
      labels: email.labels || [],
      attachments: email.attachmentCount || 0,
      folder: email.folder || 'inbox'
    }))

    return NextResponse.json({
      emails: transformedEmails,
      total: transformedEmails.length,
      unread: unreadCount
    })

  } catch (error) {
    console.error('Email fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch emails' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { emailIds, action, value } = body

    if (!emailIds || !Array.isArray(emailIds) || emailIds.length === 0) {
      return NextResponse.json(
        { error: 'Invalid email IDs provided' },
        { status: 400 }
      )
    }

    // Convert string IDs to numbers
    const numericEmailIds = emailIds.map(id => parseInt(id.toString()))

    let updates: any = {}

    switch (action) {
      case 'markAsRead':
        updates.isRead = value
        break
      case 'star':
        updates.isStarred = value
        break
      case 'archive':
        updates.folder = 'archive'
        break
      case 'delete':
        // For delete, we'll move to trash instead of hard delete
        updates.folder = 'trash'
        break
      case 'move':
        updates.folder = value
        break
      case 'addLabel':
        // This would require more complex logic to add labels
        break
      case 'removeLabel':
        // This would require more complex logic to remove labels
        break
      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        )
    }

    // Update emails in database
    await updateEmails(numericEmailIds, MOCK_USER_ID, updates)
    
    return NextResponse.json({
      success: true,
      message: `Successfully ${action} ${emailIds.length} email(s)`
    })

  } catch (error) {
    console.error('Email update error:', error)
    return NextResponse.json(
      { error: 'Failed to update emails' },
      { status: 500 }
    )
  }
}