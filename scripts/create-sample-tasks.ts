import { db } from '../lib/db-server';
import { tasks, projects, users } from '../lib/schema';

async function createSampleTasks() {
  try {
    console.log('Creating sample tasks...');

    // Get existing projects and users
    const existingProjects = await db.select().from(projects).limit(5);
    const existingUsers = await db.select().from(users).limit(3);

    if (existingProjects.length === 0) {
      console.log('No projects found. Please create some projects first.');
      return;
    }

    if (existingUsers.length === 0) {
      console.log('No users found. Please create some users first.');
      return;
    }

    const sampleTasks = [
      {
        title: 'Design user interface mockups',
        description: 'Create wireframes and mockups for the new dashboard interface',
        projectId: existingProjects[0].id,
        assignedToId: existingUsers[0]?.id,
        priority: 'HIGH',
        status: 'TODO',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
        estimatedHours: 8,
        tags: 'design,ui,mockups',
        order: 0,
      },
      {
        title: 'Implement authentication system',
        description: 'Set up user login, registration, and session management',
        projectId: existingProjects[0].id,
        assignedToId: existingUsers[1]?.id,
        priority: 'URGENT',
        status: 'IN_PROGRESS',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 days from now
        estimatedHours: 12,
        tags: 'backend,auth,security',
        order: 0,
      },
      {
        title: 'Write API documentation',
        description: 'Document all API endpoints with examples and response formats',
        projectId: existingProjects[0].id,
        assignedToId: existingUsers[0]?.id,
        priority: 'MEDIUM',
        status: 'IN_REVIEW',
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 5 days from now
        estimatedHours: 6,
        tags: 'documentation,api',
        order: 0,
      },
      {
        title: 'Set up CI/CD pipeline',
        description: 'Configure automated testing and deployment pipeline',
        projectId: existingProjects[1]?.id || existingProjects[0].id,
        assignedToId: existingUsers[2]?.id || existingUsers[0]?.id,
        priority: 'MEDIUM',
        status: 'DONE',
        dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 days ago
        estimatedHours: 10,
        tags: 'devops,ci,cd,automation',
        order: 0,
        completedAt: new Date(),
      },
      {
        title: 'Database optimization',
        description: 'Optimize database queries and add proper indexing',
        projectId: existingProjects[1]?.id || existingProjects[0].id,
        assignedToId: existingUsers[1]?.id,
        priority: 'LOW',
        status: 'TODO',
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 14 days from now
        estimatedHours: 4,
        tags: 'database,performance,optimization',
        order: 1,
      },
      {
        title: 'Mobile responsive design',
        description: 'Ensure the application works well on mobile devices',
        projectId: existingProjects[0].id,
        assignedToId: existingUsers[0]?.id,
        priority: 'HIGH',
        status: 'IN_PROGRESS',
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 10 days from now
        estimatedHours: 15,
        tags: 'frontend,mobile,responsive',
        order: 1,
      },
      {
        title: 'User testing and feedback',
        description: 'Conduct user testing sessions and gather feedback',
        projectId: existingProjects[0].id,
        priority: 'MEDIUM',
        status: 'TODO',
        dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 21 days from now
        estimatedHours: 8,
        tags: 'testing,ux,feedback',
        order: 2,
      },
      {
        title: 'Security audit',
        description: 'Perform comprehensive security audit and fix vulnerabilities',
        projectId: existingProjects[1]?.id || existingProjects[0].id,
        assignedToId: existingUsers[2]?.id || existingUsers[0]?.id,
        priority: 'URGENT',
        status: 'CANCELLED',
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 day from now
        estimatedHours: 20,
        tags: 'security,audit,vulnerability',
        order: 0,
      },
    ];

    // Insert sample tasks
    for (const task of sampleTasks) {
      await db.insert(tasks).values({
        ...task,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    console.log(`✅ Created ${sampleTasks.length} sample tasks successfully!`);
    console.log('Tasks created with various statuses:');
    console.log('- TODO: 3 tasks');
    console.log('- IN_PROGRESS: 2 tasks');
    console.log('- IN_REVIEW: 1 task');
    console.log('- DONE: 1 task');
    console.log('- CANCELLED: 1 task');

  } catch (error) {
    console.error('❌ Error creating sample tasks:', error);
  }
}

createSampleTasks(); 