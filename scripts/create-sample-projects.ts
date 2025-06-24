import { db } from '../lib/db';
import { projects, clients, users } from '../lib/schema';
import { eq } from 'drizzle-orm';

async function createSampleProjects() {
  console.log('Creating sample projects...');

  try {
    // Get existing clients and users
    const allClients = await db.select().from(clients).limit(10);
    const allUsers = await db.select().from(users).limit(1);

    if (allClients.length === 0) {
      console.log('Please create clients first before running this script');
      return;
    }

    if (allUsers.length === 0) {
      console.log('Please create a user first before running this script');
      return;
    }

    const userId = allUsers[0].id;

    // Sample project data
    const sampleProjects = [
      {
        title: 'E-commerce Website Development',
        description: 'Complete e-commerce platform with payment integration, product catalog, and admin dashboard.',
        clientId: allClients[0]?.id,
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        startDate: '2025-01-01',
        deadline: '2025-03-15',
        projectValue: 25000,
        progressPercentage: 45,
      },
      {
        title: 'Mobile App Development',
        description: 'Cross-platform mobile application for iOS and Android with real-time messaging and push notifications.',
        clientId: allClients[1]?.id,
        status: 'PLANNING',
        priority: 'MEDIUM',
        startDate: '2025-02-01',
        deadline: '2025-05-01',
        projectValue: 35000,
        progressPercentage: 15,
      },
      {
        title: 'Brand Identity & Website',
        description: 'Complete brand identity design including logo, business cards, and marketing website.',
        clientId: allClients[2]?.id,
        status: 'COMPLETED',
        priority: 'MEDIUM',
        startDate: '2024-11-01',
        deadline: '2024-12-31',
        projectValue: 12000,
        progressPercentage: 100,
        completedAt: '2024-12-30',
      },
      {
        title: 'SaaS Platform MVP',
        description: 'Minimum viable product for a SaaS platform with user authentication, subscription management, and analytics.',
        clientId: allClients[3]?.id,
        status: 'IN_PROGRESS',
        priority: 'URGENT',
        startDate: '2025-01-15',
        deadline: '2025-04-01',
        projectValue: 45000,
        progressPercentage: 30,
      },
      {
        title: 'Marketing Campaign Website',
        description: 'Landing page and campaign website for product launch with A/B testing capabilities.',
        clientId: allClients[4]?.id,
        status: 'ON_HOLD',
        priority: 'LOW',
        startDate: '2025-01-20',
        deadline: '2025-02-28',
        projectValue: 8000,
        progressPercentage: 10,
      },
      {
        title: 'Database Migration & Optimization',
        description: 'Legacy system migration to cloud infrastructure with performance optimization.',
        clientId: allClients[5]?.id || allClients[0]?.id,
        status: 'PLANNING',
        priority: 'HIGH',
        startDate: '2025-03-01',
        deadline: '2025-05-15',
        projectValue: 18000,
        progressPercentage: 5,
      },
      {
        title: 'Content Management System',
        description: 'Custom CMS development with multi-user support and advanced content editing features.',
        clientId: allClients[6]?.id || allClients[1]?.id,
        status: 'IN_PROGRESS',
        priority: 'MEDIUM',
        startDate: '2024-12-15',
        deadline: '2025-02-28',
        projectValue: 22000,
        progressPercentage: 65,
      },
      {
        title: 'API Integration Project',
        description: 'Third-party API integrations for CRM, payment processing, and analytics platforms.',
        clientId: allClients[7]?.id || allClients[2]?.id,
        status: 'COMPLETED',
        priority: 'MEDIUM',
        startDate: '2024-10-01',
        deadline: '2024-11-30',
        projectValue: 15000,
        progressPercentage: 100,
        completedAt: '2024-11-28',
      },
    ];

    for (const projectData of sampleProjects) {
      // Create project
      const [project] = await db.insert(projects).values({
        title: projectData.title,
        description: projectData.description,
        clientId: projectData.clientId,
        userId: userId,
        status: projectData.status,
        priority: projectData.priority,
        startDate: projectData.startDate,
        deadline: projectData.deadline,
        completedAt: projectData.completedAt || null,
        projectValue: projectData.projectValue,
        currency: 'USD',
        progressPercentage: projectData.progressPercentage,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }).returning();

      console.log(`Created project: ${project.title}`);
    }

    console.log('Sample projects created successfully!');
  } catch (error) {
    console.error('Error creating sample projects:', error);
  }
}

// Run the script
if (require.main === module) {
  createSampleProjects().then(() => {
    console.log('Script completed');
    process.exit(0);
  }).catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
}

export { createSampleProjects }; 