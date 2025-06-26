import { eq, like, or, desc, and } from 'drizzle-orm';
import { db } from './db-server';
import { projects, clients, users, type Project, type NewProject } from './schema';

// Get all projects with optional search and filters
export async function getProjects(search?: string, status?: string, clientId?: number): Promise<(Project & { client?: any, user?: any })[]> {
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
        like(clients.name, `%${search}%`),
        like(clients.company, `%${search}%`)
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
  
  return result.map(row => ({
    ...row.project,
    client: row.client,
    user: row.user,
  }));
}

// Get project by ID with relationships
export async function getProjectById(id: number): Promise<(Project & { client?: any, user?: any }) | null> {
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

  return {
    ...result.project,
    client: result.client,
    user: result.user,
  };
}

// Create new project
export async function createProject(projectData: NewProject): Promise<Project> {
  const [project] = await db.insert(projects)
    .values({
      ...projectData,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();
  
  return project;
}

// Update project
export async function updateProject(id: number, projectData: Partial<NewProject>): Promise<Project | null> {
  const [updatedProject] = await db.update(projects)
    .set({
      ...projectData,
      updatedAt: new Date(),
    })
    .where(eq(projects.id, id))
    .returning();
  
  return updatedProject || null;
}

// Delete project
export async function deleteProject(id: number): Promise<boolean> {
  try {
    await db.delete(projects)
      .where(eq(projects.id, id));
    
    return true;
  } catch (error) {
    console.error('Error deleting project:', error);
    return false;
  }
}

// Get projects by status
export async function getProjectsByStatus(status: string): Promise<Project[]> {
  return await db.select()
    .from(projects)
    .where(eq(projects.status, status))
    .orderBy(desc(projects.createdAt));
}

// Get projects by client
export async function getProjectsByClient(clientId: number): Promise<Project[]> {
  return await db.select()
    .from(projects)
    .where(eq(projects.clientId, clientId))
    .orderBy(desc(projects.createdAt));
}

// Get projects by user
export async function getProjectsByUser(userId: number): Promise<Project[]> {
  return await db.select()
    .from(projects)
    .where(eq(projects.userId, userId))
    .orderBy(desc(projects.createdAt));
}

// Update project progress
export async function updateProjectProgress(id: number, progressPercentage: number): Promise<Project | null> {
  const [updatedProject] = await db.update(projects)
    .set({
      progressPercentage,
      updatedAt: new Date(),
      ...(progressPercentage === 100 ? { completedAt: new Date(), status: 'COMPLETED' } : {}),
    })
    .where(eq(projects.id, id))
    .returning();
  
  return updatedProject || null;
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