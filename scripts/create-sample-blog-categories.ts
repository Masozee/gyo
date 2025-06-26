import { db } from '../lib/db-server';
import { blogCategories } from '../lib/schema';

const sampleCategories = [
  {
    name: 'Technology',
    slug: 'technology',
    description: 'Latest tech trends and insights',
    color: '#3b82f6',
    createdAt: new Date().toISOString(),
  },
  {
    name: 'Design',
    slug: 'design',
    description: 'UI/UX design tips and inspiration',
    color: '#8b5cf6',
    createdAt: new Date().toISOString(),
  },
  {
    name: 'Business',
    slug: 'business',
    description: 'Business strategies and insights',
    color: '#10b981',
    createdAt: new Date().toISOString(),
  },
  {
    name: 'Development',
    slug: 'development',
    description: 'Programming tutorials and best practices',
    color: '#f59e0b',
    createdAt: new Date().toISOString(),
  },
  {
    name: 'Tutorials',
    slug: 'tutorials',
    description: 'Step-by-step guides and how-tos',
    color: '#ef4444',
    createdAt: new Date().toISOString(),
  },
];

async function createSampleBlogCategories() {
  try {
    console.log('Creating sample blog categories...');
    
    for (const category of sampleCategories) {
      await db.insert(blogCategories).values(category);
      console.log(`✓ Created category: ${category.name}`);
    }
    
    console.log('✅ Sample blog categories created successfully!');
  } catch (error) {
    console.error('❌ Error creating sample blog categories:', error);
  }
}

// Run the script if called directly
if (require.main === module) {
  createSampleBlogCategories().then(() => process.exit(0));
}

export { createSampleBlogCategories }; 