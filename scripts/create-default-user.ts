import { db } from '../lib/db-server'
import { users, type NewUser } from '../lib/schema'
import { eq } from 'drizzle-orm'

async function createDefaultUser() {
  try {
    console.log('🔍 Checking for default user...')

    // Check if user with ID 1 exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.id, 1))
      .limit(1)

    if (existingUser.length > 0) {
      console.log('✅ Default user already exists:', existingUser[0].email)
      return existingUser[0]
    }

    console.log('👤 Creating default user...')

    // Create default user
    const defaultUser: NewUser = {
      email: 'admin@example.com',
      password: 'hashed_password_placeholder', // In real app, this would be properly hashed
      firstName: 'Admin',
      lastName: 'User',
      username: 'admin',
      isActive: true,
      emailVerified: true,
    }

    const [newUser] = await db.insert(users).values(defaultUser).returning()

    console.log('✅ Default user created successfully:', newUser.email)
    console.log('📋 User ID:', newUser.id)

    return newUser
  } catch (error) {
    console.error('❌ Error creating default user:', error)
    throw error
  }
}

createDefaultUser()
  .then((user) => {
    console.log('🎉 Default user setup completed!')
    console.log('👤 User:', user.email, '(ID:', user.id, ')')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Setup failed:', error)
    process.exit(1)
  }) 