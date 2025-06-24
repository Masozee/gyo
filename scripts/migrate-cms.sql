-- CMS Migration: Add tables for pages, blog, portfolio, media, and settings

-- Pages table for static content (Landing, About, etc.)
CREATE TABLE IF NOT EXISTS pages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  content TEXT,
  meta_title TEXT,
  meta_description TEXT,
  meta_keywords TEXT,
  is_published INTEGER DEFAULT 0,
  published_at TEXT,
  featured_image TEXT,
  template TEXT DEFAULT 'default',
  "order" INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Blog categories
CREATE TABLE IF NOT EXISTS blog_categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT DEFAULT '#3b82f6',
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Blog posts
CREATE TABLE IF NOT EXISTS blog_posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  featured_image TEXT,
  author_id INTEGER NOT NULL REFERENCES users(id),
  category_id INTEGER REFERENCES blog_categories(id),
  tags TEXT,
  meta_title TEXT,
  meta_description TEXT,
  meta_keywords TEXT,
  is_published INTEGER DEFAULT 0,
  published_at TEXT,
  view_count INTEGER DEFAULT 0,
  reading_time INTEGER,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Portfolio items (linked to projects)
CREATE TABLE IF NOT EXISTS portfolio_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL REFERENCES projects(id),
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  featured_image TEXT,
  gallery TEXT,
  technologies TEXT,
  project_url TEXT,
  github_url TEXT,
  category TEXT,
  is_published INTEGER DEFAULT 0,
  published_at TEXT,
  "order" INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Media library
CREATE TABLE IF NOT EXISTS media_files (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  file_name TEXT NOT NULL,
  original_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  file_type TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  width INTEGER,
  height INTEGER,
  alt_text TEXT,
  caption TEXT,
  uploaded_by_id INTEGER NOT NULL REFERENCES users(id),
  folder TEXT DEFAULT 'uploads',
  is_public INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Site settings
CREATE TABLE IF NOT EXISTS site_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT NOT NULL UNIQUE,
  value TEXT,
  type TEXT DEFAULT 'text',
  "group" TEXT DEFAULT 'general',
  label TEXT NOT NULL,
  description TEXT,
  "order" INTEGER DEFAULT 0,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Contact form submissions
CREATE TABLE IF NOT EXISTS contact_submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  is_read INTEGER DEFAULT 0,
  is_replied INTEGER DEFAULT 0,
  ip_address TEXT,
  user_agent TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Insert default site settings
INSERT OR IGNORE INTO site_settings (key, value, type, "group", label, description, "order") VALUES
('site_title', 'My Portfolio', 'text', 'general', 'Site Title', 'The main title of your website', 1),
('site_description', 'Professional portfolio and blog', 'text', 'general', 'Site Description', 'Brief description of your website', 2),
('site_logo', '', 'image', 'general', 'Site Logo', 'Upload your site logo', 3),
('contact_email', '', 'text', 'contact', 'Contact Email', 'Primary contact email address', 1),
('contact_phone', '', 'text', 'contact', 'Contact Phone', 'Contact phone number', 2),
('social_github', '', 'text', 'social', 'GitHub URL', 'Your GitHub profile URL', 1),
('social_linkedin', '', 'text', 'social', 'LinkedIn URL', 'Your LinkedIn profile URL', 2),
('social_twitter', '', 'text', 'social', 'Twitter URL', 'Your Twitter profile URL', 3),
('about_title', 'About Me', 'text', 'about', 'About Title', 'Title for the about section', 1),
('about_content', '', 'text', 'about', 'About Content', 'Your about me content', 2),
('about_image', '', 'image', 'about', 'About Image', 'Your profile image', 3);

-- Insert default pages
INSERT OR IGNORE INTO pages (slug, title, content, is_published, template, "order") VALUES
('home', 'Home', '<h1>Welcome to My Portfolio</h1><p>This is the landing page content.</p>', 1, 'landing', 1),
('about', 'About Me', '<h1>About Me</h1><p>Tell your story here.</p>', 1, 'about', 2),
('contact', 'Contact', '<h1>Get In Touch</h1><p>Contact form and information.</p>', 1, 'contact', 3);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(is_published, published_at);
CREATE INDEX IF NOT EXISTS idx_blog_posts_author ON blog_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_items_published ON portfolio_items(is_published, "order");
CREATE INDEX IF NOT EXISTS idx_portfolio_items_project ON portfolio_items(project_id);
CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug);
CREATE INDEX IF NOT EXISTS idx_pages_published ON pages(is_published, "order");
CREATE INDEX IF NOT EXISTS idx_media_files_type ON media_files(file_type);
CREATE INDEX IF NOT EXISTS idx_site_settings_group ON site_settings("group", "order"); 