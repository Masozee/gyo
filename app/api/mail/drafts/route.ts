import { NextRequest, NextResponse } from 'next/server'
export const runtime = 'edge';
import { createDraft, getDrafts, updateDraft, deleteDraft } from '@/lib/email-storage'

// For now, use a mock user ID. In a real app, this would come from authentication
const MOCK_USER_ID = 1

export async function GET(request: NextRequest) {
  try {
    const drafts = await getDrafts(MOCK_USER_ID)
    
    // Transform data for frontend compatibility
    const transformedDrafts = drafts.map(draft => ({
      id: draft.id.toString(),
      from: 'mail@nurojilukmansyah.com',
      fromName: 'Draft',
      to: draft.to,
      cc: draft.cc,
      bcc: draft.bcc,
      subject: draft.subject || '(No subject)',
      preview: draft.textContent?.substring(0, 200) || '',
      content: draft.htmlContent || draft.textContent || '',
      date: new Date(draft.updatedAt || draft.createdAt || Date.now()),
      read: true,
      starred: false,
      important: false,
      labels: [],
      attachments: 0,
      folder: 'drafts'
    }))

    return NextResponse.json({
      emails: transformedDrafts,
      total: transformedDrafts.length,
      unread: 0
    })

  } catch (error) {
    console.error('Draft fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch drafts' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { to, cc, bcc, subject, textContent, htmlContent, replyToEmailId, forwardEmailId } = body

    // Validation
    if (!to && !subject && !textContent && !htmlContent) {
      return NextResponse.json(
        { error: 'Draft must have at least some content' },
        { status: 400 }
      )
    }

    // Create draft in database
    const draft = await createDraft({
      to: to || '',
      cc,
      bcc,
      subject: subject || '',
      textContent,
      htmlContent,
      replyToEmailId,
      forwardEmailId,
      userId: MOCK_USER_ID
    })

    return NextResponse.json({
      success: true,
      id: draft.id,
      message: 'Draft saved successfully'
    })

  } catch (error) {
    console.error('Draft save error:', error)
    return NextResponse.json(
      { error: 'Failed to save draft' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { draftIds, action, value } = body

    if (!draftIds || !Array.isArray(draftIds) || draftIds.length === 0) {
      return NextResponse.json(
        { error: 'Invalid draft IDs provided' },
        { status: 400 }
      )
    }

    // Convert string IDs to numbers
    const numericDraftIds = draftIds.map(id => parseInt(id.toString()))

    if (action === 'delete') {
      // Delete drafts
      for (const draftId of numericDraftIds) {
        await deleteDraft(draftId, MOCK_USER_ID)
      }
    } else {
      return NextResponse.json(
        { error: `Unknown action: ${action}` },
        { status: 400 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: `Successfully ${action} ${draftIds.length} draft(s)`
    })

  } catch (error) {
    console.error('Draft update error:', error)
    return NextResponse.json(
      { error: 'Failed to update drafts' },
      { status: 500 }
    )
  }
}