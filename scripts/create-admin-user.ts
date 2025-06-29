import { db } from '../lib/db-server'
import { users } from '../lib/schema'
import { eq } from 'drizzle-orm'

async function createAdminUser() {
  try {
    const email = 'nurojilukmansyah@gmail.com'
    const password = 'B6585esp__'
    
    console.log('🔍 Checking if user exists...')
    
    // Check if user already exists
    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1)
    
    if (existingUser.length > 0) {
      console.log('✅ User already exists!')
      console.log('📧 Email:', existingUser[0].email)
      console.log('🆔 ID:', existingUser[0].id)
      console.log('📅 Created:', existingUser[0].createdAt)
      return existingUser[0]
    }
    
    console.log('👤 Creating new admin user...')
    
    // Simple password hashing (same as in lib/auth.ts)
    const encoder = new TextEncoder()
    const data = encoder.encode(password)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashedPassword = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    
    // Create user
    const [user] = await db.insert(users).values({
      email,
      password: hashedPassword,
      firstName: 'Nuroji',
      lastName: 'Lukmansyah',
      username: 'nurojilukmansyah',
      isActive: true,
      emailVerified: true,
    }).returning()
    
    console.log('✅ Admin user created successfully!')
    console.log('📧 Email:', user.email)
    console.log('🆔 ID:', user.id)
    console.log('👤 Name:', user.firstName, user.lastName)
    console.log('🔐 Password: B6585esp__')
    
    return user
  } catch (error) {
    console.error('❌ Error creating admin user:', error)
    throw error
  }
}

if (require.main === module) {
  createAdminUser()
    .then((user) => {
      console.log('\n🎉 You can now login with:')
      console.log('📧 Email: nurojilukmansyah@gmail.com')
      console.log('🔐 Password: B6585esp__')
      console.log('🌐 URL: http://localhost:3001/login')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Failed to create admin user:', error)
      process.exit(1)
    })
}

export { createAdminUser }