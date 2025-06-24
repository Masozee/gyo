import { 
  Page, NewPage, 
  BlogPost, NewBlogPost, BlogPostWithRelations,
  BlogCategory, NewBlogCategory,
  PortfolioItem, NewPortfolioItem, PortfolioItemWithRelations,
  MediaFile, NewMediaFile,
  SiteSetting, NewSiteSetting,
  ContactSubmission, NewContactSubmission
} from '../schema';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

// ─── Pages API ───
export async function getPages(published?: boolean): Promise<Page[]> {
  const params = new URLSearchParams();
  if (published !== undefined) params.append('published', published.toString());

  const response = await fetch(`${API_BASE_URL}/cms/pages?${params.toString()}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch pages: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.pages || [];
}

export async function getPage(slug: string): Promise<Page> {
  const response = await fetch(`${API_BASE_URL}/cms/pages/${slug}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch page: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.page;
}

export async function createPage(pageData: Omit<NewPage, 'createdAt' | 'updatedAt'>): Promise<Page> {
  const response = await fetch(`${API_BASE_URL}/cms/pages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(pageData),
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create page: ${error}`);
  }
  
  const data = await response.json();
  return data.page;
}

export async function updatePage(id: number, pageData: Partial<NewPage>): Promise<Page> {
  const response = await fetch(`${API_BASE_URL}/cms/pages/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(pageData),
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to update page: ${error}`);
  }
  
  const data = await response.json();
  return data.page;
}

export async function deletePage(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/cms/pages/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error(`Failed to delete page: ${response.statusText}`);
  }
}

// ─── Blog Categories API ───
export async function getBlogCategories(): Promise<BlogCategory[]> {
  const response = await fetch(`${API_BASE_URL}/cms/blog/categories`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch blog categories: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.categories || [];
}

export async function createBlogCategory(categoryData: Omit<NewBlogCategory, 'createdAt'>): Promise<BlogCategory> {
  const response = await fetch(`${API_BASE_URL}/cms/blog/categories`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(categoryData),
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create blog category: ${error}`);
  }
  
  const data = await response.json();
  return data.category;
}

// ─── Blog Posts API ───
export async function getBlogPosts(published?: boolean, categoryId?: number): Promise<BlogPostWithRelations[]> {
  const params = new URLSearchParams();
  if (published !== undefined) params.append('published', published.toString());
  if (categoryId) params.append('categoryId', categoryId.toString());

  const response = await fetch(`${API_BASE_URL}/cms/blog/posts?${params.toString()}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch blog posts: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.posts || [];
}

export async function getBlogPost(slug: string): Promise<BlogPostWithRelations> {
  const response = await fetch(`${API_BASE_URL}/cms/blog/posts/by-slug/${slug}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch blog post: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.post;
}

export async function getBlogPostById(id: number): Promise<BlogPostWithRelations> {
  const response = await fetch(`${API_BASE_URL}/cms/blog/posts/${id}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch blog post: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.post;
}

export async function createBlogPost(postData: Omit<NewBlogPost, 'createdAt' | 'updatedAt'>): Promise<BlogPost> {
  const response = await fetch(`${API_BASE_URL}/cms/blog/posts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(postData),
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create blog post: ${error}`);
  }
  
  const data = await response.json();
  return data.post;
}

export async function updateBlogPost(slug: string, postData: Partial<NewBlogPost>): Promise<BlogPost> {
  const response = await fetch(`${API_BASE_URL}/cms/blog/posts/by-slug/${slug}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(postData),
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to update blog post: ${error}`);
  }
  
  const data = await response.json();
  return data.post;
}

export async function deleteBlogPost(slug: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/cms/blog/posts/by-slug/${slug}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error(`Failed to delete blog post: ${response.statusText}`);
  }
}

// ─── Portfolio API ───
export async function getPortfolioItems(published?: boolean): Promise<PortfolioItemWithRelations[]> {
  const params = new URLSearchParams();
  if (published !== undefined) params.append('published', published.toString());

  const response = await fetch(`${API_BASE_URL}/cms/portfolio?${params.toString()}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch portfolio items: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.items || [];
}

export async function getPortfolioItem(id: number): Promise<PortfolioItemWithRelations> {
  const response = await fetch(`${API_BASE_URL}/cms/portfolio/${id}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch portfolio item: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.item;
}

export async function createPortfolioItem(itemData: Omit<NewPortfolioItem, 'createdAt' | 'updatedAt'>): Promise<PortfolioItem> {
  const response = await fetch(`${API_BASE_URL}/cms/portfolio`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(itemData),
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create portfolio item: ${error}`);
  }
  
  const data = await response.json();
  return data.item;
}

export async function updatePortfolioItem(id: number, itemData: Partial<NewPortfolioItem>): Promise<PortfolioItem> {
  const response = await fetch(`${API_BASE_URL}/cms/portfolio/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(itemData),
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to update portfolio item: ${error}`);
  }
  
  const data = await response.json();
  return data.item;
}

export async function deletePortfolioItem(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/cms/portfolio/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error(`Failed to delete portfolio item: ${response.statusText}`);
  }
}

// ─── Media API ───
export async function getMediaFiles(folder?: string): Promise<MediaFile[]> {
  const params = new URLSearchParams();
  if (folder) params.append('folder', folder);

  const response = await fetch(`${API_BASE_URL}/cms/media?${params.toString()}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch media files: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.files || [];
}

export async function uploadMediaFile(file: File, folder?: string): Promise<MediaFile> {
  const formData = new FormData();
  formData.append('file', file);
  if (folder) formData.append('folder', folder);

  const response = await fetch(`${API_BASE_URL}/cms/media/upload`, {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to upload file: ${error}`);
  }
  
  const data = await response.json();
  return data.file;
}

export async function deleteMediaFile(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/cms/media/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error(`Failed to delete media file: ${response.statusText}`);
  }
}

// ─── Site Settings API ───
export async function getSiteSettings(group?: string): Promise<SiteSetting[]> {
  const params = new URLSearchParams();
  if (group) params.append('group', group);

  const response = await fetch(`${API_BASE_URL}/cms/settings?${params.toString()}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch site settings: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.settings || [];
}

export async function updateSiteSetting(key: string, value: string): Promise<SiteSetting> {
  const response = await fetch(`${API_BASE_URL}/cms/settings/${key}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ value }),
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to update site setting: ${error}`);
  }
  
  const data = await response.json();
  return data.setting;
}

// ─── Contact API ───
export async function submitContactForm(formData: Omit<NewContactSubmission, 'createdAt'>): Promise<ContactSubmission> {
  const response = await fetch(`${API_BASE_URL}/cms/contact`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(formData),
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to submit contact form: ${error}`);
  }
  
  const data = await response.json();
  return data.submission;
}

export async function getContactSubmissions(): Promise<ContactSubmission[]> {
  const response = await fetch(`${API_BASE_URL}/cms/contact`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch contact submissions: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.submissions || [];
}

// ─── Utility Functions ───
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
} 