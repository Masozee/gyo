import { db } from '../db';
import { blogPosts, blogCategories, users, pages, portfolioItems, projects } from '../schema';
import { eq, desc, and, like, or } from 'drizzle-orm';
import type { 
  BlogPost, 
  NewBlogPost, 
  BlogPostWithRelations,
  BlogCategory, 
  NewBlogCategory,
  Page,
  NewPage,
  PortfolioItem,
  NewPortfolioItem,
  PortfolioItemWithRelations
} from '../schema';

// ─── Blog Categories Server Functions ───
export async function getBlogCategoriesServer(): Promise<BlogCategory[]> {
  try {
    const categories = await db.select()
      .from(blogCategories)
      .where(eq(blogCategories.isActive, true))
      .orderBy(blogCategories.name);
    
    return categories;
  } catch (error) {
    console.error('Error fetching blog categories:', error);
    throw new Error('Failed to fetch blog categories');
  }
}

export async function createBlogCategoryServer(categoryData: Omit<NewBlogCategory, 'createdAt'>): Promise<BlogCategory> {
  try {
    const newCategory = {
      ...categoryData,
      createdAt: new Date().toISOString(),
    };
    
    const result = await db.insert(blogCategories).values(newCategory).returning();
    return result[0];
  } catch (error) {
    console.error('Error creating blog category:', error);
    throw new Error('Failed to create blog category');
  }
}

// ─── Blog Posts Server Functions ───
export async function getBlogPostsServer(filters?: {
  published?: boolean;
  categoryId?: number;
  search?: string;
}): Promise<BlogPostWithRelations[]> {
  try {
    let conditions = [];
    
    if (filters?.published !== undefined) {
      conditions.push(eq(blogPosts.isPublished, filters.published));
    }
    
    if (filters?.categoryId) {
      conditions.push(eq(blogPosts.categoryId, filters.categoryId));
    }
    
    if (filters?.search) {
      const searchTerm = `%${filters.search}%`;
      conditions.push(
        or(
          like(blogPosts.title, searchTerm),
          like(blogPosts.excerpt, searchTerm),
          like(blogPosts.content, searchTerm)
        )
      );
    }
    
    const result = await db.select({
      id: blogPosts.id,
      slug: blogPosts.slug,
      title: blogPosts.title,
      excerpt: blogPosts.excerpt,
      content: blogPosts.content,
      featuredImage: blogPosts.featuredImage,
      imageCredit: blogPosts.imageCredit,
      authorId: blogPosts.authorId,
      categoryId: blogPosts.categoryId,
      tags: blogPosts.tags,
      metaTitle: blogPosts.metaTitle,
      metaDescription: blogPosts.metaDescription,
      metaKeywords: blogPosts.metaKeywords,
      isPublished: blogPosts.isPublished,
      publishedAt: blogPosts.publishedAt,
      viewCount: blogPosts.viewCount,
      readingTime: blogPosts.readingTime,
      createdAt: blogPosts.createdAt,
      updatedAt: blogPosts.updatedAt,
      author: {
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
      },
      category: {
        id: blogCategories.id,
        name: blogCategories.name,
        slug: blogCategories.slug,
        color: blogCategories.color,
      }
    })
    .from(blogPosts)
    .leftJoin(users, eq(blogPosts.authorId, users.id))
    .leftJoin(blogCategories, eq(blogPosts.categoryId, blogCategories.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(blogPosts.publishedAt), desc(blogPosts.createdAt));
    
    return result as BlogPostWithRelations[];
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    throw new Error('Failed to fetch blog posts');
  }
}

export async function getBlogPostByIdServer(id: number): Promise<BlogPostWithRelations | null> {
  try {
    const result = await db.select({
      id: blogPosts.id,
      slug: blogPosts.slug,
      title: blogPosts.title,
      excerpt: blogPosts.excerpt,
      content: blogPosts.content,
      featuredImage: blogPosts.featuredImage,
      imageCredit: blogPosts.imageCredit,
      authorId: blogPosts.authorId,
      categoryId: blogPosts.categoryId,
      tags: blogPosts.tags,
      metaTitle: blogPosts.metaTitle,
      metaDescription: blogPosts.metaDescription,
      metaKeywords: blogPosts.metaKeywords,
      isPublished: blogPosts.isPublished,
      publishedAt: blogPosts.publishedAt,
      viewCount: blogPosts.viewCount,
      readingTime: blogPosts.readingTime,
      createdAt: blogPosts.createdAt,
      updatedAt: blogPosts.updatedAt,
      author: {
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
      },
      category: {
        id: blogCategories.id,
        name: blogCategories.name,
        slug: blogCategories.slug,
        color: blogCategories.color,
      }
    })
    .from(blogPosts)
    .leftJoin(users, eq(blogPosts.authorId, users.id))
    .leftJoin(blogCategories, eq(blogPosts.categoryId, blogCategories.id))
    .where(eq(blogPosts.id, id))
    .limit(1);
    
    return result[0] as BlogPostWithRelations || null;
  } catch (error) {
    console.error('Error fetching blog post by ID:', error);
    throw new Error('Failed to fetch blog post');
  }
}

export async function getBlogPostBySlugServer(slug: string): Promise<BlogPostWithRelations | null> {
  try {
    const result = await db.select({
      id: blogPosts.id,
      slug: blogPosts.slug,
      title: blogPosts.title,
      excerpt: blogPosts.excerpt,
      content: blogPosts.content,
      featuredImage: blogPosts.featuredImage,
      imageCredit: blogPosts.imageCredit,
      authorId: blogPosts.authorId,
      categoryId: blogPosts.categoryId,
      tags: blogPosts.tags,
      metaTitle: blogPosts.metaTitle,
      metaDescription: blogPosts.metaDescription,
      metaKeywords: blogPosts.metaKeywords,
      isPublished: blogPosts.isPublished,
      publishedAt: blogPosts.publishedAt,
      viewCount: blogPosts.viewCount,
      readingTime: blogPosts.readingTime,
      createdAt: blogPosts.createdAt,
      updatedAt: blogPosts.updatedAt,
      author: {
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
      },
      category: {
        id: blogCategories.id,
        name: blogCategories.name,
        slug: blogCategories.slug,
        color: blogCategories.color,
      }
    })
    .from(blogPosts)
    .leftJoin(users, eq(blogPosts.authorId, users.id))
    .leftJoin(blogCategories, eq(blogPosts.categoryId, blogCategories.id))
    .where(eq(blogPosts.slug, slug))
    .limit(1);
    
    return result[0] as BlogPostWithRelations || null;
  } catch (error) {
    console.error('Error fetching blog post by slug:', error);
    throw new Error('Failed to fetch blog post');
  }
}

export async function createBlogPostServer(postData: Omit<NewBlogPost, 'createdAt' | 'updatedAt'>): Promise<BlogPost> {
  try {
    const newPost = {
      ...postData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const result = await db.insert(blogPosts).values(newPost).returning();
    return result[0];
  } catch (error) {
    console.error('Error creating blog post:', error);
    throw new Error('Failed to create blog post');
  }
}

export async function updateBlogPostServer(id: number, postData: Partial<NewBlogPost>): Promise<BlogPost | null> {
  try {
    const updateData = {
      ...postData,
      updatedAt: new Date().toISOString(),
    };
    
    const result = await db.update(blogPosts)
      .set(updateData)
      .where(eq(blogPosts.id, id))
      .returning();
    
    return result[0] || null;
  } catch (error) {
    console.error('Error updating blog post:', error);
    throw new Error('Failed to update blog post');
  }
}

export async function deleteBlogPostServer(id: number): Promise<boolean> {
  try {
    const result = await db.delete(blogPosts)
      .where(eq(blogPosts.id, id))
      .returning();
    
    return result.length > 0;
  } catch (error) {
    console.error('Error deleting blog post:', error);
    throw new Error('Failed to delete blog post');
  }
}

// ─── Pages Server Functions ───
export async function getPagesServer(published?: boolean): Promise<Page[]> {
  try {
    let conditions = [];
    
    if (published !== undefined) {
      conditions.push(eq(pages.isPublished, published));
    }
    
    const result = await db.select()
      .from(pages)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(pages.title);
    
    return result;
  } catch (error) {
    console.error('Error fetching pages:', error);
    throw new Error('Failed to fetch pages');
  }
}

export async function getPageBySlugServer(slug: string): Promise<Page | null> {
  try {
    const result = await db.select()
      .from(pages)
      .where(eq(pages.slug, slug))
      .limit(1);
    
    return result[0] || null;
  } catch (error) {
    console.error('Error fetching page by slug:', error);
    throw new Error('Failed to fetch page');
  }
}

export async function createPageServer(pageData: Omit<NewPage, 'createdAt' | 'updatedAt'>): Promise<Page> {
  try {
    const newPage = {
      ...pageData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const result = await db.insert(pages).values(newPage).returning();
    return result[0];
  } catch (error) {
    console.error('Error creating page:', error);
    throw new Error('Failed to create page');
  }
}

export async function updatePageServer(id: number, pageData: Partial<NewPage>): Promise<Page | null> {
  try {
    const updateData = {
      ...pageData,
      updatedAt: new Date().toISOString(),
    };
    
    const result = await db.update(pages)
      .set(updateData)
      .where(eq(pages.id, id))
      .returning();
    
    return result[0] || null;
  } catch (error) {
    console.error('Error updating page:', error);
    throw new Error('Failed to update page');
  }
}

export async function deletePageServer(id: number): Promise<boolean> {
  try {
    const result = await db.delete(pages)
      .where(eq(pages.id, id))
      .returning();
    
    return result.length > 0;
  } catch (error) {
    console.error('Error deleting page:', error);
    throw new Error('Failed to delete page');
  }
}

// ─── Portfolio Server Functions ───
export async function getPortfolioItemsServer(published?: boolean): Promise<PortfolioItemWithRelations[]> {
  try {
    let conditions = [];
    
    if (published !== undefined) {
      conditions.push(eq(portfolioItems.isPublished, published));
    }
    
    const result = await db.select({
      id: portfolioItems.id,
      projectId: portfolioItems.projectId,
      title: portfolioItems.title,
      description: portfolioItems.description,
      content: portfolioItems.content,
      featuredImage: portfolioItems.featuredImage,
      gallery: portfolioItems.gallery,
      technologies: portfolioItems.technologies,
      projectUrl: portfolioItems.projectUrl,
      githubUrl: portfolioItems.githubUrl,
      category: portfolioItems.category,
      isPublished: portfolioItems.isPublished,
      publishedAt: portfolioItems.publishedAt,
      order: portfolioItems.order,
      createdAt: portfolioItems.createdAt,
      updatedAt: portfolioItems.updatedAt,
      project: {
        id: projects.id,
        title: projects.title,
        description: projects.description,
        status: projects.status,
      }
    })
    .from(portfolioItems)
    .leftJoin(projects, eq(portfolioItems.projectId, projects.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(portfolioItems.order, desc(portfolioItems.createdAt));
    
    return result as PortfolioItemWithRelations[];
  } catch (error) {
    console.error('Error fetching portfolio items:', error);
    throw new Error('Failed to fetch portfolio items');
  }
}

export async function getPortfolioItemByIdServer(id: number): Promise<PortfolioItemWithRelations | null> {
  try {
    const result = await db.select({
      id: portfolioItems.id,
      projectId: portfolioItems.projectId,
      title: portfolioItems.title,
      description: portfolioItems.description,
      content: portfolioItems.content,
      featuredImage: portfolioItems.featuredImage,
      gallery: portfolioItems.gallery,
      technologies: portfolioItems.technologies,
      projectUrl: portfolioItems.projectUrl,
      githubUrl: portfolioItems.githubUrl,
      category: portfolioItems.category,
      isPublished: portfolioItems.isPublished,
      publishedAt: portfolioItems.publishedAt,
      order: portfolioItems.order,
      createdAt: portfolioItems.createdAt,
      updatedAt: portfolioItems.updatedAt,
      project: {
        id: projects.id,
        title: projects.title,
        description: projects.description,
        status: projects.status,
      }
    })
    .from(portfolioItems)
    .leftJoin(projects, eq(portfolioItems.projectId, projects.id))
    .where(eq(portfolioItems.id, id))
    .limit(1);
    
    return result[0] as PortfolioItemWithRelations || null;
  } catch (error) {
    console.error('Error fetching portfolio item by ID:', error);
    throw new Error('Failed to fetch portfolio item');
  }
}

export async function createPortfolioItemServer(itemData: Omit<NewPortfolioItem, 'createdAt' | 'updatedAt'>): Promise<PortfolioItem> {
  try {
    const newItem = {
      ...itemData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const result = await db.insert(portfolioItems).values(newItem).returning();
    return result[0];
  } catch (error) {
    console.error('Error creating portfolio item:', error);
    throw new Error('Failed to create portfolio item');
  }
}

export async function updatePortfolioItemServer(id: number, itemData: Partial<NewPortfolioItem>): Promise<PortfolioItem | null> {
  try {
    const updateData = {
      ...itemData,
      updatedAt: new Date().toISOString(),
    };
    
    const result = await db.update(portfolioItems)
      .set(updateData)
      .where(eq(portfolioItems.id, id))
      .returning();
    
    return result[0] || null;
  } catch (error) {
    console.error('Error updating portfolio item:', error);
    throw new Error('Failed to update portfolio item');
  }
}

export async function deletePortfolioItemServer(id: number): Promise<boolean> {
  try {
    const result = await db.delete(portfolioItems)
      .where(eq(portfolioItems.id, id))
      .returning();
    
    return result.length > 0;
  } catch (error) {
    console.error('Error deleting portfolio item:', error);
    throw new Error('Failed to delete portfolio item');
  }
} 