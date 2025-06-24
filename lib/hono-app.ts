import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { HTTPException } from 'hono/http-exception'

// Import server-side functions
import { 
  getProjectsServer, 
  getProjectByIdServer, 
  createProjectServer, 
  updateProjectServer, 
  deleteProjectServer,
  updateProjectProgressServer,
  getProjectStatsServer
} from './api/projects-server'

import { 
  getTasksServer, 
  getTaskByIdServer, 
  createTaskServer, 
  updateTaskServer, 
  deleteTaskServer
} from './api/tasks-server'

import { 
  getExpensesServer, 
  getExpenseByIdServer, 
  createExpenseServer, 
  updateExpenseServer, 
  deleteExpenseServer,
  getExpenseTotalsByProjectServer,
  getExpenseStatsServer
} from './api/expenses-server'

import { 
  getDocumentsServer, 
  getDocumentByIdServer, 
  createDocumentServer, 
  updateDocumentServer, 
  deleteDocumentServer
} from './api/documents-server'

import { 
  getInvoicesServer, 
  getInvoiceByIdServer, 
  createInvoiceServer, 
  updateInvoiceServer, 
  deleteInvoiceServer
} from './api/invoices-server'

import { 
  getClientsServer, 
  getActiveClientsServer, 
  getClientByIdServer, 
  createClientServer, 
  updateClientServer, 
  deleteClientServer,
  toggleClientStatusServer,
  getClientsCountServer
} from './api/clients-server'

import {
  getBlogCategoriesServer,
  createBlogCategoryServer,
  getBlogPostsServer,
  getBlogPostByIdServer,
  getBlogPostBySlugServer,
  createBlogPostServer,
  updateBlogPostServer,
  deleteBlogPostServer,
  getPagesServer,
  getPageBySlugServer,
  createPageServer,
  updatePageServer,
  deletePageServer,
  getPortfolioItemsServer,
  getPortfolioItemByIdServer,
  createPortfolioItemServer,
  updatePortfolioItemServer,
  deletePortfolioItemServer
} from './api/cms-server'

// Import auth functions
import { 
  createUser, 
  authenticateUser, 
  getUserById, 
  updateUser 
} from './auth'

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
    
    const user = await createUser(userData)
    
    // Remove password from response
    const { password, ...userWithoutPassword } = user
    
    return c.json({ 
      message: 'User created successfully',
      user: userWithoutPassword 
    }, 201)
  } catch (error: any) {
    console.error('Registration error:', error)
    if (error.message?.includes('UNIQUE constraint failed')) {
      throw new HTTPException(400, { message: 'Email or username already exists' })
    }
    throw new HTTPException(500, { message: 'Failed to create user' })
  }
})

app.post('/auth/login', async (c) => {
  try {
    const { email, password } = await c.req.json()
    
    if (!email || !password) {
      throw new HTTPException(400, { message: 'Email and password are required' })
    }
    
    const user = await authenticateUser(email, password)
    
    if (!user) {
      throw new HTTPException(401, { message: 'Invalid email or password' })
    }
    
    // Remove password from response
    const { password: _, ...userWithoutPassword } = user
    
    return c.json({ 
      message: 'Login successful',
      user: userWithoutPassword 
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

    // Generate a simple PDF content for now
    const pdfContent = `
%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources <<
/Font <<
/F1 5 0 R
>>
>>
>>
endobj

4 0 obj
<<
/Length 200
>>
stream
BT
/F1 24 Tf
50 700 Td
(Invoice ${invoice.invoiceNumber}) Tj
0 -50 Td
/F1 12 Tf
(Client: ${invoice.client?.name || 'Unknown'}) Tj
0 -20 Td
(Project: ${invoice.project?.title || 'Unknown'}) Tj
0 -20 Td
(Amount: $${invoice.totalAmount}) Tj
0 -20 Td
(Status: ${invoice.status}) Tj
0 -20 Td
(Date: ${invoice.dateIssued}) Tj
ET
endstream
endobj

5 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj

xref
0 6
0000000000 65535 f 
0000000010 00000 n 
0000000053 00000 n 
0000000110 00000 n 
0000000251 00000 n 
0000000501 00000 n 
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
569
%%EOF`

    // Set headers for PDF download
    c.header('Content-Type', 'application/pdf')
    c.header('Content-Disposition', `attachment; filename="Invoice-${invoice.invoiceNumber}.pdf"`)
    
    return c.body(pdfContent)
  } catch (error) {
    console.error('Error in invoice PDF endpoint:', error)
    if (error instanceof HTTPException) throw error
    throw new HTTPException(500, { message: 'Failed to process invoice PDF request' })
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