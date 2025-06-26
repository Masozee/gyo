import { db } from './db-server'
import { emails, emailAttachments, emailLabels, emailDrafts, type Email, type EmailAttachment, type EmailLabel, type EmailDraft } from './schema'
import { eq, and, or, desc, like, sql, inArray } from 'drizzle-orm'

// Email CRUD Operations
export async function createEmail(emailData: {
  messageId?: string
  threadId?: string
  from: string
  fromName?: string
  to: string
  cc?: string
  bcc?: string
  replyTo?: string
  subject: string
  textContent?: string
  htmlContent?: string
  preview?: string
  folder?: string
  isRead?: boolean
  isStarred?: boolean
  isImportant?: boolean
  isDraft?: boolean
  labels?: string[]
  category?: string
  providerData?: any
  deliveryStatus?: string
  sentAt?: string
  receivedAt?: string
  hasAttachments?: boolean
  attachmentCount?: number
  inReplyTo?: string
  references?: string
  userId: number
}) {
  const [result] = await db.insert(emails).values({
    messageId: emailData.messageId,
    threadId: emailData.threadId,
    from: emailData.from,
    fromName: emailData.fromName,
    to: emailData.to,
    cc: emailData.cc,
    bcc: emailData.bcc,
    replyTo: emailData.replyTo,
    subject: emailData.subject,
    textContent: emailData.textContent,
    htmlContent: emailData.htmlContent,
    preview: emailData.preview || emailData.textContent?.substring(0, 200),
    folder: emailData.folder || 'inbox',
    isRead: emailData.isRead || false,
    isStarred: emailData.isStarred || false,
    isImportant: emailData.isImportant || false,
    isDraft: emailData.isDraft || false,
    labels: emailData.labels ? JSON.stringify(emailData.labels) : null,
    category: emailData.category,
    providerData: emailData.providerData ? JSON.stringify(emailData.providerData) : null,
    deliveryStatus: emailData.deliveryStatus,
    sentAt: emailData.sentAt ? new Date(emailData.sentAt) : null,
    receivedAt: emailData.receivedAt ? new Date(emailData.receivedAt) : new Date(),
    hasAttachments: emailData.hasAttachments || false,
    attachmentCount: emailData.attachmentCount || 0,
    inReplyTo: emailData.inReplyTo,
    references: emailData.references,
    userId: emailData.userId,
  }).returning()
  
  return result
}

export async function getEmails(filters: {
  userId: number
  folder?: string
  starred?: boolean
  search?: string
  label?: string
  limit?: number
  offset?: number
}) {
  let query = db.select().from(emails).where(eq(emails.userId, filters.userId))

  // Apply filters
  const conditions = [eq(emails.userId, filters.userId)]

  if (filters.folder && filters.folder !== 'all') {
    conditions.push(eq(emails.folder, filters.folder))
  }

  if (filters.starred === true) {
    conditions.push(eq(emails.isStarred, true))
  }

  if (filters.search) {
    const searchTerm = `%${filters.search}%`
    conditions.push(
      or(
        like(emails.subject, searchTerm),
        like(emails.fromName, searchTerm),
        like(emails.from, searchTerm),
        like(emails.preview, searchTerm)
      )!
    )
  }

  if (filters.label) {
    conditions.push(like(emails.labels, `%"${filters.label}"%`))
  }

  const result = await db
    .select()
    .from(emails)
    .where(and(...conditions))
    .orderBy(desc(emails.createdAt))
    .limit(filters.limit || 50)
    .offset(filters.offset || 0)

  // Parse JSON fields
  return result.map(email => ({
    ...email,
    labels: email.labels ? JSON.parse(email.labels) : [],
    providerData: email.providerData ? JSON.parse(email.providerData) : null,
  }))
}

export async function getEmailById(id: number, userId: number) {
  const [result] = await db
    .select()
    .from(emails)
    .where(and(eq(emails.id, id), eq(emails.userId, userId)))

  if (!result) return null

  return {
    ...result,
    labels: result.labels ? JSON.parse(result.labels) : [],
    providerData: result.providerData ? JSON.parse(result.providerData) : null,
  }
}

export async function updateEmail(id: number, userId: number, updates: Partial<{
  isRead: boolean
  isStarred: boolean
  isImportant: boolean
  folder: string
  labels: string[]
}>) {
  const updateData: any = { ...updates }
  
  if (updates.labels) {
    updateData.labels = JSON.stringify(updates.labels)
  }

  updateData.updatedAt = new Date().toISOString()

  const [result] = await db
    .update(emails)
    .set(updateData)
    .where(and(eq(emails.id, id), eq(emails.userId, userId)))
    .returning()

  return result
}

export async function updateEmails(emailIds: number[], userId: number, updates: Partial<{
  isRead: boolean
  isStarred: boolean
  isImportant: boolean
  folder: string
  labels: string[]
}>) {
  const updateData: any = { ...updates }
  
  if (updates.labels) {
    updateData.labels = JSON.stringify(updates.labels)
  }

  updateData.updatedAt = new Date().toISOString()

  const result = await db
    .update(emails)
    .set(updateData)
    .where(and(inArray(emails.id, emailIds), eq(emails.userId, userId)))
    .returning()

  return result
}

export async function deleteEmail(id: number, userId: number) {
  const [result] = await db
    .delete(emails)
    .where(and(eq(emails.id, id), eq(emails.userId, userId)))
    .returning()

  return result
}

export async function deleteEmails(emailIds: number[], userId: number) {
  const result = await db
    .delete(emails)
    .where(and(inArray(emails.id, emailIds), eq(emails.userId, userId)))
    .returning()

  return result
}

export async function getUnreadCount(userId: number, folder?: string) {
  const conditions = [eq(emails.userId, userId), eq(emails.isRead, false)]
  
  if (folder && folder !== 'all') {
    conditions.push(eq(emails.folder, folder))
  }

  const [result] = await db
    .select({ count: sql<number>`count(*)` })
    .from(emails)
    .where(and(...conditions))

  return result?.count || 0
}

// Email Drafts
export async function createDraft(draftData: {
  to: string
  cc?: string
  bcc?: string
  subject: string
  textContent?: string
  htmlContent?: string
  attachments?: any[]
  replyToEmailId?: number
  forwardEmailId?: number
  userId: number
}) {
  const [result] = await db.insert(emailDrafts).values({
    to: draftData.to,
    cc: draftData.cc,
    bcc: draftData.bcc,
    subject: draftData.subject,
    textContent: draftData.textContent,
    htmlContent: draftData.htmlContent,
    attachments: draftData.attachments ? JSON.stringify(draftData.attachments) : null,
    replyToEmailId: draftData.replyToEmailId,
    forwardEmailId: draftData.forwardEmailId,
    userId: draftData.userId,
  }).returning()
  
  return result
}

export async function getDrafts(userId: number) {
  const result = await db
    .select()
    .from(emailDrafts)
    .where(eq(emailDrafts.userId, userId))
    .orderBy(desc(emailDrafts.updatedAt))

  return result.map(draft => ({
    ...draft,
    attachments: draft.attachments ? JSON.parse(draft.attachments) : [],
  }))
}

export async function updateDraft(id: number, userId: number, updates: Partial<{
  to: string
  cc?: string
  bcc?: string
  subject: string
  textContent?: string
  htmlContent?: string
  attachments?: any[]
}>) {
  const updateData: any = { ...updates }
  
  if (updates.attachments) {
    updateData.attachments = JSON.stringify(updates.attachments)
  }

  updateData.updatedAt = new Date().toISOString()

  const [result] = await db
    .update(emailDrafts)
    .set(updateData)
    .where(and(eq(emailDrafts.id, id), eq(emailDrafts.userId, userId)))
    .returning()

  return result
}

export async function deleteDraft(id: number, userId: number) {
  const [result] = await db
    .delete(emailDrafts)
    .where(and(eq(emailDrafts.id, id), eq(emailDrafts.userId, userId)))
    .returning()

  return result
}

// Email Labels
export async function createLabel(labelData: {
  name: string
  color?: string
  isSystem?: boolean
  userId: number
}) {
  const [result] = await db.insert(emailLabels).values({
    name: labelData.name,
    color: labelData.color || '#3b82f6',
    isSystem: labelData.isSystem || false,
    userId: labelData.userId,
  }).returning()
  
  return result
}

export async function getLabels(userId: number) {
  return await db
    .select()
    .from(emailLabels)
    .where(eq(emailLabels.userId, userId))
    .orderBy(emailLabels.name)
}

export async function updateLabel(id: number, userId: number, updates: {
  name?: string
  color?: string
}) {
  const [result] = await db
    .update(emailLabels)
    .set(updates)
    .where(and(eq(emailLabels.id, id), eq(emailLabels.userId, userId)))
    .returning()

  return result
}

export async function deleteLabel(id: number, userId: number) {
  const [result] = await db
    .delete(emailLabels)
    .where(and(eq(emailLabels.id, id), eq(emailLabels.userId, userId)))
    .returning()

  return result
}