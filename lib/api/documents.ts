import { config } from '@/lib/config';
import { type Document, type NewDocument } from '../schema';

const API_BASE_URL = config.apiUrl;

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

export interface DocumentFormData {
  title: string;
  description?: string;
  type: string;
  status: string;
  projectId?: number;
  clientId?: number;
  userId: number;
  category?: string;
  documentNumber?: string;
  filePath?: string;
  fileName?: string;
  fileSize?: number;
  expiryDate?: string;
  tags?: string;
  priority?: string;
  isConfidential?: boolean;
}

// Get all documents with optional search and filters
export async function getDocuments(
  search?: string,
  type?: string,
  status?: string,
  projectId?: number,
  clientId?: number,
  category?: string
): Promise<DocumentWithRelations[]> {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (type) params.append('type', type);
  if (status) params.append('status', status);
  if (projectId) params.append('projectId', projectId.toString());
  if (clientId) params.append('clientId', clientId.toString());
  if (category) params.append('category', category);

  const response = await fetch(`${API_BASE_URL}/docs?${params.toString()}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch documents: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.documents || [];
}

// Get document by ID with relationships
export async function getDocumentById(id: number): Promise<DocumentWithRelations | null> {
  const response = await fetch(`${API_BASE_URL}/docs/${id}`);
  
  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error(`Failed to fetch document: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.document;
}

// Create new document
export async function createDocument(documentData: DocumentFormData): Promise<Document> {
  const response = await fetch(`${API_BASE_URL}/docs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(documentData),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || `Failed to create document: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.document;
}

// Update document
export async function updateDocument(id: number, documentData: Partial<DocumentFormData>): Promise<Document | null> {
  const response = await fetch(`${API_BASE_URL}/docs/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(documentData),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || `Failed to update document: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.document;
}

// Soft delete document
export async function deleteDocument(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/docs/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || `Failed to delete document: ${response.statusText}`);
  }
}

// Get documents by project
export async function getDocumentsByProject(projectId: number): Promise<Document[]> {
  return getDocuments(undefined, undefined, undefined, projectId);
}

// Get documents by client
export async function getDocumentsByClient(clientId: number): Promise<Document[]> {
  return getDocuments(undefined, undefined, undefined, undefined, clientId);
}

// Get documents by status
export async function getDocumentsByStatus(status: string): Promise<Document[]> {
  return getDocuments(undefined, undefined, status);
}

// Get expiring documents (within next 30 days)
export async function getExpiringDocuments(days: number = 30): Promise<Document[]> {
  const response = await fetch(`${API_BASE_URL}/docs/expiring?days=${days}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch expiring documents: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.documents || [];
}

// Document revision types and interfaces
export interface DocumentRevision {
  id: number;
  documentId: number;
  title: string;
  content?: string;
  changes: string;
  revisedBy: number;
  filePath?: string;
  fileName?: string;
  fileSize?: number;
  createdAt: string;
}

// Create document revision
export async function createDocumentRevision(revisionData: {
  documentId: number;
  title: string;
  content?: string;
  changes: string;
  revisedBy: number;
  filePath?: string;
  fileName?: string;
  fileSize?: number;
}): Promise<DocumentRevision> {
  const response = await fetch(`${API_BASE_URL}/docs/${revisionData.documentId}/revisions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(revisionData),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || `Failed to create document revision: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.revision;
}

// Get document revisions
export async function getDocumentRevisions(documentId: number): Promise<DocumentRevision[]> {
  const response = await fetch(`${API_BASE_URL}/docs/${documentId}/revisions`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch document revisions: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.revisions || [];
}

// Get document statistics
export async function getDocumentStats(): Promise<{
  total: number;
  byStatus: { [key: string]: number };
  byType: { [key: string]: number };
  expiring: number;
  recentlyCreated: number;
}> {
  const response = await fetch(`${API_BASE_URL}/docs/stats`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch document stats: ${response.statusText}`);
  }
  
  return response.json();
} 