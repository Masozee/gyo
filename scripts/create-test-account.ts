import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || 'https://vvzhwzzotfqbfvivjgyv.supabase.co'
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2emh3enpvdGZxYmZ2aXZqZ3l2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NDI1NDgsImV4cCI6MjA2NjQxODU0OH0.YdPn4BYp5Rt5E'

const supabase = createClient(supabaseUrl, supabaseKey)

async function createTestAccount() {
  try {
    console.log('🔍 Creating test account...')

    const testEmail = 'test@example.com'
    const testPassword = 'test123456'

    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          firstName: 'Test',
          lastName: 'User',
          username: 'testuser'
        }
      }
    })

    if (error) {
      if (error.message.includes('already registered')) {
        console.log('✅ Test account already exists!')
        console.log('📧 Email:', testEmail)
        console.log('🔑 Password:', testPassword)
        return
      }
      throw error
    }

    console.log('✅ Test account created successfully!')
    console.log('📧 Email:', testEmail)
    console.log('🔑 Password:', testPassword)
    console.log('👤 User ID:', data.user?.id)
    
    if (data.session) {
      console.log('🎫 Session created automatically')
    } else {
      console.log('📬 Please check your email to confirm the account')
    }

  } catch (error) {
    console.error('❌ Error creating test account:', error)
    throw error
  }
}

createTestAccount()
  .then(() => {
    console.log('🎉 Test account setup completed!')
    console.log('')
    console.log('📝 You can now login with:')
    console.log('   Email: test@example.com')
    console.log('   Password: test123456')
    console.log('')
    console.log('🌐 Go to: http://localhost:3000/login')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Setup failed:', error)
    process.exit(1)
  }) 