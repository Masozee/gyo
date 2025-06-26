import { eq, like, or, desc, and } from 'drizzle-orm';
import { db } from '../db-server';
import { tasks, projects, users, type Task, type NewTask, projectComments, projectFiles } from '../schema';

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

// Get all tasks with optional filters (SERVER-SIDE)
export async function getTasksServer(
  projectId?: number,
  status?: string,
  assignedToId?: number
): Promise<TaskWithRelations[]> {
  const baseQuery = db.select({
    task: tasks,
    project: projects,
    assignedTo: users,
  })
  .from(tasks)
  .leftJoin(projects, eq(tasks.projectId, projects.id))
  .leftJoin(users, eq(tasks.assignedToId, users.id));

  const conditions = [];

  if (projectId) {
    conditions.push(eq(tasks.projectId, projectId));
  }

  if (status) {
    conditions.push(eq(tasks.status, status));
  }

  if (assignedToId) {
    conditions.push(eq(tasks.assignedToId, assignedToId));
  }

  const result = conditions.length > 0 
    ? await baseQuery.where(and(...conditions)).orderBy(desc(tasks.createdAt))
    : await baseQuery.orderBy(desc(tasks.createdAt));
  
  return result.map(row => ({
    ...row.task,
    project: row.project || undefined,
    assignedTo: row.assignedTo || undefined,
  })) as TaskWithRelations[];
}

// Get task by ID with relationships (SERVER-SIDE)
export async function getTaskByIdServer(id: number): Promise<TaskWithRelations | null> {
  const [result] = await db.select({
    task: tasks,
    project: projects,
    assignedTo: users,
  })
  .from(tasks)
  .leftJoin(projects, eq(tasks.projectId, projects.id))
  .leftJoin(users, eq(tasks.assignedToId, users.id))
  .where(eq(tasks.id, id))
  .limit(1);

  if (!result) return null;

  return {
    ...result.task,
    project: result.project || undefined,
    assignedTo: result.assignedTo || undefined,
  } as TaskWithRelations;
}

// Create new task (SERVER-SIDE)
export async function createTaskServer(taskData: NewTask): Promise<Task> {
  const [task] = await db.insert(tasks)
    .values({
      ...taskData,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();
  
  return task;
}

// Update task (SERVER-SIDE)
export async function updateTaskServer(id: number, taskData: Partial<NewTask>): Promise<Task | null> {
  const [updatedTask] = await db.update(tasks)
    .set({
      ...taskData,
      updatedAt: new Date(),
    })
    .where(eq(tasks.id, id))
    .returning();
  
  return updatedTask || null;
}

// Delete task (SERVER-SIDE)
export async function deleteTaskServer(id: number): Promise<boolean> {
  try {
    await db.delete(tasks)
      .where(eq(tasks.id, id));
    
    return true;
  } catch (error) {
    console.error('Error deleting task:', error);
    return false;
  }
}

// Get task comments with author info and attachments (SERVER-SIDE)
export async function getTaskCommentsServer(taskId: number) {
  const comments = await db.select({
    id: projectComments.id,
    content: projectComments.content,
    isInternal: projectComments.isInternal,
    createdAt: projectComments.createdAt,
    updatedAt: projectComments.updatedAt,
    author: {
      id: users.id,
      firstName: users.firstName,
      lastName: users.lastName,
      email: users.email,
    }
  })
  .from(projectComments)
  .leftJoin(users, eq(projectComments.authorId, users.id))
  .where(eq(projectComments.taskId, taskId))
  .orderBy(desc(projectComments.createdAt));

  // Get attachments for each comment
  const commentsWithAttachments = await Promise.all(
    comments.map(async (comment) => {
      const attachments = await db.select({
        id: projectFiles.id,
        fileName: projectFiles.fileName,
        fileUrl: projectFiles.fileUrl,
        fileSize: projectFiles.fileSize,
        fileType: projectFiles.fileType,
        description: projectFiles.description,
        createdAt: projectFiles.createdAt,
      })
      .from(projectFiles)
      .where(eq(projectFiles.commentId, comment.id))
      .orderBy(desc(projectFiles.createdAt));

      return {
        ...comment,
        attachments: attachments || []
      };
    })
  );

  return commentsWithAttachments;
}

// Create task comment (SERVER-SIDE)
export async function createTaskCommentServer(taskId: number, authorId: number, content: string, isInternal: boolean = false) {
  const [comment] = await db.insert(projectComments)
    .values({
      taskId,
      authorId,
      content,
      isInternal,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  // Get the comment with author info
  const [commentWithAuthor] = await db.select({
    id: projectComments.id,
    content: projectComments.content,
    isInternal: projectComments.isInternal,
    createdAt: projectComments.createdAt,
    updatedAt: projectComments.updatedAt,
    author: {
      id: users.id,
      firstName: users.firstName,
      lastName: users.lastName,
      email: users.email,
    }
  })
  .from(projectComments)
  .leftJoin(users, eq(projectComments.authorId, users.id))
  .where(eq(projectComments.id, comment.id));

  return commentWithAuthor;
}

// Get task files/attachments (SERVER-SIDE)
export async function getTaskFilesServer(taskId: number) {
  const files = await db.select({
    id: projectFiles.id,
    fileName: projectFiles.fileName,
    fileUrl: projectFiles.fileUrl,
    fileSize: projectFiles.fileSize,
    fileType: projectFiles.fileType,
    description: projectFiles.description,
    createdAt: projectFiles.createdAt,
    uploadedBy: {
      id: users.id,
      firstName: users.firstName,
      lastName: users.lastName,
      email: users.email,
    }
  })
  .from(projectFiles)
  .leftJoin(users, eq(projectFiles.uploadedById, users.id))
  .where(eq(projectFiles.taskId, taskId))
  .orderBy(desc(projectFiles.createdAt));

  return files;
}

// Upload task file (SERVER-SIDE)
export async function uploadTaskFileServer(
  taskId: number, 
  projectId: number, 
  uploadedById: number, 
  fileName: string, 
  fileUrl: string, 
  fileSize: number, 
  fileType: string, 
  description?: string
) {
  const [file] = await db.insert(projectFiles)
    .values({
      taskId,
      projectId,
      uploadedById,
      fileName,
      fileUrl,
      fileSize,
      fileType,
      description,
      createdAt: new Date(),
    })
    .returning();

  // Get the file with uploader info
  const [fileWithUploader] = await db.select({
    id: projectFiles.id,
    fileName: projectFiles.fileName,
    fileUrl: projectFiles.fileUrl,
    fileSize: projectFiles.fileSize,
    fileType: projectFiles.fileType,
    description: projectFiles.description,
    createdAt: projectFiles.createdAt,
    uploadedBy: {
      id: users.id,
      firstName: users.firstName,
      lastName: users.lastName,
      email: users.email,
    }
  })
  .from(projectFiles)
  .leftJoin(users, eq(projectFiles.uploadedById, users.id))
  .where(eq(projectFiles.id, file.id));

  return fileWithUploader;
}

// Upload file attached to a comment (SERVER-SIDE)
export async function uploadCommentFileServer(
  commentId: number,
  projectId: number, 
  uploadedById: number, 
  fileName: string, 
  fileUrl: string, 
  fileSize: number, 
  fileType: string, 
  description?: string
) {
  const [file] = await db.insert(projectFiles)
    .values({
      commentId, // Link to comment instead of task
      projectId,
      uploadedById,
      fileName,
      fileUrl,
      fileSize,
      fileType,
      description,
      createdAt: new Date(),
    })
    .returning();

  // Get the file with uploader info
  const [fileWithUploader] = await db.select({
    id: projectFiles.id,
    fileName: projectFiles.fileName,
    fileUrl: projectFiles.fileUrl,
    fileSize: projectFiles.fileSize,
    fileType: projectFiles.fileType,
    description: projectFiles.description,
    createdAt: projectFiles.createdAt,
    uploadedBy: {
      id: users.id,
      firstName: users.firstName,
      lastName: users.lastName,
      email: users.email,
    }
  })
  .from(projectFiles)
  .leftJoin(users, eq(projectFiles.uploadedById, users.id))
  .where(eq(projectFiles.id, file.id));

  return fileWithUploader;
} 