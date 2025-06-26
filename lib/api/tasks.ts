import { config } from '@/lib/config';
import { Task } from '@/lib/schema';

const API_BASE_URL = config.apiUrl;

export interface TaskFormData {
  title: string;
  description?: string;
  projectId: number;
  assignedToId?: number;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE' | 'CANCELLED';
  dueDate?: string;
  estimatedHours?: number;
  tags?: string;
  parentTaskId?: number;
}

export interface TaskWithRelations extends Task {
  project?: {
    id: number;
    title: string;
  };
  assignedTo?: {
    id: number;
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
}

// Get all tasks
export async function getTasks(
  projectId?: number,
  status?: string,
  assignedToId?: number
): Promise<TaskWithRelations[]> {
  const params = new URLSearchParams();
  if (projectId) params.append('projectId', projectId.toString());
  if (status) params.append('status', status);
  if (assignedToId) params.append('assignedToId', assignedToId.toString());

  const response = await fetch(`${API_BASE_URL}/tasks?${params.toString()}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch tasks: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data;
}

// Get task by ID
export async function getTask(id: number): Promise<TaskWithRelations> {
  const response = await fetch(`${API_BASE_URL}/tasks/${id}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch task: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data;
}

// Create new task
export async function createTask(taskData: TaskFormData): Promise<Task> {
  const response = await fetch(`${API_BASE_URL}/tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(taskData),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || `Failed to create task: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data;
}

// Update task
export async function updateTask(id: number, taskData: Partial<TaskFormData>): Promise<Task> {
  const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(taskData),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || `Failed to update task: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data;
}

// Delete task
export async function deleteTask(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || `Failed to delete task: ${response.statusText}`);
  }
}

// Update task status (for drag and drop)
export async function updateTaskStatus(id: number, status: string): Promise<Task> {
  const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || `Failed to update task status: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data;
}

// Get task comments
export async function getTaskComments(taskId: number) {
  const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/comments`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch task comments: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data;
}

// Create task comment
export async function createTaskComment(taskId: number, content: string, authorId: number, isInternal: boolean = false) {
  const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/comments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ content, authorId, isInternal }),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || `Failed to create comment: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data;
}

// Get task files
export async function getTaskFiles(taskId: number) {
  const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/files`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch task files: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data;
}

// Upload task file
export async function uploadTaskFile(
  taskId: number, 
  projectId: number, 
  uploadedById: number, 
  fileName: string, 
  fileUrl: string, 
  fileSize: number, 
  fileType: string, 
  description?: string
) {
  const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/files`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ 
      projectId, 
      uploadedById, 
      fileName, 
      fileUrl, 
      fileSize, 
      fileType, 
      description 
    }),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || `Failed to upload file: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data;
}

// Upload file attached to a comment
export async function uploadCommentFile(
  commentId: number,
  projectId: number, 
  uploadedById: number, 
  fileName: string, 
  fileUrl: string, 
  fileSize: number, 
  fileType: string, 
  description?: string
) {
  const response = await fetch(`${API_BASE_URL}/comments/${commentId}/files`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ 
      projectId, 
      uploadedById, 
      fileName, 
      fileUrl, 
      fileSize, 
      fileType, 
      description 
    }),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || `Failed to upload comment file: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data;
} 