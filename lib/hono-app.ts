import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { HTTPException } from 'hono/http-exception'
import { createClient } from '@supabase/supabase-js'



// Import server-side functions
import { getInvoicesServer, getInvoiceByIdServer, createInvoiceServer, updateInvoiceServer, deleteInvoiceServer } from './api/invoices-server'
import { 
  createShortenedUrl, 
  getShortenedUrls, 
  deleteShortenedUrl, 
  getUrlAnalytics,
  createQrCode, 
  getQrCodes, 
  deleteQrCode, 
  createSigningRequest, 
  getSigningRequests,
  getSigningRequestByToken,
  signDocument,
  handleUrlRedirect,
  getYouTubeVideoInfo,
  downloadYouTubeVideo,
  getYouTubeStreamInfo
} from './api/tools-server'
import { getClientsServer, getActiveClientsServer, getClientByIdServer, createClientServer, updateClientServer, deleteClientServer, toggleClientStatusServer } from './api/clients-server'
import { getProjectsServer, getProjectByIdServer, createProjectServer, updateProjectServer, deleteProjectServer, updateProjectProgressServer, getProjectStatsServer } from './api/projects-server'
import { getTasksServer, getTaskByIdServer, createTaskServer, updateTaskServer, deleteTaskServer, getTaskCommentsServer, createTaskCommentServer, getTaskFilesServer, uploadTaskFileServer, uploadCommentFileServer } from './api/tasks-server'
import { getExpensesServer, getExpenseByIdServer, createExpenseServer, updateExpenseServer, deleteExpenseServer } from './api/expenses-server'
import { getDocumentsServer, getDocumentByIdServer, createDocumentServer, updateDocumentServer, deleteDocumentServer } from './api/documents-server'
import { getPagesServer, getPageBySlugServer, createPageServer, updatePageServer, deletePageServer } from './api/cms-server'
import { getBlogPostsServer, getBlogPostByIdServer, getBlogPostBySlugServer, createBlogPostServer, updateBlogPostServer, deleteBlogPostServer, getBlogCategoriesServer, createBlogCategoryServer, getPortfolioItemsServer, getPortfolioItemByIdServer, createPortfolioItemServer, updatePortfolioItemServer, deletePortfolioItemServer } from './api/cms-server'
import { getEventsServer, getEventByIdServer, createEventServer, updateEventServer, deleteEventServer, getEventsByDateRangeServer, getUpcomingEventsServer, getEventsByStatusServer } from './api/events-server'
import { createChatConversation, getChatConversations, getChatConversationWithMessages, updateChatConversation, deleteChatConversation, addChatMessage, generateConversationTitle, getConversationStats } from './api/chat-server'

// Import auth functions (for user management, not authentication)
import { 
  getUserById, 
  getUserByEmail,
  updateUser 
} from './auth'

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || 'https://vvzhwzzotfqbfvivjgyv.supabase.co'
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2emh3enpvdGZxYmZ2aXZqZ3l2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NDI1NDgsImV4cCI6MjA2NjQxODU0OH0.YdPn4BYp5Rt5ETeP7MeWWySPDuPPgMWNFLN4X8qJ8So'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Authentication helper function
async function getAuthenticatedUser(c: any) {
  const authHeader = c.req.header('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  
  const token = authHeader.split(' ')[1]
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token)
    if (error || !user) {
      return null
    }
    return user
  } catch (error) {
    return null
  }
}

// Development mode authentication bypass
function isDevelopmentMode() {
  return process.env.NODE_ENV === 'development'
}

async function getAuthenticatedUserOrBypass(c: any) {
  // In development mode, allow bypass if no auth header is present
  if (isDevelopmentMode()) {
    const authHeader = c.req.header('Authorization')
    if (!authHeader) {
      console.log('🔓 Development mode: Bypassing authentication')
      return { id: 'dev-user', email: 'dev@localhost' }
    }
  }
  
  return await getAuthenticatedUser(c)
}

// Use a default user ID for database operations (like tasks)
const DEFAULT_USER_ID = 1

const app = new Hono()

// Middleware
app.use('*', logger())
app.use('*', cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
}))

// Health check
app.get('/', (c) => {
  return c.json({ 
    message: 'Hono API is running!',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  })
})

// AUTHENTICATION ROUTES
app.post('/auth/register', async (c) => {
  try {
    const userData = await c.req.json()
    
    // Validate required fields
    if (!userData.email || !userData.password) {
      throw new HTTPException(400, { message: 'Email and password are required' })
    }
    
    // Use Supabase authentication
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          firstName: userData.firstName,
          lastName: userData.lastName,
          username: userData.username
        }
      }
    })
    
    if (error) {
      throw new HTTPException(400, { message: error.message })
    }
    
    return c.json({ 
      message: 'User created successfully',
      user: {
        id: data.user?.id,
        email: data.user?.email,
        emailVerified: data.user?.email_confirmed_at ? true : false,
        createdAt: data.user?.created_at,
        updatedAt: data.user?.updated_at
      },
      session: data.session ? {
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
        expiresAt: data.session.expires_at
      } : null
    }, 201)
  } catch (error: any) {
    console.error('Registration error:', error)
    if (error instanceof HTTPException) throw error
    throw new HTTPException(500, { message: 'Failed to create user' })
  }
})

app.post('/auth/login', async (c) => {
  try {
    const { email, password } = await c.req.json()
    
    if (!email || !password) {
      throw new HTTPException(400, { message: 'Email and password are required' })
    }
    
    // Use Supabase authentication
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) {
      throw new HTTPException(401, { message: 'Invalid email or password' })
    }
    
    return c.json({ 
      message: 'Login successful',
      user: {
        id: data.user.id,
        email: data.user.email,
        emailVerified: data.user.email_confirmed_at ? true : false,
        createdAt: data.user.created_at,
        updatedAt: data.user.updated_at
      },
      session: {
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
        expiresAt: data.session.expires_at
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    if (error instanceof HTTPException) throw error
    throw new HTTPException(500, { message: 'Failed to authenticate user' })
  }
})

// USER ROUTES
app.get('/users/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'))
    
    if (isNaN(id)) {
      throw new HTTPException(400, { message: 'Invalid user ID' })
    }
    
    const user = await getUserById(id)
    
    if (!user) {
      throw new HTTPException(404, { message: 'User not found' })
    }
    
    // Remove password from response
    const { password, ...userWithoutPassword } = user
    
    return c.json({ user: userWithoutPassword })
  } catch (error) {
    console.error('Error fetching user:', error)
    if (error instanceof HTTPException) throw error
    throw new HTTPException(500, { message: 'Failed to fetch user' })
  }
})

app.put('/users/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'))
    const userData = await c.req.json()
    
    if (isNaN(id)) {
      throw new HTTPException(400, { message: 'Invalid user ID' })
    }
    
    // Remove password from update data for security
    const { password, ...updateData } = userData
    
    const updatedUser = await updateUser(id, updateData)
    
    if (!updatedUser) {
      throw new HTTPException(404, { message: 'User not found' })
    }
    
    // Remove password from response
    const { password: _, ...userWithoutPassword } = updatedUser
    
    return c.json({ 
      message: 'User updated successfully',
      user: userWithoutPassword 
    })
  } catch (error) {
    console.error('Error updating user:', error)
    if (error instanceof HTTPException) throw error
    throw new HTTPException(500, { message: 'Failed to update user' })
  }
})

// Get user by email
app.get('/users/email/:email', async (c) => {
  try {
    const email = c.req.param('email')
    
    if (!email) {
      throw new HTTPException(400, { message: 'Email is required' })
    }
    
    const user = await getUserByEmail(email)
    
    if (!user) {
      throw new HTTPException(404, { message: 'User not found' })
    }
    
    // Remove password from response
    const { password, ...userWithoutPassword } = user
    
    return c.json({ user: userWithoutPassword })
  } catch (error) {
    console.error('Error fetching user by email:', error)
    if (error instanceof HTTPException) throw error
    throw new HTTPException(500, { message: 'Failed to fetch user by email' })
  }
})

// PROJECTS ROUTES
app.get('/projects', async (c) => {
  try {
    const search = c.req.query('search')
    const status = c.req.query('status')
    const clientId = c.req.query('clientId') ? parseInt(c.req.query('clientId')!) : undefined

    const projects = await getProjectsServer(search, status, clientId)
    return c.json({ projects })
  } catch (error) {
    console.error('Error fetching projects:', error)
    throw new HTTPException(500, { message: 'Failed to fetch projects' })
  }
})

app.get('/projects/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'))
    
    if (isNaN(id)) {
      throw new HTTPException(400, { message: 'Invalid project ID' })
    }

    const project = await getProjectByIdServer(id)
    
    if (!project) {
      throw new HTTPException(404, { message: 'Project not found' })
    }
    
    return c.json(project)
  } catch (error) {
    console.error('Error fetching project:', error)
    if (error instanceof HTTPException) throw error
    throw new HTTPException(500, { message: 'Failed to fetch project' })
  }
})

app.post('/projects', async (c) => {
  try {
    const projectData = await c.req.json()
    const project = await createProjectServer(projectData)
    return c.json(project, 201)
  } catch (error) {
    console.error('Error creating project:', error)
    throw new HTTPException(500, { message: 'Failed to create project' })
  }
})

app.put('/projects/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'))
    const projectData = await c.req.json()
    
    if (isNaN(id)) {
      throw new HTTPException(400, { message: 'Invalid project ID' })
    }

    const project = await updateProjectServer(id, projectData)
    return c.json(project)
  } catch (error) {
    console.error('Error updating project:', error)
    throw new HTTPException(500, { message: 'Failed to update project' })
  }
})

app.delete('/projects/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'))
    
    if (isNaN(id)) {
      throw new HTTPException(400, { message: 'Invalid project ID' })
    }

    await deleteProjectServer(id)
    return c.json({ message: 'Project deleted successfully' })
  } catch (error) {
    console.error('Error deleting project:', error)
    throw new HTTPException(500, { message: 'Failed to delete project' })
  }
})

app.patch('/projects/:id/progress', async (c) => {
  try {
    const id = parseInt(c.req.param('id'))
    const { progressPercentage } = await c.req.json()
    
    if (isNaN(id)) {
      throw new HTTPException(400, { message: 'Invalid project ID' })
    }

    const project = await updateProjectProgressServer(id, progressPercentage)
    return c.json(project)
  } catch (error) {
    console.error('Error updating project progress:', error)
    throw new HTTPException(500, { message: 'Failed to update project progress' })
  }
})

app.get('/projects/stats', async (c) => {
  try {
    const stats = await getProjectStatsServer()
    return c.json(stats)
  } catch (error) {
    console.error('Error fetching project stats:', error)
    throw new HTTPException(500, { message: 'Failed to fetch project stats' })
  }
})

// TASKS ROUTES
app.get('/tasks', async (c) => {
  try {
    const projectId = c.req.query('projectId') ? parseInt(c.req.query('projectId')!) : undefined
    const status = c.req.query('status')
    const assignedToId = c.req.query('assignedToId') ? parseInt(c.req.query('assignedToId')!) : undefined

    const tasks = await getTasksServer(projectId, status, assignedToId)
    return c.json(tasks)
  } catch (error) {
    console.error('Error fetching tasks:', error)
    throw new HTTPException(500, { message: 'Failed to fetch tasks' })
  }
})

app.get('/tasks/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'))
    
    if (isNaN(id)) {
      throw new HTTPException(400, { message: 'Invalid task ID' })
    }

    const task = await getTaskByIdServer(id)
    
    if (!task) {
      throw new HTTPException(404, { message: 'Task not found' })
    }
    
    return c.json(task)
  } catch (error) {
    console.error('Error fetching task:', error)
    if (error instanceof HTTPException) throw error
    throw new HTTPException(500, { message: 'Failed to fetch task' })
  }
})

app.post('/tasks', async (c) => {
  try {
    const taskData = await c.req.json()
    const task = await createTaskServer(taskData)
    return c.json(task, 201)
  } catch (error) {
    console.error('Error creating task:', error)
    throw new HTTPException(500, { message: 'Failed to create task' })
  }
})

app.put('/tasks/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'))
    const taskData = await c.req.json()
    
    if (isNaN(id)) {
      throw new HTTPException(400, { message: 'Invalid task ID' })
    }

    const task = await updateTaskServer(id, taskData)
    return c.json(task)
  } catch (error) {
    console.error('Error updating task:', error)
    throw new HTTPException(500, { message: 'Failed to update task' })
  }
})

app.delete('/tasks/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'))
    
    if (isNaN(id)) {
      throw new HTTPException(400, { message: 'Invalid task ID' })
    }

    await deleteTaskServer(id)
    return c.json({ message: 'Task deleted successfully' })
  } catch (error) {
    console.error('Error deleting task:', error)
    throw new HTTPException(500, { message: 'Failed to delete task' })
  }
})

// TASK COMMENTS ROUTES
app.get('/tasks/:id/comments', async (c) => {
  try {
    const taskId = parseInt(c.req.param('id'))
    
    if (isNaN(taskId)) {
      throw new HTTPException(400, { message: 'Invalid task ID' })
    }

    const comments = await getTaskCommentsServer(taskId)
    return c.json(comments)
  } catch (error) {
    console.error('Error fetching task comments:', error)
    throw new HTTPException(500, { message: 'Failed to fetch task comments' })
  }
})

app.post('/tasks/:id/comments', async (c) => {
  try {
    const taskId = parseInt(c.req.param('id'))
    const { content, authorId, isInternal = false } = await c.req.json()
    
    if (isNaN(taskId)) {
      throw new HTTPException(400, { message: 'Invalid task ID' })
    }

    if (!content || !authorId) {
      throw new HTTPException(400, { message: 'Content and author ID are required' })
    }

    const comment = await createTaskCommentServer(taskId, authorId, content, isInternal)
    return c.json(comment, 201)
  } catch (error) {
    console.error('Error creating task comment:', error)
    throw new HTTPException(500, { message: 'Failed to create task comment' })
  }
})

// TASK FILES ROUTES
app.get('/tasks/:id/files', async (c) => {
  try {
    const taskId = parseInt(c.req.param('id'))
    
    if (isNaN(taskId)) {
      throw new HTTPException(400, { message: 'Invalid task ID' })
    }

    const files = await getTaskFilesServer(taskId)
    return c.json(files)
  } catch (error) {
    console.error('Error fetching task files:', error)
    throw new HTTPException(500, { message: 'Failed to fetch task files' })
  }
})

app.post('/tasks/:id/files', async (c) => {
  try {
    const taskId = parseInt(c.req.param('id'))
    const { projectId, uploadedById, fileName, fileUrl, fileSize, fileType, description } = await c.req.json()
    
    if (isNaN(taskId)) {
      throw new HTTPException(400, { message: 'Invalid task ID' })
    }

    if (!projectId || !uploadedById || !fileName || !fileUrl) {
      throw new HTTPException(400, { message: 'Missing required fields' })
    }

    const file = await uploadTaskFileServer(taskId, projectId, uploadedById, fileName, fileUrl, fileSize, fileType, description)
    return c.json(file, 201)
  } catch (error) {
    console.error('Error uploading task file:', error)
    throw new HTTPException(500, { message: 'Failed to upload task file' })
  }
})

// Upload file for a comment
app.post('/comments/:commentId/files', async (c) => {
  try {
    const commentId = parseInt(c.req.param('commentId'))
    const { projectId, uploadedById, fileName, fileUrl, fileSize, fileType, description } = await c.req.json()
    
    if (isNaN(commentId)) {
      throw new HTTPException(400, { message: 'Invalid comment ID' })
    }

    if (!projectId || !uploadedById || !fileName || !fileUrl) {
      throw new HTTPException(400, { message: 'Missing required fields' })
    }

    const file = await uploadCommentFileServer(commentId, projectId, uploadedById, fileName, fileUrl, fileSize, fileType, description)
    return c.json(file, 201)
  } catch (error) {
    console.error('Error uploading comment file:', error)
    throw new HTTPException(500, { message: 'Failed to upload comment file' })
  }
})

// EXPENSES ROUTES
app.get('/expenses', async (c) => {
  try {
    const search = c.req.query('search')
    const projectId = c.req.query('projectId') ? parseInt(c.req.query('projectId')!) : undefined
    const category = c.req.query('category')
    const startDate = c.req.query('startDate')
    const endDate = c.req.query('endDate')
    const userId = c.req.query('userId') ? parseInt(c.req.query('userId')!) : undefined

    const expenses = await getExpensesServer(search, projectId, category, startDate, endDate, userId)
    return c.json(expenses)
  } catch (error) {
    console.error('Error fetching expenses:', error)
    throw new HTTPException(500, { message: 'Failed to fetch expenses' })
  }
})

app.get('/expenses/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'))
    
    if (isNaN(id)) {
      throw new HTTPException(400, { message: 'Invalid expense ID' })
    }

    const expense = await getExpenseByIdServer(id)
    
    if (!expense) {
      throw new HTTPException(404, { message: 'Expense not found' })
    }
    
    return c.json(expense)
  } catch (error) {
    console.error('Error fetching expense:', error)
    if (error instanceof HTTPException) throw error
    throw new HTTPException(500, { message: 'Failed to fetch expense' })
  }
})

app.post('/expenses', async (c) => {
  try {
    const expenseData = await c.req.json()
    const expense = await createExpenseServer(expenseData)
    return c.json(expense, 201)
  } catch (error) {
    console.error('Error creating expense:', error)
    throw new HTTPException(500, { message: 'Failed to create expense' })
  }
})

app.put('/expenses/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'))
    const expenseData = await c.req.json()
    
    if (isNaN(id)) {
      throw new HTTPException(400, { message: 'Invalid expense ID' })
    }

    const expense = await updateExpenseServer(id, expenseData)
    return c.json(expense)
  } catch (error) {
    console.error('Error updating expense:', error)
    throw new HTTPException(500, { message: 'Failed to update expense' })
  }
})

app.delete('/expenses/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'))
    
    if (isNaN(id)) {
      throw new HTTPException(400, { message: 'Invalid expense ID' })
    }

    await deleteExpenseServer(id)
    return c.json({ message: 'Expense deleted successfully' })
  } catch (error) {
    console.error('Error deleting expense:', error)
    throw new HTTPException(500, { message: 'Failed to delete expense' })
  }
})

// DOCUMENTS ROUTES
app.get('/docs', async (c) => {
  try {
    const search = c.req.query('search')
    const type = c.req.query('type')
    const status = c.req.query('status')
    const projectId = c.req.query('projectId') ? parseInt(c.req.query('projectId')!) : undefined
    const clientId = c.req.query('clientId') ? parseInt(c.req.query('clientId')!) : undefined
    const category = c.req.query('category')

    const documents = await getDocumentsServer(search, type, status, projectId, clientId, category)
    return c.json(documents)
  } catch (error) {
    console.error('Error fetching documents:', error)
    throw new HTTPException(500, { message: 'Failed to fetch documents' })
  }
})

app.get('/docs/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'))
    
    if (isNaN(id)) {
      throw new HTTPException(400, { message: 'Invalid document ID' })
    }

    const document = await getDocumentByIdServer(id)
    
    if (!document) {
      throw new HTTPException(404, { message: 'Document not found' })
    }
    
    return c.json(document)
  } catch (error) {
    console.error('Error fetching document:', error)
    if (error instanceof HTTPException) throw error
    throw new HTTPException(500, { message: 'Failed to fetch document' })
  }
})

app.post('/docs', async (c) => {
  try {
    const documentData = await c.req.json()
    const document = await createDocumentServer(documentData)
    return c.json(document, 201)
  } catch (error) {
    console.error('Error creating document:', error)
    throw new HTTPException(500, { message: 'Failed to create document' })
  }
})

app.put('/docs/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'))
    const documentData = await c.req.json()
    
    if (isNaN(id)) {
      throw new HTTPException(400, { message: 'Invalid document ID' })
    }

    const document = await updateDocumentServer(id, documentData)
    return c.json(document)
  } catch (error) {
    console.error('Error updating document:', error)
    throw new HTTPException(500, { message: 'Failed to update document' })
  }
})

app.delete('/docs/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'))
    
    if (isNaN(id)) {
      throw new HTTPException(400, { message: 'Invalid document ID' })
    }

    await deleteDocumentServer(id)
    return c.json({ message: 'Document deleted successfully' })
  } catch (error) {
    console.error('Error deleting document:', error)
    throw new HTTPException(500, { message: 'Failed to delete document' })
  }
})

// INVOICES ROUTES
app.get('/invoices', async (c) => {
  try {
    const search = c.req.query('search')
    const status = c.req.query('status')
    const projectId = c.req.query('projectId') ? parseInt(c.req.query('projectId')!) : undefined
    const clientId = c.req.query('clientId') ? parseInt(c.req.query('clientId')!) : undefined

    const invoices = await getInvoicesServer(search, status, projectId, clientId)
    return c.json(invoices)
  } catch (error) {
    console.error('Error fetching invoices:', error)
    throw new HTTPException(500, { message: 'Failed to fetch invoices' })
  }
})

app.get('/invoices/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'))
    
    if (isNaN(id)) {
      throw new HTTPException(400, { message: 'Invalid invoice ID' })
    }

    const invoice = await getInvoiceByIdServer(id)
    
    if (!invoice) {
      throw new HTTPException(404, { message: 'Invoice not found' })
    }
    
    return c.json(invoice)
  } catch (error) {
    console.error('Error fetching invoice:', error)
    if (error instanceof HTTPException) throw error
    throw new HTTPException(500, { message: 'Failed to fetch invoice' })
  }
})

app.post('/invoices', async (c) => {
  try {
    const invoiceData = await c.req.json()
    const invoice = await createInvoiceServer(invoiceData)
    return c.json(invoice, 201)
  } catch (error) {
    console.error('Error creating invoice:', error)
    throw new HTTPException(500, { message: 'Failed to create invoice' })
  }
})

app.put('/invoices/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'))
    const invoiceData = await c.req.json()
    
    if (isNaN(id)) {
      throw new HTTPException(400, { message: 'Invalid invoice ID' })
    }

    const invoice = await updateInvoiceServer(id, invoiceData)
    return c.json(invoice)
  } catch (error) {
    console.error('Error updating invoice:', error)
    throw new HTTPException(500, { message: 'Failed to update invoice' })
  }
})

app.delete('/invoices/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'))
    
    if (isNaN(id)) {
      throw new HTTPException(400, { message: 'Invalid invoice ID' })
    }

    await deleteInvoiceServer(id)
    return c.json({ message: 'Invoice deleted successfully' })
  } catch (error) {
    console.error('Error deleting invoice:', error)
    throw new HTTPException(500, { message: 'Failed to delete invoice' })
  }
})

app.patch('/invoices/:id/status', async (c) => {
  try {
    const id = parseInt(c.req.param('id'))
    const { status } = await c.req.json()
    
    if (isNaN(id)) {
      throw new HTTPException(400, { message: 'Invalid invoice ID' })
    }

    if (!status) {
      throw new HTTPException(400, { message: 'Status is required' })
    }

    const invoice = await updateInvoiceServer(id, { status })
    return c.json(invoice)
  } catch (error) {
    console.error('Error updating invoice status:', error)
    throw new HTTPException(500, { message: 'Failed to update invoice status' })
  }
})

app.get('/invoices/:id/pdf', async (c) => {
  try {
    const id = parseInt(c.req.param('id'))
    
    if (isNaN(id)) {
      throw new HTTPException(400, { message: 'Invalid invoice ID' })
    }

    const invoice = await getInvoiceByIdServer(id)
    
    if (!invoice) {
      throw new HTTPException(404, { message: 'Invoice not found' })
    }

    // For now, return a simple message that PDF generation is not yet implemented
    // This will be replaced with proper PDF generation later
    throw new HTTPException(501, { message: 'PDF generation is currently being implemented' })
  } catch (error) {
    console.error('Error in invoice PDF endpoint:', error)
    if (error instanceof HTTPException) throw error
    throw new HTTPException(500, { message: 'Failed to process invoice PDF request' })
  }
})

// Add debug endpoint to check HTML content
app.get('/invoices/:id/html', async (c) => {
  try {
    const id = parseInt(c.req.param('id'))
    
    if (isNaN(id)) {
      throw new HTTPException(400, { message: 'Invalid invoice ID' })
    }

    const invoice = await getInvoiceByIdServer(id)
    
    if (!invoice) {
      throw new HTTPException(404, { message: 'Invoice not found' })
    }

    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
      }).format(amount).replace('IDR', 'Rp ');
    };

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Invoice ${invoice.invoiceNumber}</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            margin: 40px; 
            color: #374151; 
            font-size: 12px;
            line-height: 1.4;
        }
        .header { text-align: right; margin-bottom: 40px; }
        .title { 
            font-size: 48px; 
            color: #6B7280; 
            font-weight: bold; 
            margin-bottom: 30px; 
        }
        .invoice-info { 
            display: flex; 
            justify-content: space-between; 
            margin-bottom: 30px; 
            font-size: 12px;
        }
        .invoice-number { font-weight: normal; }
        .invoice-date { text-align: right; }
        .customer-section { margin-bottom: 40px; }
        .customer-label { 
            font-weight: bold; 
            color: #374151; 
            margin-bottom: 8px; 
        }
        .customer-name { 
            color: #374151; 
            margin-bottom: 30px; 
        }
        table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-bottom: 40px; 
        }
        th { 
            background-color: #6B7280; 
            color: white; 
            padding: 10px; 
            text-align: center; 
            font-size: 12px; 
            font-weight: bold;
        }
        td { 
            padding: 10px; 
            text-align: center; 
            font-size: 12px; 
            border-bottom: 1px solid #E5E7EB; 
            min-height: 35px;
            vertical-align: middle;
        }
        tr:nth-child(even) { background-color: #F3F4F6; }
        tr:nth-child(odd) { background-color: #F9FAFB; }
        .footer { 
            display: flex; 
            justify-content: space-between; 
            margin-top: 40px; 
        }
        .payment-info { 
            width: 60%; 
            font-size: 12px; 
            color: #374151; 
            line-height: 1.5; 
        }
        .total-section { width: 35%; }
        .total-row { 
            background-color: #F3F4F6; 
            padding: 12px; 
            display: flex; 
            justify-content: space-between; 
            border: 1px solid #E5E7EB;
        }
        .total-label, .total-amount { 
            font-weight: bold; 
            color: #374151; 
            font-size: 14px;
        }
        .signature { 
            margin-top: 80px; 
            text-align: right; 
        }
        .signature-text { 
            color: #6B7280; 
            margin-bottom: 50px; 
            font-size: 12px;
        }
        .signature-name { 
            font-weight: bold; 
            color: #374151; 
            font-size: 12px;
        }
        .item-cell {
            white-space: pre-line;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="title">Invoice</div>
    </div>
    
    <div class="invoice-info">
        <div class="invoice-number">Invoice No: ${invoice.invoiceNumber}</div>
        <div class="invoice-date">Date: Dec 5th, 2023</div>
    </div>
    
    <div class="customer-section">
        <div class="customer-label">Customer:</div>
        <div class="customer-name">Pusat Penelitian HIV Unika Atma Jaya</div>
    </div>
    
    <table>
        <thead>
            <tr>
                <th style="width: 8%">Qty</th>
                <th style="width: 20%">Item #</th>
                <th style="width: 32%">Description</th>
                <th style="width: 15%">Unit Price</th>
                <th style="width: 12%">Discount</th>
                <th style="width: 13%">Line Total</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>1.</td>
                <td class="item-cell">Website CLM<br>Jarnas</td>
                <td style="text-align: left">Peluncuran Website CLM Jarnas</td>
                <td style="text-align: right">${formatCurrency(8350000)}</td>
                <td>-</td>
                <td style="text-align: right">${formatCurrency(8350000)}</td>
            </tr>
            <tr>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
            </tr>
            <tr>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
            </tr>
            <tr>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
            </tr>
        </tbody>
    </table>
    
    <div class="footer">
        <div class="payment-info">
            Payment can be made via Bank Transfer payable to:<br>
            Nuroji Lukman Syah<br>
            Bank: BCA<br>
            Account No: 7650543704
        </div>
        <div class="total-section">
            <div class="total-row">
                <span class="total-label">Total</span>
                <span class="total-amount">${formatCurrency(8350000)}</span>
            </div>
        </div>
    </div>
    
    <div class="signature">
        <div class="signature-text">Best Regards,</div>
        <div class="signature-name">Nuroji Lukman Syah</div>
    </div>
</body>
</html>`;

    return c.html(htmlContent)
  } catch (error) {
    console.error('Error in invoice HTML endpoint:', error)
    if (error instanceof HTTPException) throw error
    throw new HTTPException(500, { message: 'Failed to process invoice HTML request' })
  }
})

// CLIENTS ROUTES
app.get('/clients', async (c) => {
  try {
    const search = c.req.query('search')
    const clients = await getClientsServer(search)
    return c.json(clients)
  } catch (error) {
    console.error('Error fetching clients:', error)
    throw new HTTPException(500, { message: 'Failed to fetch clients' })
  }
})

app.get('/clients/active', async (c) => {
  try {
    const clients = await getActiveClientsServer()
    return c.json(clients)
  } catch (error) {
    console.error('Error fetching active clients:', error)
    throw new HTTPException(500, { message: 'Failed to fetch active clients' })
  }
})

app.get('/clients/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'))
    
    if (isNaN(id)) {
      throw new HTTPException(400, { message: 'Invalid client ID' })
    }

    const client = await getClientByIdServer(id)
    
    if (!client) {
      throw new HTTPException(404, { message: 'Client not found' })
    }
    
    return c.json(client)
  } catch (error) {
    console.error('Error fetching client:', error)
    if (error instanceof HTTPException) throw error
    throw new HTTPException(500, { message: 'Failed to fetch client' })
  }
})

app.post('/clients', async (c) => {
  try {
    const clientData = await c.req.json()
    const client = await createClientServer(clientData)
    return c.json(client, 201)
  } catch (error) {
    console.error('Error creating client:', error)
    throw new HTTPException(500, { message: 'Failed to create client' })
  }
})

app.put('/clients/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'))
    const clientData = await c.req.json()
    
    if (isNaN(id)) {
      throw new HTTPException(400, { message: 'Invalid client ID' })
    }

    const client = await updateClientServer(id, clientData)
    return c.json(client)
  } catch (error) {
    console.error('Error updating client:', error)
    throw new HTTPException(500, { message: 'Failed to update client' })
  }
})

app.delete('/clients/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'))
    
    if (isNaN(id)) {
      throw new HTTPException(400, { message: 'Invalid client ID' })
    }

    await deleteClientServer(id)
    return c.json({ message: 'Client deleted successfully' })
  } catch (error) {
    console.error('Error deleting client:', error)
    throw new HTTPException(500, { message: 'Failed to delete client' })
  }
})

app.patch('/clients/:id/toggle-status', async (c) => {
  try {
    const id = parseInt(c.req.param('id'))
    
    if (isNaN(id)) {
      throw new HTTPException(400, { message: 'Invalid client ID' })
    }

    const client = await toggleClientStatusServer(id)
    return c.json(client)
  } catch (error) {
    console.error('Error toggling client status:', error)
    throw new HTTPException(500, { message: 'Failed to toggle client status' })
  }
})

// TOOLS ROUTES

// ─── URL Shortener ───
app.get('/tools/urls', async (c) => {
  try {
    // Check authentication
    const supabaseUser = await getAuthenticatedUser(c)
    if (!supabaseUser) {
      throw new HTTPException(401, { message: 'Unauthorized - Please log in' })
    }

    const urls = await getShortenedUrls(DEFAULT_USER_ID)
    return c.json(urls)
  } catch (error) {
    console.error('Error fetching shortened URLs:', error)
    if (error instanceof HTTPException) throw error
    throw new HTTPException(500, { message: 'Failed to fetch shortened URLs' })
  }
})

app.post('/tools/urls', async (c) => {
  try {
    // Check authentication
    const supabaseUser = await getAuthenticatedUser(c)
    if (!supabaseUser) {
      throw new HTTPException(401, { message: 'Unauthorized - Please log in' })
    }

    const data = await c.req.json()
    
    if (!data.originalUrl) {
      throw new HTTPException(400, { message: 'Original URL is required' })
    }

    const url = await createShortenedUrl({
      userId: DEFAULT_USER_ID,
      originalUrl: data.originalUrl,
      customAlias: data.customAlias,
      description: data.description,
      expiresAt: data.expiresAt,
    })
    
    return c.json(url, 201)
  } catch (error: any) {
    console.error('Error creating shortened URL:', error)
    if (error instanceof HTTPException) throw error
    if (error.message?.includes('already exists')) {
      throw new HTTPException(400, { message: error.message })
    }
    throw new HTTPException(500, { message: 'Failed to create shortened URL' })
  }
})

app.delete('/tools/urls/:id', async (c) => {
  try {
    // Check authentication
    const supabaseUser = await getAuthenticatedUser(c)
    if (!supabaseUser) {
      throw new HTTPException(401, { message: 'Unauthorized - Please log in' })
    }

    const id = parseInt(c.req.param('id'))
    
    if (isNaN(id)) {
      throw new HTTPException(400, { message: 'Invalid URL ID' })
    }

    const deleted = await deleteShortenedUrl(id, DEFAULT_USER_ID)
    if (!deleted) {
      throw new HTTPException(404, { message: 'Shortened URL not found' })
    }
    
    return c.json({ message: 'Shortened URL deleted successfully' })
  } catch (error) {
    console.error('Error deleting shortened URL:', error)
    if (error instanceof HTTPException) throw error
    throw new HTTPException(500, { message: 'Failed to delete shortened URL' })
  }
})

// URL analytics endpoint
app.get('/tools/urls/:id/analytics', async (c) => {
  try {
    // Check authentication
    const supabaseUser = await getAuthenticatedUser(c)
    if (!supabaseUser) {
      throw new HTTPException(401, { message: 'Unauthorized - Please log in' })
    }

    const id = parseInt(c.req.param('id'))
    
    if (isNaN(id)) {
      throw new HTTPException(400, { message: 'Invalid URL ID' })
    }

    const analytics = await getUrlAnalytics(id, DEFAULT_USER_ID)
    if (!analytics) {
      throw new HTTPException(404, { message: 'Shortened URL not found' })
    }
    
    return c.json(analytics)
  } catch (error) {
    console.error('Error fetching URL analytics:', error)
    if (error instanceof HTTPException) throw error
    throw new HTTPException(500, { message: 'Failed to fetch URL analytics' })
  }
})

// URL redirect endpoint
app.get('/s/:shortCode', async (c) => {
  try {
    const shortCode = c.req.param('shortCode')
    const ip = c.req.header('x-forwarded-for') || c.req.header('cf-connecting-ip') || c.req.header('x-real-ip') || 'unknown'
    const userAgent = c.req.header('user-agent') || ''
    const referer = c.req.header('referer') || ''

    const originalUrl = await handleUrlRedirect(shortCode, {
      ip,
      userAgent,
      referer,
    })

    if (!originalUrl) {
      throw new HTTPException(404, { message: 'Short URL not found or expired' })
    }

    return c.redirect(originalUrl, 302)
  } catch (error) {
    console.error('Error handling URL redirect:', error)
    if (error instanceof HTTPException) throw error
    throw new HTTPException(500, { message: 'Failed to redirect URL' })
  }
})

// ─── QR Codes ───
app.get('/tools/qr-codes', async (c) => {
  try {
    // Check authentication
    const supabaseUser = await getAuthenticatedUser(c)
    if (!supabaseUser) {
      throw new HTTPException(401, { message: 'Unauthorized - Please log in' })
    }

    const qrCodes = await getQrCodes(DEFAULT_USER_ID)
    return c.json(qrCodes)
  } catch (error) {
    console.error('Error fetching QR codes:', error)
    if (error instanceof HTTPException) throw error
    throw new HTTPException(500, { message: 'Failed to fetch QR codes' })
  }
})

app.post('/tools/qr-codes', async (c) => {
  try {
    // Check authentication
    const supabaseUser = await getAuthenticatedUser(c)
    if (!supabaseUser) {
      throw new HTTPException(401, { message: 'Unauthorized - Please log in' })
    }

    const data = await c.req.json()
    
    if (!data.name || !data.type || !data.data) {
      throw new HTTPException(400, { message: 'Name, type, and data are required' })
    }

    const qrCode = await createQrCode({
      userId: DEFAULT_USER_ID,
      name: data.name,
      type: data.type,
      data: data.data,
      size: data.size,
      foregroundColor: data.foregroundColor,
      backgroundColor: data.backgroundColor,
      errorCorrectionLevel: data.errorCorrectionLevel,
      format: data.format,
      shortenedUrlId: data.shortenedUrlId,
    })
    
    return c.json(qrCode, 201)
  } catch (error) {
    console.error('Error creating QR code:', error)
    if (error instanceof HTTPException) throw error
    throw new HTTPException(500, { message: 'Failed to create QR code' })
  }
})

app.delete('/tools/qr-codes/:id', async (c) => {
  try {
    // Check authentication
    const supabaseUser = await getAuthenticatedUser(c)
    if (!supabaseUser) {
      throw new HTTPException(401, { message: 'Unauthorized - Please log in' })
    }

    const id = parseInt(c.req.param('id'))
    
    if (isNaN(id)) {
      throw new HTTPException(400, { message: 'Invalid QR code ID' })
    }

    const deleted = await deleteQrCode(id, DEFAULT_USER_ID)
    if (!deleted) {
      throw new HTTPException(404, { message: 'QR code not found' })
    }
    
    return c.json({ message: 'QR code deleted successfully' })
  } catch (error) {
    console.error('Error deleting QR code:', error)
    if (error instanceof HTTPException) throw error
    throw new HTTPException(500, { message: 'Failed to delete QR code' })
  }
})

// ─── Document Signing ───
app.get('/tools/signing-requests', async (c) => {
  try {
    // Check authentication
    const supabaseUser = await getAuthenticatedUser(c)
    if (!supabaseUser) {
      throw new HTTPException(401, { message: 'Unauthorized - Please log in' })
    }

    const requests = await getSigningRequests(DEFAULT_USER_ID)
    return c.json(requests)
  } catch (error) {
    console.error('Error fetching signing requests:', error)
    if (error instanceof HTTPException) throw error
    throw new HTTPException(500, { message: 'Failed to fetch signing requests' })
  }
})

app.post('/tools/signing-requests', async (c) => {
  try {
    // Check authentication
    const supabaseUser = await getAuthenticatedUser(c)
    if (!supabaseUser) {
      throw new HTTPException(401, { message: 'Unauthorized - Please log in' })
    }

    const data = await c.req.json()
    
    if (!data.documentName || !data.documentUrl || !data.title || !data.expiresAt || !data.signers?.length) {
      throw new HTTPException(400, { message: 'Required fields missing' })
    }

    const request = await createSigningRequest({
      userId: DEFAULT_USER_ID,
      documentName: data.documentName,
      documentUrl: data.documentUrl,
      documentSize: data.documentSize,
      documentType: data.documentType,
      title: data.title,
      message: data.message,
      expiresAt: data.expiresAt,
      signers: data.signers,
    })
    
    return c.json(request, 201)
  } catch (error) {
    console.error('Error creating signing request:', error)
    if (error instanceof HTTPException) throw error
    throw new HTTPException(500, { message: 'Failed to create signing request' })
  }
})

// Public signing endpoint
app.get('/sign/:token', async (c) => {
  try {
    const accessToken = c.req.param('token')
    const result = await getSigningRequestByToken(accessToken)
    
    if (!result) {
      throw new HTTPException(404, { message: 'Signing request not found or expired' })
    }

    // Return signing page data (in a real app, this might render an HTML page)
    return c.json({
      request: result.request,
      signer: {
        id: result.signer.id,
        name: result.signer.name,
        email: result.signer.email,
        role: result.signer.role,
        status: result.signer.status,
      }
    })
  } catch (error) {
    console.error('Error fetching signing request:', error)
    if (error instanceof HTTPException) throw error
    throw new HTTPException(500, { message: 'Failed to fetch signing request' })
  }
})

app.post('/sign/:token', async (c) => {
  try {
    const accessToken = c.req.param('token')
    const data = await c.req.json()
    
    if (!data.signatureData || !data.signatureType) {
      throw new HTTPException(400, { message: 'Signature data and type are required' })
    }

    const ip = c.req.header('x-forwarded-for') || c.req.header('cf-connecting-ip') || c.req.header('x-real-ip') || 'unknown'
    const userAgent = c.req.header('user-agent') || ''

    const success = await signDocument({
      accessToken,
      signatureData: data.signatureData,
      signatureType: data.signatureType,
      ipAddress: ip,
      userAgent,
    })

    if (!success) {
      throw new HTTPException(400, { message: 'Unable to sign document' })
    }
    
    return c.json({ message: 'Document signed successfully' })
  } catch (error) {
    console.error('Error signing document:', error)
    if (error instanceof HTTPException) throw error
    throw new HTTPException(500, { message: 'Failed to sign document' })
  }
})

// ─── YouTube Downloader ───
app.post('/tools/youtube/info', async (c) => {
  try {
    // Check authentication
    const supabaseUser = await getAuthenticatedUser(c)
    if (!supabaseUser) {
      throw new HTTPException(401, { message: 'Unauthorized - Please log in' })
    }

    const data = await c.req.json()
    
    if (!data.url) {
      throw new HTTPException(400, { message: 'YouTube URL is required' })
    }

    const videoInfo = await getYouTubeVideoInfo(data.url)
    if (!videoInfo) {
      throw new HTTPException(400, { message: 'Invalid YouTube URL or video not found' })
    }
    
    return c.json({ videoInfo })
  } catch (error) {
    console.error('Error getting YouTube video info:', error)
    if (error instanceof HTTPException) throw error
    throw new HTTPException(500, { message: 'Failed to get video information' })
  }
})

app.post('/tools/youtube/download', async (c) => {
  try {
    // Check authentication
    const supabaseUser = await getAuthenticatedUser(c)
    if (!supabaseUser) {
      throw new HTTPException(401, { message: 'Unauthorized - Please log in' })
    }

    const data = await c.req.json()
    
    if (!data.url || !data.itag || !data.type) {
      throw new HTTPException(400, { message: 'URL, itag, and type are required' })
    }

    const result = await downloadYouTubeVideo(data.url, data.itag, data.type)
    
    return c.json(result)
  } catch (error) {
    console.error('Error processing YouTube download:', error)
    if (error instanceof HTTPException) throw error
    throw new HTTPException(500, { message: 'Failed to process download request' })
  }
})

// Streaming endpoint for YouTube downloads
app.get('/tools/youtube/stream', async (c) => {
  try {
    // Check authentication
    const supabaseUser = await getAuthenticatedUser(c)
    if (!supabaseUser) {
      throw new HTTPException(401, { message: 'Unauthorized - Please log in' })
    }

    const url = c.req.query('url')
    const itag = c.req.query('itag')
    
    if (!url || !itag) {
      throw new HTTPException(400, { message: 'URL and itag are required' })
    }

    const result = await getYouTubeStreamInfo(decodeURIComponent(url), itag)
    
    if (!result.success || !result.stream) {
      throw new HTTPException(400, { message: result.message })
    }

    // Set response headers for download
    c.header('Content-Type', result.contentType || 'application/octet-stream')
    c.header('Content-Disposition', `attachment; filename="${result.filename}"`)
    c.header('Cache-Control', 'no-cache')
    
    // Return the stream
    return new Response(result.stream, {
      headers: {
        'Content-Type': result.contentType || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${result.filename}"`,
        'Cache-Control': 'no-cache'
      }
    })
  } catch (error) {
    console.error('Error streaming YouTube video:', error)
    if (error instanceof HTTPException) throw error
    throw new HTTPException(500, { message: 'Failed to stream video' })
  }
})

// ─── Gemini AI Chat ───
app.post('/chat/gemini', async (c) => {
  try {
    // Check authentication (with development mode bypass)
    const supabaseUser = await getAuthenticatedUserOrBypass(c)
    if (!supabaseUser) {
      throw new HTTPException(401, { message: 'Unauthorized - Please log in' })
    }

    const { sendMessageToGemini } = await import('./gemini')
    const data = await c.req.json()
    
    if (!data.message) {
      throw new HTTPException(400, { message: 'Message is required' })
    }

    const response = await sendMessageToGemini(data.message, data.conversationHistory || [])
    
    // Save the conversation if successful
    if (response.success && response.message) {
      try {
        let conversationId = data.conversationId
        
        // Create new conversation if not provided
        if (!conversationId) {
          const title = await generateConversationTitle(data.message)
          const conversation = await createChatConversation({
            userId: DEFAULT_USER_ID,
            title,
          })
          conversationId = conversation.id
        }
        
        // Save user message
        await addChatMessage({
          conversationId,
          role: 'user',
          content: data.message,
        })
        
        // Save assistant response
        await addChatMessage({
          conversationId,
          role: 'assistant',
          content: response.message,
        })
        
        // Include conversation ID in response
        response.conversationId = conversationId
      } catch (dbError) {
        console.error('Failed to save chat to database:', dbError)
        // Don't fail the API call if database save fails
      }
    }
    
    return c.json(response)
  } catch (error) {
    console.error('Error in Gemini chat:', error)
    if (error instanceof HTTPException) throw error
    throw new HTTPException(500, { message: 'Failed to process chat message' })
  }
})

app.post('/chat/gemini/stream', async (c) => {
  try {
    // Check authentication (with development mode bypass)
    const supabaseUser = await getAuthenticatedUserOrBypass(c)
    if (!supabaseUser) {
      throw new HTTPException(401, { message: 'Unauthorized - Please log in' })
    }

    const { streamMessageToGemini } = await import('./gemini')
    const data = await c.req.json()
    
    if (!data.message) {
      throw new HTTPException(400, { message: 'Message is required' })
    }

    const stream = await streamMessageToGemini(data.message, data.conversationHistory || [])
    
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      }
    })
  } catch (error) {
    console.error('Error in Gemini stream chat:', error)
    if (error instanceof HTTPException) throw error
    throw new HTTPException(500, { message: 'Failed to process stream chat message' })
  }
})

// ─── Chat Conversations Management ───
app.get('/chat/conversations', async (c) => {
  try {
    // Check authentication (with development mode bypass)
    const supabaseUser = await getAuthenticatedUserOrBypass(c)
    if (!supabaseUser) {
      throw new HTTPException(401, { message: 'Unauthorized - Please log in' })
    }

    // Use default user ID for now (in production, map supabase user to our user table)
    const conversations = await getChatConversations(DEFAULT_USER_ID)
    return c.json({ conversations })
  } catch (error) {
    console.error('Error fetching conversations:', error)
    if (error instanceof HTTPException) throw error
    throw new HTTPException(500, { message: 'Failed to fetch conversations' })
  }
})

app.post('/chat/conversations', async (c) => {
  try {
    // Check authentication (with development mode bypass)
    const supabaseUser = await getAuthenticatedUserOrBypass(c)
    if (!supabaseUser) {
      throw new HTTPException(401, { message: 'Unauthorized - Please log in' })
    }

    const data = await c.req.json()
    
    if (!data.title) {
      throw new HTTPException(400, { message: 'Title is required' })
    }

    const conversation = await createChatConversation({
      userId: DEFAULT_USER_ID,
      title: data.title,
      description: data.description
    })
    
    return c.json({ conversation }, 201)
  } catch (error) {
    console.error('Error creating conversation:', error)
    if (error instanceof HTTPException) throw error
    throw new HTTPException(500, { message: 'Failed to create conversation' })
  }
})

app.get('/chat/conversations/:id', async (c) => {
  try {
    // Check authentication (with development mode bypass)
    const supabaseUser = await getAuthenticatedUserOrBypass(c)
    if (!supabaseUser) {
      throw new HTTPException(401, { message: 'Unauthorized - Please log in' })
    }

    const conversationId = parseInt(c.req.param('id'))
    if (isNaN(conversationId)) {
      throw new HTTPException(400, { message: 'Invalid conversation ID' })
    }

    const conversation = await getChatConversationWithMessages(conversationId, DEFAULT_USER_ID)
    
    if (!conversation) {
      throw new HTTPException(404, { message: 'Conversation not found' })
    }
    
    return c.json({ conversation })
  } catch (error) {
    console.error('Error fetching conversation:', error)
    if (error instanceof HTTPException) throw error
    throw new HTTPException(500, { message: 'Failed to fetch conversation' })
  }
})

app.put('/chat/conversations/:id', async (c) => {
  try {
    // Check authentication (with development mode bypass)
    const supabaseUser = await getAuthenticatedUserOrBypass(c)
    if (!supabaseUser) {
      throw new HTTPException(401, { message: 'Unauthorized - Please log in' })
    }

    const conversationId = parseInt(c.req.param('id'))
    if (isNaN(conversationId)) {
      throw new HTTPException(400, { message: 'Invalid conversation ID' })
    }

    const data = await c.req.json()
    
    const conversation = await updateChatConversation(conversationId, DEFAULT_USER_ID, data)
    
    if (!conversation) {
      throw new HTTPException(404, { message: 'Conversation not found' })
    }
    
    return c.json({ conversation })
  } catch (error) {
    console.error('Error updating conversation:', error)
    if (error instanceof HTTPException) throw error
    throw new HTTPException(500, { message: 'Failed to update conversation' })
  }
})

app.delete('/chat/conversations/:id', async (c) => {
  try {
    // Check authentication (with development mode bypass)
    const supabaseUser = await getAuthenticatedUserOrBypass(c)
    if (!supabaseUser) {
      throw new HTTPException(401, { message: 'Unauthorized - Please log in' })
    }

    const conversationId = parseInt(c.req.param('id'))
    if (isNaN(conversationId)) {
      throw new HTTPException(400, { message: 'Invalid conversation ID' })
    }

    const success = await deleteChatConversation(conversationId, DEFAULT_USER_ID)
    
    if (!success) {
      throw new HTTPException(404, { message: 'Conversation not found' })
    }
    
    return c.json({ message: 'Conversation deleted successfully' })
  } catch (error) {
    console.error('Error deleting conversation:', error)
    if (error instanceof HTTPException) throw error
    throw new HTTPException(500, { message: 'Failed to delete conversation' })
  }
})

app.get('/chat/stats', async (c) => {
  try {
    // Check authentication (with development mode bypass)
    const supabaseUser = await getAuthenticatedUserOrBypass(c)
    if (!supabaseUser) {
      throw new HTTPException(401, { message: 'Unauthorized - Please log in' })
    }

    const stats = await getConversationStats(DEFAULT_USER_ID)
    
    return c.json({ stats })
  } catch (error) {
    console.error('Error fetching chat stats:', error)
    if (error instanceof HTTPException) throw error
    throw new HTTPException(500, { message: 'Failed to fetch chat stats' })
  }
})

// CMS ROUTES

// Blog Categories
app.get('/cms/blog/categories', async (c) => {
  try {
    const categories = await getBlogCategoriesServer()
    return c.json({ categories })
  } catch (error) {
    console.error('Error fetching blog categories:', error)
    throw new HTTPException(500, { message: 'Failed to fetch blog categories' })
  }
})

app.post('/cms/blog/categories', async (c) => {
  try {
    const categoryData = await c.req.json()
    const category = await createBlogCategoryServer(categoryData)
    return c.json({ category }, 201)
  } catch (error) {
    console.error('Error creating blog category:', error)
    throw new HTTPException(500, { message: 'Failed to create blog category' })
  }
})

// Blog Posts
app.get('/cms/blog/posts', async (c) => {
  try {
    const published = c.req.query('published')
    const categoryId = c.req.query('categoryId')
    const search = c.req.query('search')
    
    const filters: any = {}
    
    if (published !== undefined && published !== null) {
      filters.published = published === 'true'
    }
    
    if (categoryId) {
      filters.categoryId = parseInt(categoryId)
    }
    
    if (search) {
      filters.search = search
    }
    
    const posts = await getBlogPostsServer(filters)
    return c.json({ posts })
  } catch (error) {
    console.error('Error fetching blog posts:', error)
    throw new HTTPException(500, { message: 'Failed to fetch blog posts' })
  }
})

app.get('/cms/blog/posts/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'))
    
    if (isNaN(id)) {
      throw new HTTPException(400, { message: 'Invalid post ID' })
    }
    
    const post = await getBlogPostByIdServer(id)
    
    if (!post) {
      throw new HTTPException(404, { message: 'Blog post not found' })
    }
    
    return c.json({ post })
  } catch (error) {
    console.error('Error fetching blog post:', error)
    if (error instanceof HTTPException) throw error
    throw new HTTPException(500, { message: 'Failed to fetch blog post' })
  }
})

app.post('/cms/blog/posts', async (c) => {
  try {
    const postData = await c.req.json()
    const post = await createBlogPostServer(postData)
    return c.json({ post }, 201)
  } catch (error) {
    console.error('Error creating blog post:', error)
    throw new HTTPException(500, { message: 'Failed to create blog post' })
  }
})

app.put('/cms/blog/posts/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'))
    const postData = await c.req.json()
    
    if (isNaN(id)) {
      throw new HTTPException(400, { message: 'Invalid post ID' })
    }
    
    const post = await updateBlogPostServer(id, postData)
    
    if (!post) {
      throw new HTTPException(404, { message: 'Blog post not found' })
    }
    
    return c.json({ post })
  } catch (error) {
    console.error('Error updating blog post:', error)
    if (error instanceof HTTPException) throw error
    throw new HTTPException(500, { message: 'Failed to update blog post' })
  }
})

app.delete('/cms/blog/posts/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'))
    
    if (isNaN(id)) {
      throw new HTTPException(400, { message: 'Invalid post ID' })
    }
    
    const deleted = await deleteBlogPostServer(id)
    
    if (!deleted) {
      throw new HTTPException(404, { message: 'Blog post not found' })
    }
    
    return c.json({ message: 'Blog post deleted successfully' })
  } catch (error) {
    console.error('Error deleting blog post:', error)
    if (error instanceof HTTPException) throw error
    throw new HTTPException(500, { message: 'Failed to delete blog post' })
  }
})

// Pages
app.get('/cms/pages', async (c) => {
  try {
    const published = c.req.query('published')
    const pages = await getPagesServer(published ? published === 'true' : undefined)
    return c.json({ pages })
  } catch (error) {
    console.error('Error fetching pages:', error)
    throw new HTTPException(500, { message: 'Failed to fetch pages' })
  }
})

app.get('/cms/pages/:slug', async (c) => {
  try {
    const slug = c.req.param('slug')
    const page = await getPageBySlugServer(slug)
    
    if (!page) {
      throw new HTTPException(404, { message: 'Page not found' })
    }
    
    return c.json({ page })
  } catch (error) {
    console.error('Error fetching page:', error)
    if (error instanceof HTTPException) throw error
    throw new HTTPException(500, { message: 'Failed to fetch page' })
  }
})

app.post('/cms/pages', async (c) => {
  try {
    const pageData = await c.req.json()
    const page = await createPageServer(pageData)
    return c.json({ page }, 201)
  } catch (error) {
    console.error('Error creating page:', error)
    throw new HTTPException(500, { message: 'Failed to create page' })
  }
})

app.put('/cms/pages/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'))
    const pageData = await c.req.json()
    
    if (isNaN(id)) {
      throw new HTTPException(400, { message: 'Invalid page ID' })
    }
    
    const page = await updatePageServer(id, pageData)
    
    if (!page) {
      throw new HTTPException(404, { message: 'Page not found' })
    }
    
    return c.json({ page })
  } catch (error) {
    console.error('Error updating page:', error)
    if (error instanceof HTTPException) throw error
    throw new HTTPException(500, { message: 'Failed to update page' })
  }
})

app.delete('/cms/pages/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'))
    
    if (isNaN(id)) {
      throw new HTTPException(400, { message: 'Invalid page ID' })
    }
    
    const deleted = await deletePageServer(id)
    
    if (!deleted) {
      throw new HTTPException(404, { message: 'Page not found' })
    }
    
    return c.json({ message: 'Page deleted successfully' })
  } catch (error) {
    console.error('Error deleting page:', error)
    if (error instanceof HTTPException) throw error
    throw new HTTPException(500, { message: 'Failed to delete page' })
  }
})

// Portfolio
app.get('/cms/portfolio', async (c) => {
  try {
    const published = c.req.query('published')
    const items = await getPortfolioItemsServer(published ? published === 'true' : undefined)
    return c.json({ items })
  } catch (error) {
    console.error('Error fetching portfolio items:', error)
    throw new HTTPException(500, { message: 'Failed to fetch portfolio items' })
  }
})

app.get('/cms/portfolio/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'))
    
    if (isNaN(id)) {
      throw new HTTPException(400, { message: 'Invalid portfolio item ID' })
    }
    
    const item = await getPortfolioItemByIdServer(id)
    
    if (!item) {
      throw new HTTPException(404, { message: 'Portfolio item not found' })
    }
    
    return c.json({ item })
  } catch (error) {
    console.error('Error fetching portfolio item:', error)
    if (error instanceof HTTPException) throw error
    throw new HTTPException(500, { message: 'Failed to fetch portfolio item' })
  }
})

app.post('/cms/portfolio', async (c) => {
  try {
    const itemData = await c.req.json()
    const item = await createPortfolioItemServer(itemData)
    return c.json({ item }, 201)
  } catch (error) {
    console.error('Error creating portfolio item:', error)
    throw new HTTPException(500, { message: 'Failed to create portfolio item' })
  }
})

app.put('/cms/portfolio/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'))
    const itemData = await c.req.json()
    
    if (isNaN(id)) {
      throw new HTTPException(400, { message: 'Invalid portfolio item ID' })
    }
    
    const item = await updatePortfolioItemServer(id, itemData)
    
    if (!item) {
      throw new HTTPException(404, { message: 'Portfolio item not found' })
    }
    
    return c.json({ item })
  } catch (error) {
    console.error('Error updating portfolio item:', error)
    if (error instanceof HTTPException) throw error
    throw new HTTPException(500, { message: 'Failed to update portfolio item' })
  }
})

app.delete('/cms/portfolio/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'))
    
    if (isNaN(id)) {
      throw new HTTPException(400, { message: 'Invalid portfolio item ID' })
    }
    
    const deleted = await deletePortfolioItemServer(id)
    
    if (!deleted) {
      throw new HTTPException(404, { message: 'Portfolio item not found' })
    }
    
    return c.json({ message: 'Portfolio item deleted successfully' })
  } catch (error) {
    console.error('Error deleting portfolio item:', error)
    if (error instanceof HTTPException) throw error
    throw new HTTPException(500, { message: 'Failed to delete portfolio item' })
  }
})

// EVENTS/SCHEDULE ROUTES
app.get('/events', async (c) => {
  try {
    const userId = c.req.query('userId') ? parseInt(c.req.query('userId')!) : undefined
    const startDate = c.req.query('startDate')
    const endDate = c.req.query('endDate')
    const projectId = c.req.query('projectId') ? parseInt(c.req.query('projectId')!) : undefined
    const clientId = c.req.query('clientId') ? parseInt(c.req.query('clientId')!) : undefined
    const type = c.req.query('type')

    const events = await getEventsServer(userId, startDate, endDate, projectId, clientId, type)
    return c.json({ events })
  } catch (error) {
    console.error('Error fetching events:', error)
    throw new HTTPException(500, { message: 'Failed to fetch events' })
  }
})

app.get('/events/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'))
    
    if (isNaN(id)) {
      throw new HTTPException(400, { message: 'Invalid event ID' })
    }

    const event = await getEventByIdServer(id)
    
    if (!event) {
      throw new HTTPException(404, { message: 'Event not found' })
    }
    
    return c.json(event)
  } catch (error) {
    console.error('Error fetching event:', error)
    if (error instanceof HTTPException) throw error
    throw new HTTPException(500, { message: 'Failed to fetch event' })
  }
})

app.post('/events', async (c) => {
  try {
    const eventData = await c.req.json()
    const event = await createEventServer(eventData)
    return c.json(event, 201)
  } catch (error) {
    console.error('Error creating event:', error)
    throw new HTTPException(500, { message: 'Failed to create event' })
  }
})

app.put('/events/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'))
    const eventData = await c.req.json()
    
    if (isNaN(id)) {
      throw new HTTPException(400, { message: 'Invalid event ID' })
    }

    const event = await updateEventServer(id, eventData)
    return c.json(event)
  } catch (error) {
    console.error('Error updating event:', error)
    throw new HTTPException(500, { message: 'Failed to update event' })
  }
})

app.delete('/events/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'))
    
    if (isNaN(id)) {
      throw new HTTPException(400, { message: 'Invalid event ID' })
    }

    await deleteEventServer(id)
    return c.json({ message: 'Event deleted successfully' })
  } catch (error) {
    console.error('Error deleting event:', error)
    throw new HTTPException(500, { message: 'Failed to delete event' })
  }
})

app.get('/events/upcoming/:userId', async (c) => {
  try {
    const userId = parseInt(c.req.param('userId'))
    const limit = c.req.query('limit') ? parseInt(c.req.query('limit')!) : 10
    
    if (isNaN(userId)) {
      throw new HTTPException(400, { message: 'Invalid user ID' })
    }

    const events = await getUpcomingEventsServer(userId, limit)
    return c.json({ events })
  } catch (error) {
    console.error('Error fetching upcoming events:', error)
    throw new HTTPException(500, { message: 'Failed to fetch upcoming events' })
  }
})

app.get('/events/range/:userId', async (c) => {
  try {
    const userId = parseInt(c.req.param('userId'))
    const startDate = c.req.query('startDate')
    const endDate = c.req.query('endDate')
    
    if (isNaN(userId)) {
      throw new HTTPException(400, { message: 'Invalid user ID' })
    }

    if (!startDate || !endDate) {
      throw new HTTPException(400, { message: 'Start date and end date are required' })
    }

    const events = await getEventsByDateRangeServer(userId, startDate, endDate)
    return c.json({ events })
  } catch (error) {
    console.error('Error fetching events by date range:', error)
    throw new HTTPException(500, { message: 'Failed to fetch events by date range' })
  }
})

// Error handling
app.onError((err, c) => {
  console.error('Hono API Error:', err)
  
  if (err instanceof HTTPException) {
    return c.json(
      { error: err.message },
      err.status
    )
  }
  
  return c.json(
    { error: 'Internal Server Error' },
    500
  )
})

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Route not found' }, 404)
})

export { app } 