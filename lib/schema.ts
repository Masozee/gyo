import { sql } from 'drizzle-orm';
import { text, integer, sqliteTable, real } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

// ─── Users ───
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  firstName: text('first_name'),
  lastName: text('last_name'),
  username: text('username').unique(),
  avatar: text('avatar'),
  bio: text('bio'),
  phone: text('phone'),
  dateOfBirth: text('date_of_birth'),
  address: text('address'),
  city: text('city'),
  state: text('state'),
  zipCode: text('zip_code'),
  country: text('country'),
  company: text('company'),
  jobTitle: text('job_title'),
  website: text('website'),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  emailVerified: integer('email_verified', { mode: 'boolean' }).default(false),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

// ─── Clients ───
export const clients = sqliteTable('clients', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email'),
  phone: text('phone'),
  company: text('company'),
  address: text('address'),
  city: text('city'),
  state: text('state'),
  zipCode: text('zip_code'),
  country: text('country'),
  website: text('website'),
  notes: text('notes'),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

// ─── Projects ───
export const projects = sqliteTable('projects', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  description: text('description'),
  clientId: integer('client_id').references(() => clients.id),
  userId: integer('user_id').notNull().references(() => users.id),
  status: text('status').default('PLANNING'), // PLANNING, IN_PROGRESS, ON_HOLD, COMPLETED, CANCELLED
  priority: text('priority').default('MEDIUM'), // LOW, MEDIUM, HIGH, URGENT
  startDate: text('start_date').notNull(),
  deadline: text('deadline'),
  completedAt: text('completed_at'),
  tags: text('tags'), // JSON array of tags
  color: text('color').default('#3b82f6'), // Hex color for project identification
  
  // Finance
  projectValue: real('project_value'),
  currency: text('currency').default('USD'),
  taxRate: real('tax_rate').default(0),
  taxAmount: real('tax_amount').default(0),
  
  // Progress tracking
  progressPercentage: integer('progress_percentage').default(0),
  
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

// ─── Tasks ───
export const tasks = sqliteTable('tasks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  projectId: integer('project_id').notNull().references(() => projects.id),
  assignedToId: integer('assigned_to_id').references(() => users.id),
  title: text('title').notNull(),
  description: text('description'),
  priority: text('priority').default('MEDIUM'), // LOW, MEDIUM, HIGH, URGENT
  status: text('status').default('TODO'), // TODO, IN_PROGRESS, IN_REVIEW, DONE, CANCELLED
  dueDate: text('due_date'),
  estimatedHours: real('estimated_hours'),
  actualHours: real('actual_hours').default(0),
  order: integer('order').default(0),
  tags: text('tags'), // JSON array of tags
  
  // Dependencies
  parentTaskId: integer('parent_task_id'),
  
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
  completedAt: text('completed_at'),
});

// ─── Task Checklists ───
export const checklists = sqliteTable('checklists', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  taskId: integer('task_id').notNull().references(() => tasks.id),
  content: text('content').notNull(),
  isDone: integer('is_done', { mode: 'boolean' }).default(false),
  order: integer('order').default(0),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

// ─── Time Logs ───
export const timeLogs = sqliteTable('time_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  taskId: integer('task_id').notNull().references(() => tasks.id),
  userId: integer('user_id').notNull().references(() => users.id),
  date: text('date').notNull(),
  startTime: text('start_time'),
  endTime: text('end_time'),
  hoursSpent: real('hours_spent').notNull(),
  description: text('description'),
  billable: integer('billable', { mode: 'boolean' }).default(true),
  hourlyRate: real('hourly_rate'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// ─── Expenses ───
export const expenses = sqliteTable('expenses', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  projectId: integer('project_id').notNull().references(() => projects.id),
  userId: integer('user_id').notNull().references(() => users.id),
  date: text('date').notNull(),
  title: text('title').notNull(),
  category: text('category'), // TRAVEL, MATERIALS, SOFTWARE, EQUIPMENT, OTHER
  amount: real('amount').notNull(),
  currency: text('currency').default('USD'),
  taxAmount: real('tax_amount').default(0),
  receiptUrl: text('receipt_url'), // Link to receipt file
  description: text('description'),
  billable: integer('billable', { mode: 'boolean' }).default(true),
  reimbursed: integer('reimbursed', { mode: 'boolean' }).default(false),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// ─── Invoices ───
export const invoices = sqliteTable('invoices', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  projectId: integer('project_id').notNull().references(() => projects.id),
  clientId: integer('client_id').notNull().references(() => clients.id),
  invoiceNumber: text('invoice_number').notNull().unique(),
  dateIssued: text('date_issued').notNull(),
  dueDate: text('due_date'),
  
  // Amounts
  subtotal: real('subtotal').notNull(),
  taxRate: real('tax_rate').default(0),
  taxAmount: real('tax_amount').default(0),
  totalAmount: real('total_amount').notNull(),
  paidAmount: real('paid_amount').default(0),
  currency: text('currency').default('USD'),
  
  status: text('status').default('DRAFT'), // DRAFT, SENT, PAID, OVERDUE, CANCELLED
  
  // Additional details
  notes: text('notes'),
  terms: text('terms'),
  invoiceUrl: text('invoice_url'), // Link to generated PDF
  
  sentAt: text('sent_at'),
  paidAt: text('paid_at'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

// ─── Invoice Line Items ───
export const invoiceLineItems = sqliteTable('invoice_line_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  invoiceId: integer('invoice_id').notNull().references(() => invoices.id),
  description: text('description').notNull(),
  quantity: real('quantity').default(1),
  unitPrice: real('unit_price').notNull(),
  totalPrice: real('total_price').notNull(),
  order: integer('order').default(0),
});

// ─── Payments ───
export const payments = sqliteTable('payments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  invoiceId: integer('invoice_id').notNull().references(() => invoices.id),
  date: text('date').notNull(),
  amount: real('amount').notNull(),
  currency: text('currency').default('USD'),
  method: text('method'), // BANK_TRANSFER, PAYPAL, STRIPE, CASH, CHECK, OTHER
  transactionId: text('transaction_id'),
  transferProofUrl: text('transfer_proof_url'), // Link to payment proof
  notes: text('notes'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// ─── Project Files/Documents ───
export const projectFiles = sqliteTable('project_files', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  projectId: integer('project_id').notNull().references(() => projects.id),
  taskId: integer('task_id').references(() => tasks.id),
  uploadedById: integer('uploaded_by_id').notNull().references(() => users.id),
  fileName: text('file_name').notNull(),
  fileUrl: text('file_url').notNull(),
  fileSize: integer('file_size'), // in bytes
  fileType: text('file_type'),
  description: text('description'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// ─── Project Comments/Notes ───
export const projectComments = sqliteTable('project_comments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  projectId: integer('project_id').references(() => projects.id),
  taskId: integer('task_id').references(() => tasks.id),
  authorId: integer('author_id').notNull().references(() => users.id),
  content: text('content').notNull(),
  isInternal: integer('is_internal', { mode: 'boolean' }).default(false), // Internal notes vs client-visible
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

// ─── Relations ───
export const usersRelations = relations(users, ({ many }) => ({
  projects: many(projects),
  assignedTasks: many(tasks),
  timeLogs: many(timeLogs),
  expenses: many(expenses),
  uploadedFiles: many(projectFiles),
  comments: many(projectComments),
}));

export const clientsRelations = relations(clients, ({ many }) => ({
  projects: many(projects),
  invoices: many(invoices),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  client: one(clients, {
    fields: [projects.clientId],
    references: [clients.id],
  }),
  user: one(users, {
    fields: [projects.userId],
    references: [users.id],
  }),
  tasks: many(tasks),
  expenses: many(expenses),
  invoices: many(invoices),
  files: many(projectFiles),
  comments: many(projectComments),
}));

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  project: one(projects, {
    fields: [tasks.projectId],
    references: [projects.id],
  }),
  assignedTo: one(users, {
    fields: [tasks.assignedToId],
    references: [users.id],
  }),
  parentTask: one(tasks, {
    fields: [tasks.parentTaskId],
    references: [tasks.id],
  }) as any,
  subtasks: many(tasks),
  checklists: many(checklists),
  timeLogs: many(timeLogs),
  files: many(projectFiles),
  comments: many(projectComments),
}));

export const checklistsRelations = relations(checklists, ({ one }) => ({
  task: one(tasks, {
    fields: [checklists.taskId],
    references: [tasks.id],
  }),
}));

export const timeLogsRelations = relations(timeLogs, ({ one }) => ({
  task: one(tasks, {
    fields: [timeLogs.taskId],
    references: [tasks.id],
  }),
  user: one(users, {
    fields: [timeLogs.userId],
    references: [users.id],
  }),
}));

export const expensesRelations = relations(expenses, ({ one }) => ({
  project: one(projects, {
    fields: [expenses.projectId],
    references: [projects.id],
  }),
  user: one(users, {
    fields: [expenses.userId],
    references: [users.id],
  }),
}));

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  project: one(projects, {
    fields: [invoices.projectId],
    references: [projects.id],
  }),
  client: one(clients, {
    fields: [invoices.clientId],
    references: [clients.id],
  }),
  lineItems: many(invoiceLineItems),
  payments: many(payments),
}));

export const invoiceLineItemsRelations = relations(invoiceLineItems, ({ one }) => ({
  invoice: one(invoices, {
    fields: [invoiceLineItems.invoiceId],
    references: [invoices.id],
  }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  invoice: one(invoices, {
    fields: [payments.invoiceId],
    references: [invoices.id],
  }),
}));

export const projectFilesRelations = relations(projectFiles, ({ one }) => ({
  project: one(projects, {
    fields: [projectFiles.projectId],
    references: [projects.id],
  }),
  task: one(tasks, {
    fields: [projectFiles.taskId],
    references: [tasks.id],
  }),
  uploadedBy: one(users, {
    fields: [projectFiles.uploadedById],
    references: [users.id],
  }),
}));

export const projectCommentsRelations = relations(projectComments, ({ one }) => ({
  project: one(projects, {
    fields: [projectComments.projectId],
    references: [projects.id],
  }),
  task: one(tasks, {
    fields: [projectComments.taskId],
    references: [tasks.id],
  }),
  author: one(users, {
    fields: [projectComments.authorId],
    references: [users.id],
  }),
}));

// ─── Type Exports ───
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Client = typeof clients.$inferSelect;
export type NewClient = typeof clients.$inferInsert;

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;

export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;

export type Checklist = typeof checklists.$inferSelect;
export type NewChecklist = typeof checklists.$inferInsert;

export type TimeLog = typeof timeLogs.$inferSelect;
export type NewTimeLog = typeof timeLogs.$inferInsert;

export type Expense = typeof expenses.$inferSelect;
export type NewExpense = typeof expenses.$inferInsert;

export type Invoice = typeof invoices.$inferSelect;
export type NewInvoice = typeof invoices.$inferInsert;

export type InvoiceLineItem = typeof invoiceLineItems.$inferSelect;
export type NewInvoiceLineItem = typeof invoiceLineItems.$inferInsert;

export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;

export type ProjectFile = typeof projectFiles.$inferSelect;
export type NewProjectFile = typeof projectFiles.$inferInsert;

export type ProjectComment = typeof projectComments.$inferSelect;
export type NewProjectComment = typeof projectComments.$inferInsert;

// ─── Documents & Contracts ───
export const documents = sqliteTable('documents', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  internalNumber: integer('internal_number').notNull(), // Auto-incrementing internal number
  documentNumber: text('document_number'), // Client-provided document number
  title: text('title').notNull(),
  description: text('description'),
  content: text('content'), // Rich text content of the document
  
  // Document metadata
  type: text('type').notNull(), // CONTRACT, AGREEMENT, SOW, PROPOSAL, INVOICE, NDA, etc.
  status: text('status').default('DRAFT'), // DRAFT, UNDER_REVIEW, APPROVED, SIGNED, ACTIVE, EXPIRED, CANCELLED
  priority: text('priority').default('MEDIUM'), // LOW, MEDIUM, HIGH, URGENT
  
  // Project and client associations
  projectId: integer('project_id').references(() => projects.id),
  clientId: integer('client_id').references(() => clients.id),
  userId: integer('user_id').notNull().references(() => users.id), // Document owner/creator
  
  // Document details
  version: text('version').default('1.0'),
  category: text('category'), // LEGAL, TECHNICAL, FINANCIAL, OPERATIONAL, etc.
  tags: text('tags'), // JSON array of tags
  
  // File attachments
  filePath: text('file_path'), // Path to uploaded document file
  fileName: text('file_name'), // Original filename
  fileSize: integer('file_size'), // File size in bytes
  fileType: text('file_type'), // PDF, DOC, DOCX, etc.
  
  // Important dates
  startDate: text('start_date'),
  endDate: text('end_date'),
  signedDate: text('signed_date'),
  expiryDate: text('expiry_date'),
  reminderDate: text('reminder_date'),
  
  // Financial information
  contractValue: real('contract_value'),
  currency: text('currency').default('USD'),
  
  // Approval workflow
  approvalRequired: integer('approval_required', { mode: 'boolean' }).default(false),
  approvedBy: integer('approved_by').references(() => users.id),
  approvedAt: text('approved_at'),
  
  // Document tracking
  isTemplate: integer('is_template', { mode: 'boolean' }).default(false),
  parentDocumentId: integer('parent_document_id').references((): any => documents.id),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  isConfidential: integer('is_confidential', { mode: 'boolean' }).default(false),
  
  // Audit trail
  lastAccessedAt: text('last_accessed_at'),
  accessCount: integer('access_count').default(0),
  
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

// ─── Document Revisions ───
export const documentRevisions = sqliteTable('document_revisions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  documentId: integer('document_id').notNull().references(() => documents.id),
  revisionNumber: integer('revision_number').notNull(),
  title: text('title').notNull(),
  content: text('content'),
  changes: text('changes'), // Description of what changed
  revisedBy: integer('revised_by').notNull().references(() => users.id),
  filePath: text('file_path'),
  fileName: text('file_name'),
  fileSize: integer('file_size'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// ─── Document Comments ───
export const documentComments = sqliteTable('document_comments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  documentId: integer('document_id').notNull().references(() => documents.id),
  userId: integer('user_id').notNull().references(() => users.id),
  content: text('content').notNull(),
  isInternal: integer('is_internal', { mode: 'boolean' }).default(true), // Internal vs client-visible
  parentCommentId: integer('parent_comment_id').references((): any => documentComments.id),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

// ─── Document Signatures ───
export const documentSignatures = sqliteTable('document_signatures', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  documentId: integer('document_id').notNull().references(() => documents.id),
  signerName: text('signer_name').notNull(),
  signerEmail: text('signer_email').notNull(),
  signerRole: text('signer_role'), // CLIENT, VENDOR, WITNESS, etc.
  signatureData: text('signature_data'), // Base64 signature image or digital signature
  signedAt: text('signed_at'),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  isSigned: integer('is_signed', { mode: 'boolean' }).default(false),
  signatureOrder: integer('signature_order').default(1), // For multiple signers
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// ─── CMS Tables ───

// ─── Pages (Landing, About, etc.) ───
export const pages = sqliteTable('pages', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  content: text('content'), // Rich text content
  metaTitle: text('meta_title'),
  metaDescription: text('meta_description'),
  metaKeywords: text('meta_keywords'),
  isPublished: integer('is_published', { mode: 'boolean' }).default(false),
  publishedAt: text('published_at'),
  featuredImage: text('featured_image'),
  template: text('template').default('default'), // page template type
  order: integer('order').default(0),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

// ─── Blog Posts ───
export const blogPosts = sqliteTable('blog_posts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  excerpt: text('excerpt'),
  content: text('content').notNull(), // Rich text content
  featuredImage: text('featured_image'),
  imageCredit: text('image_credit'),
  authorId: integer('author_id').notNull().references(() => users.id),
  categoryId: integer('category_id').references((): any => blogCategories.id),
  tags: text('tags'), // JSON array of tags
  metaTitle: text('meta_title'),
  metaDescription: text('meta_description'),
  metaKeywords: text('meta_keywords'),
  isPublished: integer('is_published', { mode: 'boolean' }).default(false),
  publishedAt: text('published_at'),
  viewCount: integer('view_count').default(0),
  readingTime: integer('reading_time'), // estimated reading time in minutes
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

// ─── Blog Categories ───
export const blogCategories = sqliteTable('blog_categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  color: text('color').default('#3b82f6'),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// ─── Portfolio Items (from Projects) ───
export const portfolioItems = sqliteTable('portfolio_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  projectId: integer('project_id').notNull().references(() => projects.id),
  title: text('title').notNull(),
  description: text('description'),
  content: text('content'), // Rich text content with project details
  featuredImage: text('featured_image'),
  gallery: text('gallery'), // JSON array of image URLs
  technologies: text('technologies'), // JSON array of technologies used
  projectUrl: text('project_url'), // Live project URL
  githubUrl: text('github_url'), // GitHub repository URL
  category: text('category'), // WEB, MOBILE, DESKTOP, DESIGN, etc.
  isPublished: integer('is_published', { mode: 'boolean' }).default(false),
  publishedAt: text('published_at'),
  order: integer('order').default(0),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

// ─── Media Library ───
export const mediaFiles = sqliteTable('media_files', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  fileName: text('file_name').notNull(),
  originalName: text('original_name').notNull(),
  fileUrl: text('file_url').notNull(),
  fileSize: integer('file_size'), // in bytes
  fileType: text('file_type').notNull(), // image, video, document, etc.
  mimeType: text('mime_type').notNull(),
  width: integer('width'), // for images
  height: integer('height'), // for images
  altText: text('alt_text'),
  caption: text('caption'),
  uploadedById: integer('uploaded_by_id').notNull().references(() => users.id),
  folder: text('folder').default('uploads'), // organize files in folders
  isPublic: integer('is_public', { mode: 'boolean' }).default(true),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// ─── Site Settings ───
export const siteSettings = sqliteTable('site_settings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  key: text('key').notNull().unique(),
  value: text('value'),
  type: text('type').default('text'), // text, number, boolean, json, image
  group: text('group').default('general'), // general, seo, social, contact, etc.
  label: text('label').notNull(),
  description: text('description'),
  order: integer('order').default(0),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

// ─── Contact Form Submissions ───
export const contactSubmissions = sqliteTable('contact_submissions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email').notNull(),
  subject: text('subject'),
  message: text('message').notNull(),
  phone: text('phone'),
  company: text('company'),
  isRead: integer('is_read', { mode: 'boolean' }).default(false),
  isReplied: integer('is_replied', { mode: 'boolean' }).default(false),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// ─── CMS Relations ───
export const pagesRelations = relations(pages, ({ many }) => ({
  // Add relations if needed
}));

export const blogPostsRelations = relations(blogPosts, ({ one, many }) => ({
  author: one(users, {
    fields: [blogPosts.authorId],
    references: [users.id],
  }),
  category: one(blogCategories, {
    fields: [blogPosts.categoryId],
    references: [blogCategories.id],
  }),
}));

export const blogCategoriesRelations = relations(blogCategories, ({ many }) => ({
  posts: many(blogPosts),
}));

export const portfolioItemsRelations = relations(portfolioItems, ({ one }) => ({
  project: one(projects, {
    fields: [portfolioItems.projectId],
    references: [projects.id],
  }),
}));

export const mediaFilesRelations = relations(mediaFiles, ({ one }) => ({
  uploadedBy: one(users, {
    fields: [mediaFiles.uploadedById],
    references: [users.id],
  }),
}));

// ─── CMS Types ───
export type Page = typeof pages.$inferSelect;
export type NewPage = typeof pages.$inferInsert;

export type BlogPost = typeof blogPosts.$inferSelect;
export type NewBlogPost = typeof blogPosts.$inferInsert;

export type BlogCategory = typeof blogCategories.$inferSelect;
export type NewBlogCategory = typeof blogCategories.$inferInsert;

export type PortfolioItem = typeof portfolioItems.$inferSelect;
export type NewPortfolioItem = typeof portfolioItems.$inferInsert;

export type MediaFile = typeof mediaFiles.$inferSelect;
export type NewMediaFile = typeof mediaFiles.$inferInsert;

export type SiteSetting = typeof siteSettings.$inferSelect;
export type NewSiteSetting = typeof siteSettings.$inferInsert;

export type ContactSubmission = typeof contactSubmissions.$inferSelect;
export type NewContactSubmission = typeof contactSubmissions.$inferInsert;

// ─── Extended Types with Relations ───
export type ProjectWithRelations = Project & {
  client?: Client;
  user?: User;
};

export type BlogPostWithRelations = BlogPost & {
  author: User;
  category?: BlogCategory;
};

export type PortfolioItemWithRelations = PortfolioItem & {
  project: ProjectWithRelations;
};

// ─── Document Types ───
export type Document = typeof documents.$inferSelect;
export type NewDocument = typeof documents.$inferInsert;

export type DocumentRevision = typeof documentRevisions.$inferSelect;
export type NewDocumentRevision = typeof documentRevisions.$inferInsert;

export type DocumentComment = typeof documentComments.$inferSelect;
export type NewDocumentComment = typeof documentComments.$inferInsert;

export type DocumentSignature = typeof documentSignatures.$inferSelect;
export type NewDocumentSignature = typeof documentSignatures.$inferInsert;

// ─── Document Relations ───
export const documentsRelations = relations(documents, ({ one, many }) => ({
  project: one(projects, {
    fields: [documents.projectId],
    references: [projects.id],
  }),
  client: one(clients, {
    fields: [documents.clientId],
    references: [clients.id],
  }),
  user: one(users, {
    fields: [documents.userId],
    references: [users.id],
  }),
  approver: one(users, {
    fields: [documents.approvedBy],
    references: [users.id],
  }),
  parentDocument: one(documents, {
    fields: [documents.parentDocumentId],
    references: [documents.id],
  }),
  revisions: many(documentRevisions),
  comments: many(documentComments),
  signatures: many(documentSignatures),
}));

export const documentRevisionsRelations = relations(documentRevisions, ({ one }) => ({
  document: one(documents, {
    fields: [documentRevisions.documentId],
    references: [documents.id],
  }),
  revisedBy: one(users, {
    fields: [documentRevisions.revisedBy],
    references: [users.id],
  }),
}));

export const documentCommentsRelations = relations(documentComments, ({ one }) => ({
  document: one(documents, {
    fields: [documentComments.documentId],
    references: [documents.id],
  }),
  user: one(users, {
    fields: [documentComments.userId],
    references: [users.id],
  }),
  parentComment: one(documentComments, {
    fields: [documentComments.parentCommentId],
    references: [documentComments.id],
  }),
}));

export const documentSignaturesRelations = relations(documentSignatures, ({ one }) => ({
  document: one(documents, {
    fields: [documentSignatures.documentId],
    references: [documents.id],
  }),
}));

// ─── Extended Document Types with Relations ───
export type DocumentWithRelations = Document & {
  project?: Project;
  client?: Client;
  user?: User;
  approver?: User;
  revisions?: DocumentRevision[];
  comments?: DocumentComment[];
  signatures?: DocumentSignature[];
};

// ─── Email System ───

// ─── Emails ───
export const emails = sqliteTable('emails', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  messageId: text('message_id').unique(), // Unique identifier from email provider
  threadId: text('thread_id'), // For grouping related emails
  
  // Email addresses
  from: text('from').notNull(),
  fromName: text('from_name'),
  to: text('to').notNull(), // JSON array of recipients
  cc: text('cc'), // JSON array of CC recipients
  bcc: text('bcc'), // JSON array of BCC recipients
  replyTo: text('reply_to'),
  
  // Content
  subject: text('subject').notNull(),
  textContent: text('text_content'), // Plain text version
  htmlContent: text('html_content'), // HTML version
  preview: text('preview'), // Short preview text
  
  // Metadata
  folder: text('folder').default('inbox'), // inbox, sent, drafts, archive, trash, spam
  isRead: integer('is_read', { mode: 'boolean' }).default(false),
  isStarred: integer('is_starred', { mode: 'boolean' }).default(false),
  isImportant: integer('is_important', { mode: 'boolean' }).default(false),
  isDraft: integer('is_draft', { mode: 'boolean' }).default(false),
  
  // Labels and categories
  labels: text('labels'), // JSON array of labels
  category: text('category'), // primary, social, promotions, updates, forums
  
  // Provider data
  providerData: text('provider_data'), // JSON data from email provider
  deliveryStatus: text('delivery_status'), // sent, delivered, failed, bounced
  
  // Dates
  sentAt: text('sent_at'),
  receivedAt: text('received_at'),
  
  // Attachments
  hasAttachments: integer('has_attachments', { mode: 'boolean' }).default(false),
  attachmentCount: integer('attachment_count').default(0),
  
  // Threading
  inReplyTo: text('in_reply_to'), // Message-ID this email is replying to
  references: text('references'), // JSON array of referenced Message-IDs
  
  // User association
  userId: integer('user_id').notNull().references(() => users.id),
  
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

// ─── Email Attachments ───
export const emailAttachments = sqliteTable('email_attachments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  emailId: integer('email_id').notNull().references(() => emails.id),
  fileName: text('file_name').notNull(),
  originalName: text('original_name').notNull(),
  fileUrl: text('file_url').notNull(),
  fileSize: integer('file_size'), // in bytes
  mimeType: text('mime_type').notNull(),
  contentId: text('content_id'), // For inline attachments
  isInline: integer('is_inline', { mode: 'boolean' }).default(false),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// ─── Email Labels ───
export const emailLabels = sqliteTable('email_labels', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  color: text('color').default('#3b82f6'),
  isSystem: integer('is_system', { mode: 'boolean' }).default(false), // System vs user-created
  userId: integer('user_id').notNull().references(() => users.id),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// ─── Email Drafts ───
export const emailDrafts = sqliteTable('email_drafts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  to: text('to').notNull(),
  cc: text('cc'),
  bcc: text('bcc'),
  subject: text('subject').notNull(),
  textContent: text('text_content'),
  htmlContent: text('html_content'),
  attachments: text('attachments'), // JSON array of attachment IDs
  replyToEmailId: integer('reply_to_email_id').references(() => emails.id),
  forwardEmailId: integer('forward_email_id').references(() => emails.id),
  userId: integer('user_id').notNull().references(() => users.id),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

// ─── Email Provider Settings ───
export const emailProviderSettings = sqliteTable('email_provider_settings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  provider: text('provider').notNull(), // resend, sendgrid, mailgun, smtp, etc.
  isActive: integer('is_active', { mode: 'boolean' }).default(false),
  settings: text('settings').notNull(), // JSON encrypted settings
  fromEmail: text('from_email').notNull(),
  fromName: text('from_name'),
  replyToEmail: text('reply_to_email'),
  userId: integer('user_id').notNull().references(() => users.id),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

// ─── Email Relations ───
export const emailsRelations = relations(emails, ({ one, many }) => ({
  user: one(users, {
    fields: [emails.userId],
    references: [users.id],
  }),
  attachments: many(emailAttachments),
  replyTo: one(emails, {
    fields: [emails.inReplyTo],
    references: [emails.messageId],
  }),
}));

export const emailAttachmentsRelations = relations(emailAttachments, ({ one }) => ({
  email: one(emails, {
    fields: [emailAttachments.emailId],
    references: [emails.id],
  }),
}));

export const emailLabelsRelations = relations(emailLabels, ({ one }) => ({
  user: one(users, {
    fields: [emailLabels.userId],
    references: [users.id],
  }),
}));

export const emailDraftsRelations = relations(emailDrafts, ({ one }) => ({
  user: one(users, {
    fields: [emailDrafts.userId],
    references: [users.id],
  }),
  replyToEmail: one(emails, {
    fields: [emailDrafts.replyToEmailId],
    references: [emails.id],
  }),
  forwardEmail: one(emails, {
    fields: [emailDrafts.forwardEmailId],
    references: [emails.id],
  }),
}));

export const emailProviderSettingsRelations = relations(emailProviderSettings, ({ one }) => ({
  user: one(users, {
    fields: [emailProviderSettings.userId],
    references: [users.id],
  }),
}));

// ─── Email Types ───
export type Email = typeof emails.$inferSelect;
export type NewEmail = typeof emails.$inferInsert;

export type EmailAttachment = typeof emailAttachments.$inferSelect;
export type NewEmailAttachment = typeof emailAttachments.$inferInsert;

export type EmailLabel = typeof emailLabels.$inferSelect;
export type NewEmailLabel = typeof emailLabels.$inferInsert;

export type EmailDraft = typeof emailDrafts.$inferSelect;
export type NewEmailDraft = typeof emailDrafts.$inferInsert;

export type EmailProviderSetting = typeof emailProviderSettings.$inferSelect;
export type NewEmailProviderSetting = typeof emailProviderSettings.$inferInsert;

// ─── Extended Email Types ───
export type EmailWithRelations = Email & {
  user?: User;
  attachments?: EmailAttachment[];
};

// ─── Analytics & Traffic Tables ───

// Page views and sessions tracking
export const pageViews = sqliteTable('page_views', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  sessionId: text('session_id').notNull(),
  userId: integer('user_id').references(() => users.id),
  path: text('path').notNull(),
  title: text('title'),
  referrer: text('referrer'),
  userAgent: text('user_agent'),
  ip: text('ip'),
  country: text('country'),
  city: text('city'),
  device: text('device'), // desktop, mobile, tablet
  browser: text('browser'),
  os: text('os'),
  source: text('source'), // direct, search, social, referral
  medium: text('medium'),
  campaign: text('campaign'),
  duration: integer('duration'), // time spent on page in seconds
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// User sessions tracking
export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(), // session ID
  userId: integer('user_id').references(() => users.id),
  ip: text('ip'),
  userAgent: text('user_agent'),
  country: text('country'),
  city: text('city'),
  device: text('device'),
  browser: text('browser'),
  os: text('os'),
  source: text('source'),
  medium: text('medium'),
  campaign: text('campaign'),
  landingPage: text('landing_page'),
  exitPage: text('exit_page'),
  pageCount: integer('page_count').default(1),
  duration: integer('duration'), // session duration in seconds
  bounced: integer('bounced', { mode: 'boolean' }).default(false),
  converted: integer('converted', { mode: 'boolean' }).default(false),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

// API requests tracking
export const apiRequests = sqliteTable('api_requests', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  sessionId: text('session_id'),
  userId: integer('user_id').references(() => users.id),
  method: text('method').notNull(), // GET, POST, PUT, DELETE
  path: text('path').notNull(),
  statusCode: integer('status_code').notNull(),
  responseTime: integer('response_time'), // in milliseconds
  userAgent: text('user_agent'),
  ip: text('ip'),
  referer: text('referer'),
  errorMessage: text('error_message'),
  requestSize: integer('request_size'), // in bytes
  responseSize: integer('response_size'), // in bytes
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Daily aggregated statistics for faster queries
export const dailyStats = sqliteTable('daily_stats', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  date: text('date').notNull().unique(), // YYYY-MM-DD format
  totalSessions: integer('total_sessions').default(0),
  totalPageViews: integer('total_page_views').default(0),
  totalApiRequests: integer('total_api_requests').default(0),
  uniqueVisitors: integer('unique_visitors').default(0),
  desktopSessions: integer('desktop_sessions').default(0),
  mobileSessions: integer('mobile_sessions').default(0),
  tabletSessions: integer('tablet_sessions').default(0),
  bounceRate: real('bounce_rate').default(0), // percentage
  avgSessionDuration: real('avg_session_duration').default(0), // in seconds
  avgPageViews: real('avg_page_views').default(0),
  topPage: text('top_page'),
  topSource: text('top_source'),
  topCountry: text('top_country'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

// Real-time visitor tracking
export const activeVisitors = sqliteTable('active_visitors', {
  sessionId: text('session_id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  currentPage: text('current_page'),
  ip: text('ip'),
  country: text('country'),
  city: text('city'),
  device: text('device'),
  browser: text('browser'),
  source: text('source'),
  lastSeen: text('last_seen').default(sql`CURRENT_TIMESTAMP`),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// ─── Analytics Relations ───
export const pageViewsRelations = relations(pageViews, ({ one }) => ({
  user: one(users, {
    fields: [pageViews.userId],
    references: [users.id],
  }),
  session: one(sessions, {
    fields: [pageViews.sessionId],
    references: [sessions.id],
  }),
}));

export const sessionsRelations = relations(sessions, ({ one, many }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
  pageViews: many(pageViews),
}));

export const apiRequestsRelations = relations(apiRequests, ({ one }) => ({
  user: one(users, {
    fields: [apiRequests.userId],
    references: [users.id],
  }),
}));

export const activeVisitorsRelations = relations(activeVisitors, ({ one }) => ({
  user: one(users, {
    fields: [activeVisitors.userId],
    references: [users.id],
  }),
}));

// ─── Analytics Types ───
export type PageView = typeof pageViews.$inferSelect;
export type NewPageView = typeof pageViews.$inferInsert;

export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;

export type ApiRequest = typeof apiRequests.$inferSelect;
export type NewApiRequest = typeof apiRequests.$inferInsert;

export type DailyStat = typeof dailyStats.$inferSelect;
export type NewDailyStat = typeof dailyStats.$inferInsert;

export type ActiveVisitor = typeof activeVisitors.$inferSelect;
export type NewActiveVisitor = typeof activeVisitors.$inferInsert;

// ─── Tools Tables ───

// ─── URL Shortener ───
export const shortenedUrls = sqliteTable('shortened_urls', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  originalUrl: text('original_url').notNull(),
  shortCode: text('short_code').notNull().unique(),
  customAlias: text('custom_alias').unique(),
  description: text('description'),
  
  // Analytics
  clicks: integer('clicks').default(0),
  uniqueClicks: integer('unique_clicks').default(0),
  lastClickedAt: text('last_clicked_at'),
  
  // Settings
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  expiresAt: text('expires_at'),
  password: text('password'), // Optional password protection
  
  // QR Code integration
  qrCodeUrl: text('qr_code_url'),
  
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

// ─── URL Click Tracking ───
export const urlClicks = sqliteTable('url_clicks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  shortenedUrlId: integer('shortened_url_id').notNull().references(() => shortenedUrls.id),
  ip: text('ip'),
  userAgent: text('user_agent'),
  referer: text('referer'),
  country: text('country'),
  city: text('city'),
  device: text('device'),
  browser: text('browser'),
  os: text('os'),
  clickedAt: text('clicked_at').default(sql`CURRENT_TIMESTAMP`),
});

// ─── QR Codes ───
export const qrCodes = sqliteTable('qr_codes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  name: text('name').notNull(),
  type: text('type').notNull(), // url, text, wifi, contact, email, phone, sms, location
  data: text('data').notNull(), // The actual data encoded in QR
  
  // Visual settings
  size: integer('size').default(256),
  foregroundColor: text('foreground_color').default('#000000'),
  backgroundColor: text('background_color').default('#ffffff'),
  errorCorrectionLevel: text('error_correction_level').default('M'), // L, M, Q, H
  
  // File info
  qrCodeUrl: text('qr_code_url').notNull(),
  format: text('format').default('png'), // png, svg, pdf
  
  // Analytics
  scans: integer('scans').default(0),
  lastScannedAt: text('last_scanned_at'),
  
  // Associated with URL shortener
  shortenedUrlId: integer('shortened_url_id').references(() => shortenedUrls.id),
  
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

// ─── QR Code Scans ───
export const qrCodeScans = sqliteTable('qr_code_scans', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  qrCodeId: integer('qr_code_id').notNull().references(() => qrCodes.id),
  ip: text('ip'),
  userAgent: text('user_agent'),
  country: text('country'),
  city: text('city'),
  device: text('device'),
  browser: text('browser'),
  os: text('os'),
  scannedAt: text('scanned_at').default(sql`CURRENT_TIMESTAMP`),
});

// ─── Document Signing ───
export const signingRequests = sqliteTable('signing_requests', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  
  // Document info
  documentName: text('document_name').notNull(),
  documentUrl: text('document_url').notNull(),
  documentSize: integer('document_size'),
  documentType: text('document_type'),
  
  // Request details
  title: text('title').notNull(),
  message: text('message'),
  status: text('status').default('draft'), // draft, sent, partially_signed, signed, expired, declined, cancelled
  
  // Signing settings
  expiresAt: text('expires_at').notNull(),
  reminderEnabled: integer('reminder_enabled', { mode: 'boolean' }).default(true),
  reminderDays: integer('reminder_days').default(3),
  
  // Workflow
  signingOrder: text('signing_order').default('parallel'), // parallel, sequential
  requiresAllSignatures: integer('requires_all_signatures', { mode: 'boolean' }).default(true),
  
  // Tracking
  sentAt: text('sent_at'),
  completedAt: text('completed_at'),
  
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

// ─── Document Signers ───
export const documentSigners = sqliteTable('document_signers', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  signingRequestId: integer('signing_request_id').notNull().references(() => signingRequests.id),
  
  // Signer info
  name: text('name').notNull(),
  email: text('email').notNull(),
  role: text('role').default('Signer'),
  
  // Signing details
  status: text('status').default('pending'), // pending, signed, declined, expired
  signedAt: text('signed_at'),
  declinedAt: text('declined_at'),
  declineReason: text('decline_reason'),
  
  // Digital signature
  signatureData: text('signature_data'), // Base64 signature image
  signatureType: text('signature_type'), // drawn, typed, uploaded
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  
  // Access control
  accessToken: text('access_token').notNull().unique(),
  accessedAt: text('accessed_at'),
  accessCount: integer('access_count').default(0),
  
  // Order for sequential signing
  signingOrder: integer('signing_order').default(1),
  
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

// ─── Signing Events ───
export const signingEvents = sqliteTable('signing_events', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  signingRequestId: integer('signing_request_id').notNull().references(() => signingRequests.id),
  signerId: integer('signer_id').references(() => documentSigners.id),
  
  eventType: text('event_type').notNull(), // created, sent, viewed, signed, declined, expired, reminded
  eventData: text('event_data'), // JSON data for the event
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// ─── Tools Relations ───
export const shortenedUrlsRelations = relations(shortenedUrls, ({ one, many }) => ({
  user: one(users, {
    fields: [shortenedUrls.userId],
    references: [users.id],
  }),
  clicks: many(urlClicks),
  qrCode: one(qrCodes, {
    fields: [shortenedUrls.id],
    references: [qrCodes.shortenedUrlId],
  }),
}));

export const urlClicksRelations = relations(urlClicks, ({ one }) => ({
  shortenedUrl: one(shortenedUrls, {
    fields: [urlClicks.shortenedUrlId],
    references: [shortenedUrls.id],
  }),
}));

export const qrCodesRelations = relations(qrCodes, ({ one, many }) => ({
  user: one(users, {
    fields: [qrCodes.userId],
    references: [users.id],
  }),
  shortenedUrl: one(shortenedUrls, {
    fields: [qrCodes.shortenedUrlId],
    references: [shortenedUrls.id],
  }),
  scans: many(qrCodeScans),
}));

export const qrCodeScansRelations = relations(qrCodeScans, ({ one }) => ({
  qrCode: one(qrCodes, {
    fields: [qrCodeScans.qrCodeId],
    references: [qrCodes.id],
  }),
}));

export const signingRequestsRelations = relations(signingRequests, ({ one, many }) => ({
  user: one(users, {
    fields: [signingRequests.userId],
    references: [users.id],
  }),
  signers: many(documentSigners),
  events: many(signingEvents),
}));

export const documentSignersRelations = relations(documentSigners, ({ one, many }) => ({
  signingRequest: one(signingRequests, {
    fields: [documentSigners.signingRequestId],
    references: [signingRequests.id],
  }),
  events: many(signingEvents),
}));

export const signingEventsRelations = relations(signingEvents, ({ one }) => ({
  signingRequest: one(signingRequests, {
    fields: [signingEvents.signingRequestId],
    references: [signingRequests.id],
  }),
  signer: one(documentSigners, {
    fields: [signingEvents.signerId],
    references: [documentSigners.id],
  }),
}));

// ─── Tools Types ───
export type ShortenedUrl = typeof shortenedUrls.$inferSelect;
export type NewShortenedUrl = typeof shortenedUrls.$inferInsert;

export type UrlClick = typeof urlClicks.$inferSelect;
export type NewUrlClick = typeof urlClicks.$inferInsert;

export type QrCode = typeof qrCodes.$inferSelect;
export type NewQrCode = typeof qrCodes.$inferInsert;

export type QrCodeScan = typeof qrCodeScans.$inferSelect;
export type NewQrCodeScan = typeof qrCodeScans.$inferInsert;

export type SigningRequest = typeof signingRequests.$inferSelect;
export type NewSigningRequest = typeof signingRequests.$inferInsert;

export type DocumentSigner = typeof documentSigners.$inferSelect;
export type NewDocumentSigner = typeof documentSigners.$inferInsert;

export type SigningEvent = typeof signingEvents.$inferSelect;
export type NewSigningEvent = typeof signingEvents.$inferInsert;

// ─── Extended Tools Types ───
export type ShortenedUrlWithRelations = ShortenedUrl & {
  user?: User;
  clicks?: UrlClick[];
  qrCode?: QrCode;
};

export type QrCodeWithRelations = QrCode & {
  user?: User;
  shortenedUrl?: ShortenedUrl;
  scans?: QrCodeScan[];
};

export type SigningRequestWithRelations = SigningRequest & {
  user?: User;
  signers?: DocumentSigner[];
  events?: SigningEvent[];
}; 