import { db } from '@/lib/db-server';
import { tasks, projects, users, Task, NewTask } from '@/lib/schema';
import { eq, and, desc, asc } from 'drizzle-orm';

// Get all tasks with optional filters
export async function getTasks(
  projectId?: number,
  status?: string,
  assignedToId?: number
): Promise<Task[]> {
  const conditions = [];
  if (projectId) conditions.push(eq(tasks.projectId, projectId));
  if (status) conditions.push(eq(tasks.status, status));
  if (assignedToId) conditions.push(eq(tasks.assignedToId, assignedToId));

  if (conditions.length > 0) {
    return await db.select()
      .from(tasks)
      .where(and(...conditions))
      .orderBy(asc(tasks.order), desc(tasks.createdAt));
  }

  return await db.select()
    .from(tasks)
    .orderBy(asc(tasks.order), desc(tasks.createdAt));
}

// Get task by ID
export async function getTaskById(id: number): Promise<Task | null> {
  const [task] = await db.select()
    .from(tasks)
    .where(eq(tasks.id, id))
    .limit(1);
  
  return task || null;
}

// Create new task
export async function createTask(taskData: NewTask): Promise<Task> {
  const [newTask] = await db.insert(tasks)
    .values({
      ...taskData,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();
  
  return newTask;
}

// Update task
export async function updateTask(id: number, taskData: Partial<NewTask>): Promise<Task | null> {
  const [updatedTask] = await db.update(tasks)
    .set({
      ...taskData,
      updatedAt: new Date(),
      ...(taskData.status === 'DONE' ? { completedAt: new Date() } : {}),
    })
    .where(eq(tasks.id, id))
    .returning();
  
  return updatedTask || null;
}

// Delete task
export async function deleteTask(id: number): Promise<boolean> {
  try {
    await db.delete(tasks)
      .where(eq(tasks.id, id));
    
    return true;
  } catch (error) {
    console.error('Delete task error:', error);
    return false;
  }
}

// Update task status (for drag and drop)
export async function updateTaskStatus(id: number, status: string, order?: number): Promise<Task | null> {
  const updateData: Partial<NewTask> = {
    status,
    updatedAt: new Date(),
  };

  if (order !== undefined) {
    updateData.order = order;
  }

  if (status === 'DONE') {
    updateData.completedAt = new Date();
  }

  const [updatedTask] = await db.update(tasks)
    .set(updateData)
    .where(eq(tasks.id, id))
    .returning();
  
  return updatedTask || null;
}

// Get tasks by project ID grouped by status
export async function getTasksByProject(projectId: number): Promise<{
  TODO: Task[];
  IN_PROGRESS: Task[];
  IN_REVIEW: Task[];
  DONE: Task[];
  CANCELLED: Task[];
}> {
  const allTasks = await db.select()
    .from(tasks)
    .where(eq(tasks.projectId, projectId))
    .orderBy(asc(tasks.order), desc(tasks.createdAt));

  return {
    TODO: allTasks.filter(task => task.status === 'TODO'),
    IN_PROGRESS: allTasks.filter(task => task.status === 'IN_PROGRESS'),
    IN_REVIEW: allTasks.filter(task => task.status === 'IN_REVIEW'),
    DONE: allTasks.filter(task => task.status === 'DONE'),
    CANCELLED: allTasks.filter(task => task.status === 'CANCELLED'),
  };
}

// Reorder tasks within a status
export async function reorderTasks(taskIds: number[]): Promise<void> {
  const promises = taskIds.map((taskId, index) =>
    db.update(tasks)
      .set({ 
        order: index,
        updatedAt: new Date(),
      })
      .where(eq(tasks.id, taskId))
  );

  await Promise.all(promises);
} 