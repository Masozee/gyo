import { eq, like, or, desc, and, max } from 'drizzle-orm';
import { db } from '../db-server';
import { documents, documentRevisions, documentComments, documentSignatures, projects, clients, users, type Document, type NewDocument, type DocumentRevision } from '../schema';

export interface DocumentWithRelations extends Document {
  project?: {
    id: number;
    title: string;
  };
  client?: {
    id: number;
    name: string;
    company?: string | null;
  };
  user?: {
    id: number;
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
}

// Get all documents with optional search and filters (SERVER-SIDE)
export async function getDocumentsServer(
  search?: string,
  type?: string,
  status?: string,
  projectId?: number,
  clientId?: number,
  category?: string
): Promise<DocumentWithRelations[]> {
  const baseQuery = db.select({
    document: documents,
    project: projects,
    client: clients,
    user: users,
  })
  .from(documents)
  .leftJoin(projects, eq(documents.projectId, projects.id))
  .leftJoin(clients, eq(documents.clientId, clients.id))
  .leftJoin(users, eq(documents.userId, users.id));

  const conditions = [];

  if (search) {
    conditions.push(
      or(
        like(documents.title, `%${search}%`),
        like(documents.description, `%${search}%`),
        like(documents.documentNumber, `%${search}%`),
        like(projects.title, `%${search}%`),
        like(clients.name, `%${search}%`)
      )
    );
  }

  if (type) {
    conditions.push(eq(documents.type, type));
  }

  if (status) {
    conditions.push(eq(documents.status, status));
  }

  if (projectId) {
    conditions.push(eq(documents.projectId, projectId));
  }

  if (clientId) {
    conditions.push(eq(documents.clientId, clientId));
  }

  if (category) {
    conditions.push(eq(documents.category, category));
  }

  // Only show active documents
  conditions.push(eq(documents.isActive, true));

  const result = conditions.length > 0 
    ? await baseQuery.where(and(...conditions)).orderBy(desc(documents.internalNumber))
    : await baseQuery.where(eq(documents.isActive, true)).orderBy(desc(documents.internalNumber));
  
  return result.map(row => ({
    ...row.document,
    project: row.project || undefined,
    client: row.client || undefined,
    user: row.user || undefined,
  })) as DocumentWithRelations[];
}

// Get document by ID with relationships (SERVER-SIDE)
export async function getDocumentByIdServer(id: number): Promise<DocumentWithRelations | null> {
  const [result] = await db.select({
    document: documents,
    project: projects,
    client: clients,
    user: users,
  })
  .from(documents)
  .leftJoin(projects, eq(documents.projectId, projects.id))
  .leftJoin(clients, eq(documents.clientId, clients.id))
  .leftJoin(users, eq(documents.userId, users.id))
  .where(and(eq(documents.id, id), eq(documents.isActive, true)))
  .limit(1);

  if (!result) return null;

  // Update access tracking
  await db.update(documents)
    .set({
      lastAccessedAt: new Date().toISOString(),
      accessCount: (result.document.accessCount || 0) + 1,
    })
    .where(eq(documents.id, id));

  return {
    ...result.document,
    project: result.project || undefined,
    client: result.client || undefined,
    user: result.user || undefined,
  } as DocumentWithRelations;
}

// Get next internal number
async function getNextInternalNumber(): Promise<number> {
  const [result] = await db.select({ maxNumber: max(documents.internalNumber) })
    .from(documents);
  
  return (result?.maxNumber || 0) + 1;
}

// Create new document (SERVER-SIDE)
export async function createDocumentServer(documentData: NewDocument): Promise<Document> {
  const internalNumber = await getNextInternalNumber();
  
  const [document] = await db.insert(documents)
    .values({
      ...documentData,
      internalNumber,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    .returning();
  
  return document;
}

// Update document (SERVER-SIDE)
export async function updateDocumentServer(id: number, documentData: Partial<NewDocument>): Promise<Document | null> {
  const [updatedDocument] = await db.update(documents)
    .set({
      ...documentData,
      updatedAt: new Date().toISOString(),
    })
    .where(and(eq(documents.id, id), eq(documents.isActive, true)))
    .returning();
  
  return updatedDocument || null;
}

// Soft delete document (SERVER-SIDE)
export async function deleteDocumentServer(id: number): Promise<boolean> {
  try {
    const [result] = await db.update(documents)
      .set({
        isActive: false,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(documents.id, id))
      .returning();
    
    return !!result;
  } catch (error) {
    console.error('Error deleting document:', error);
    return false;
  }
}

// Get documents by project (SERVER-SIDE)
export async function getDocumentsByProjectServer(projectId: number): Promise<Document[]> {
  return await db.select()
    .from(documents)
    .where(and(eq(documents.projectId, projectId), eq(documents.isActive, true)))
    .orderBy(desc(documents.internalNumber));
}

// Get documents by client (SERVER-SIDE)
export async function getDocumentsByClientServer(clientId: number): Promise<Document[]> {
  return await db.select()
    .from(documents)
    .where(and(eq(documents.clientId, clientId), eq(documents.isActive, true)))
    .orderBy(desc(documents.internalNumber));
}

// Get documents by status (SERVER-SIDE)
export async function getDocumentsByStatusServer(status: string): Promise<Document[]> {
  return await db.select()
    .from(documents)
    .where(and(eq(documents.status, status), eq(documents.isActive, true)))
    .orderBy(desc(documents.internalNumber));
}

// Get expiring documents (within next 30 days) (SERVER-SIDE)
export async function getExpiringDocumentsServer(days: number = 30): Promise<Document[]> {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  
  return await db.select()
    .from(documents)
    .where(and(
      eq(documents.isActive, true),
      like(documents.expiryDate, `%${futureDate.toISOString().split('T')[0]}%`)
    ))
    .orderBy(documents.expiryDate);
}

// Create document revision (SERVER-SIDE)
export async function createDocumentRevisionServer(revisionData: {
  documentId: number;
  title: string;
  content?: string;
  changes: string;
  revisedBy: number;
  filePath?: string;
  fileName?: string;
  fileSize?: number;
}): Promise<DocumentRevision> {
  // Get the latest revision number
  const [latestRevision] = await db.select({ revisionNumber: max(documentRevisions.revisionNumber) })
    .from(documentRevisions)
    .where(eq(documentRevisions.documentId, revisionData.documentId));
  
  const nextRevisionNumber = (latestRevision?.revisionNumber || 0) + 1;
  
  const [revision] = await db.insert(documentRevisions)
    .values({
      ...revisionData,
      revisionNumber: nextRevisionNumber,
      createdAt: new Date().toISOString(),
    })
    .returning();
  
  return revision;
}

// Get document revisions (SERVER-SIDE)
export async function getDocumentRevisionsServer(documentId: number): Promise<DocumentRevision[]> {
  return await db.select()
    .from(documentRevisions)
    .where(eq(documentRevisions.documentId, documentId))
    .orderBy(desc(documentRevisions.revisionNumber));
}

// Get document statistics (SERVER-SIDE)
export async function getDocumentStatsServer(): Promise<{
  total: number;
  byStatus: { [key: string]: number };
  byType: { [key: string]: number };
  expiring: number;
  recentlyCreated: number;
}> {
  const allDocuments = await db.select().from(documents).where(eq(documents.isActive, true));
  
  const byStatus: { [key: string]: number } = {};
  const byType: { [key: string]: number } = {};
  
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const nextMonth = new Date();
  nextMonth.setDate(nextMonth.getDate() + 30);
  
  let expiring = 0;
  let recentlyCreated = 0;
  
  allDocuments.forEach(doc => {
    // Status counts
    if (doc.status) {
      byStatus[doc.status] = (byStatus[doc.status] || 0) + 1;
    }
    
    // Type counts
    if (doc.type) {
      byType[doc.type] = (byType[doc.type] || 0) + 1;
    }
    
    // Expiring count
    if (doc.expiryDate && new Date(doc.expiryDate) <= nextMonth) {
      expiring++;
    }
    
    // Recently created count
    if (doc.createdAt && new Date(doc.createdAt) >= thirtyDaysAgo) {
      recentlyCreated++;
    }
  });
  
  return {
    total: allDocuments.length,
    byStatus,
    byType,
    expiring,
    recentlyCreated,
  };
} 