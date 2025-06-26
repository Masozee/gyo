import { db } from '../lib/db-server';
import { expenses, projects, users } from '../lib/schema';

async function createSampleExpenses() {
  try {
    // First, let's check if we have any projects and users
    const allProjects = await db.select().from(projects).limit(1);
    const allUsers = await db.select().from(users).limit(1);

    if (allProjects.length === 0) {
      console.log('No projects found. Please create a project first.');
      return;
    }

    if (allUsers.length === 0) {
      console.log('No users found. Please create a user first.');
      return;
    }

    const project = allProjects[0];
    const user = allUsers[0];

    console.log(`Creating sample expenses for project: ${project.title} and user: ${user.email}`);

    // Clear existing expenses
    await db.delete(expenses);
    console.log('Cleared existing expenses');

    // Create sample expenses
    const sampleExpenses = [
      {
        projectId: project.id,
        userId: user.id,
        date: '2024-01-15',
        title: 'Travel to client meeting',
        category: 'TRAVEL',
        amount: 150.00,
        currency: 'USD',
        description: 'Flight tickets for client presentation',
        billable: true,
        reimbursed: false,
      },
      {
        projectId: project.id,
        userId: user.id,
        date: '2024-01-20',
        title: 'Software license',
        category: 'SOFTWARE',
        amount: 99.99,
        currency: 'USD',
        description: 'Adobe Creative Suite monthly subscription',
        billable: true,
        reimbursed: false,
      },
      {
        projectId: project.id,
        userId: user.id,
        date: '2024-01-25',
        title: 'Office supplies',
        category: 'MATERIALS',
        amount: 45.50,
        currency: 'USD',
        description: 'Notebooks and pens for project planning',
        billable: false,
        reimbursed: true,
      },
      {
        projectId: project.id,
        userId: user.id,
        date: '2024-02-01',
        title: 'Client lunch meeting',
        category: 'OTHER',
        amount: 67.80,
        currency: 'USD',
        description: 'Business lunch with client stakeholders',
        billable: true,
        reimbursed: false,
      },
      {
        projectId: project.id,
        userId: user.id,
        date: '2024-02-05',
        title: 'Equipment rental',
        category: 'EQUIPMENT',
        amount: 200.00,
        currency: 'USD',
        description: 'Camera equipment for project documentation',
        billable: true,
        reimbursed: false,
        taxAmount: 20.00,
      },
    ];

    // Insert sample expenses
    const createdExpenses = await db.insert(expenses).values(sampleExpenses).returning();

    console.log(`Created ${createdExpenses.length} sample expenses:`);
    createdExpenses.forEach((expense, index) => {
      console.log(`${index + 1}. ${expense.title} - $${expense.amount} (${expense.category})`);
    });

    console.log('\n✅ Sample expenses created successfully!');
    
  } catch (error) {
    console.error('Error creating sample expenses:', error);
    process.exit(1);
  }
}

createSampleExpenses(); 