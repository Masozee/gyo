import { eq, like, or, desc, and, count } from 'drizzle-orm';
import { db } from '../db';
import { projects, clients, users, tasks, type Project, type NewProject } from '../schema';

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
  taskProgress?: number; // Auto-calculated progress based on completed tasks
}

// Helper function to calculate task-based progress for a project
async function calculateTaskProgress(projectId: number): Promise<number> {
  const [totalTasksResult] = await db
    .select({ count: count() })
    .from(tasks)
    .where(eq(tasks.projectId, projectId));

  const [completedTasksResult] = await db
    .select({ count: count() })
    .from(tasks)
    .where(and(eq(tasks.projectId, projectId), eq(tasks.status, 'DONE')));

  const totalTasks = totalTasksResult.count;
  const completedTasks = completedTasksResult.count;

  if (totalTasks === 0) return 0;
  return Math.round((completedTasks / totalTasks) * 100);
}

// Get all projects with optional filters (SERVER-SIDE)
export async function getProjectsServer(search?: string, status?: string, clientId?: number): Promise<ProjectWithRelations[]> {
  const baseQuery = db.select({
    project: projects,
    client: clients,
    user: users,
  })
  .from(projects)
  .leftJoin(clients, eq(projects.clientId, clients.id))
  .leftJoin(users, eq(projects.userId, users.id));

  const conditions = [];

  if (search) {
    conditions.push(
      or(
        like(projects.title, `%${search}%`),
        like(projects.description, `%${search}%`),
        like(clients.name, `%${search}%`)
      )
    );
  }

  if (status) {
    conditions.push(eq(projects.status, status));
  }

  if (clientId) {
    conditions.push(eq(projects.clientId, clientId));
  }

  const result = conditions.length > 0 
    ? await baseQuery.where(and(...conditions)).orderBy(desc(projects.createdAt))
    : await baseQuery.orderBy(desc(projects.createdAt));
  
  // Calculate task-based progress for each project
  const projectsWithProgress = await Promise.all(
    result.map(async (row) => {
      const taskProgress = await calculateTaskProgress(row.project.id);
      return {
        ...row.project,
        client: row.client || undefined,
        user: row.user || undefined,
        taskProgress, // Auto-calculated progress based on completed tasks
        progressPercentage: taskProgress, // Override the manual progress with task-based progress
      };
    })
  );
  
  return projectsWithProgress as ProjectWithRelations[];
}

// Get project by ID with relationships (SERVER-SIDE)
export async function getProjectByIdServer(id: number): Promise<ProjectWithRelations | null> {
  const [result] = await db.select({
    project: projects,
    client: clients,
    user: users,
  })
  .from(projects)
  .leftJoin(clients, eq(projects.clientId, clients.id))
  .leftJoin(users, eq(projects.userId, users.id))
  .where(eq(projects.id, id))
  .limit(1);

  if (!result) return null;

  // Calculate task-based progress
  const taskProgress = await calculateTaskProgress(id);

  return {
    ...result.project,
    client: result.client || undefined,
    user: result.user || undefined,
    taskProgress, // Auto-calculated progress based on completed tasks
    progressPercentage: taskProgress, // Override the manual progress with task-based progress
  } as ProjectWithRelations;
}

// Create new project (SERVER-SIDE)
export async function createProjectServer(projectData: NewProject): Promise<Project> {
  const [project] = await db.insert(projects)
    .values({
      ...projectData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    .returning();
  
  return project;
}

// Update project (SERVER-SIDE)
export async function updateProjectServer(id: number, projectData: Partial<NewProject>): Promise<Project | null> {
  const [updatedProject] = await db.update(projects)
    .set({
      ...projectData,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(projects.id, id))
    .returning();
  
  return updatedProject || null;
}

// Update project progress (SERVER-SIDE)
export async function updateProjectProgressServer(id: number, progressPercentage: number): Promise<Project | null> {
  const [updatedProject] = await db.update(projects)
    .set({
      progressPercentage,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(projects.id, id))
    .returning();
  
  return updatedProject || null;
}

// Delete project (SERVER-SIDE)
export async function deleteProjectServer(id: number): Promise<boolean> {
  try {
    await db.delete(projects)
      .where(eq(projects.id, id));
    
    return true;
  } catch (error) {
    console.error('Error deleting project:', error);
    return false;
  }
}

// Get project statistics (SERVER-SIDE)
export async function getProjectStatsServer(): Promise<{
  total: number;
  planning: number;
  inProgress: number;
  onHold: number;
  completed: number;
  cancelled: number;
}> {
  const allProjects = await db.select().from(projects);
  
  return {
    total: allProjects.length,
    planning: allProjects.filter(p => p.status === 'PLANNING').length,
    inProgress: allProjects.filter(p => p.status === 'IN_PROGRESS').length,
    onHold: allProjects.filter(p => p.status === 'ON_HOLD').length,
    completed: allProjects.filter(p => p.status === 'COMPLETED').length,
    cancelled: allProjects.filter(p => p.status === 'CANCELLED').length,
  };
} 