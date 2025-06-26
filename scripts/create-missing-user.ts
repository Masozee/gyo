import { createUser } from '../lib/auth';

async function createMissingUser() {
  try {
    const user = await createUser({
      email: 'nurojilukmansyah@gmail.com',
      password: 'password123',
      firstName: 'Nuroji',
      lastName: 'Lukmansyah',
      username: 'nurojilukmansyah'
    });
    
    console.log('User created successfully:', {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username
    });
  } catch (error) {
    console.error('Error creating user:', error);
  }
}

createMissingUser();