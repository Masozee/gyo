import { getUserByEmail } from '../lib/auth';

async function checkUser() {
  try {
    const email = 'nurojilukmansyah@gmail.com';
    console.log(`Checking for user: ${email}`);
    
    const user = await getUserByEmail(email);
    
    if (user) {
      console.log('User found:', {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        isActive: user.isActive,
        createdAt: user.createdAt
      });
    } else {
      console.log('User not found');
    }
  } catch (error) {
    console.error('Error checking user:', error);
  }
}

checkUser();