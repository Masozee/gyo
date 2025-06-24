import { Project, NewProject } from '../schema';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export interface ProjectWithRelations extends Project {
  client?: {
    id: number;
    name: string;
    company?: string | null;
    email: string | null;
    phone?: string | null;
    website?: string | null;
  };
  user?: {
    id: number;
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
}

export interface ProjectFormData {
  title: string;
  description?: string;
  clientId: number;
  userId: number;
  status: 'PLANNING' | 'IN_PROGRESS' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  startDate?: string;
  deadline?: string;
  projectValue?: number;
  progressPercentage?: number;
}

// Get all projects with optional filters
export async function getProjects(search?: string, status?: string, clientId?: number): Promise<ProjectWithRelations[]> {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (status) params.append('status', status);
  if (clientId) params.append('clientId', clientId.toString());

  const response = await fetch(`${API_BASE_URL}/projects?${params.toString()}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch projects: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.projects || [];
}

// Get project by ID
export async function getProject(id: number): Promise<ProjectWithRelations> {
  const response = await fetch(`${API_BASE_URL}/projects/${id}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch project: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data;
}

// Create new project
export async function createProject(projectData: ProjectFormData): Promise<Project> {
  const response = await fetch(`${API_BASE_URL}/projects`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(projectData),
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create project: ${error}`);
  }
  
  const data = await response.json();
  return data;
}

// Update project
export async function updateProject(id: number, projectData: Partial<ProjectFormData>): Promise<Project> {
  const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(projectData),
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to update project: ${error}`);
  }
  
  const data = await response.json();
  return data;
}

// Delete project
export async function deleteProject(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error(`Failed to delete project: ${response.statusText}`);
  }
}

// Update project progress
export async function updateProjectProgress(id: number, progressPercentage: number): Promise<Project> {
  const response = await fetch(`${API_BASE_URL}/projects/${id}/progress`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ progressPercentage }),
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to update project progress: ${error}`);
  }
  
  const data = await response.json();
  return data;
}

// Get project statistics
export async function getProjectStats(): Promise<{
  total: number;
  planning: number;
  inProgress: number;
  onHold: number;
  completed: number;
  cancelled: number;
}> {
  const response = await fetch(`${API_BASE_URL}/projects/stats`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch project stats: ${response.statusText}`);
  }
  
  return response.json();
}

// Get projects by status
export async function getProjectsByStatus(status: string): Promise<ProjectWithRelations[]> {
  return getProjects(undefined, status);
}

// Get projects by client
export async function getProjectsByClient(clientId: number): Promise<ProjectWithRelations[]> {
  return getProjects(undefined, undefined, clientId);
} 