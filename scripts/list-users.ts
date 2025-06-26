import { db } from '../lib/db-server';
import { users } from '../lib/schema';

async function listUsers() {
  try {
    console.log('Listing all users in database...');
    
    const allUsers = await db.select({
      id: users.id,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      username: users.username,
      isActive: users.isActive,
      createdAt: users.createdAt
    }).from(users);
    
    console.log(`Found ${allUsers.length} users:`);
    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. ID: ${user.id}, Email: ${user.email}, Name: ${user.firstName} ${user.lastName}`);
    });
    
    if (allUsers.length === 0) {
      console.log('No users found in database. You may need to create users first.');
    }
  } catch (error) {
    console.error('Error listing users:', error);
  }
}

listUsers();