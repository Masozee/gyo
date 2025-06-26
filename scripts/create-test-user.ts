import { createUser } from '../lib/auth';

async function createTestUser() {
  try {
    const user = await createUser({
      email: 'test@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
      username: 'testuser'
    });
    
    console.log('Test user created:', user);
  } catch (error) {
    console.error('Error creating test user:', error);
  }
}

createTestUser();