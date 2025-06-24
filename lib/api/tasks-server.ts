import { eq, like, or, desc, and } from 'drizzle-orm';
import { db } from '../db';
import { tasks, projects, users, type Task, type NewTask } from '../schema';

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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    .returning();
  
  return task;
}

// Update task (SERVER-SIDE)
export async function updateTaskServer(id: number, taskData: Partial<NewTask>): Promise<Task | null> {
  const [updatedTask] = await db.update(tasks)
    .set({
      ...taskData,
      updatedAt: new Date().toISOString(),
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