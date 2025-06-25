import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'edge';
import { db } from '@/lib/db';
import { blogPosts, blogCategories, users } from '@/lib/schema';
import { eq, and, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const published = searchParams.get('published');
    const categoryId = searchParams.get('categoryId');
    
    let conditions = [];
    if (published !== null) {
      conditions.push(eq(blogPosts.isPublished, published === 'true'));
    }
    if (categoryId) {
      conditions.push(eq(blogPosts.categoryId, parseInt(categoryId)));
    }

    const query = db.select({
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
    .orderBy(desc(blogPosts.createdAt));

    const posts = conditions.length > 0
      ? await query.where(conditions.length > 1 ? and(...conditions) : conditions[0])
      : await query;

    return NextResponse.json({ posts });
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog posts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Check if slug already exists
    const existingPost = await db.select()
      .from(blogPosts)
      .where(eq(blogPosts.slug, body.slug))
      .limit(1);

    if (existingPost.length > 0) {
      return NextResponse.json(
        { error: 'A blog post with this slug already exists' },
        { status: 400 }
      );
    }

    const result = await db.insert(blogPosts)
      .values({
        ...body,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .returning();

    return NextResponse.json({ post: result[0] });
  } catch (error) {
    console.error('Error creating blog post:', error);
    return NextResponse.json(
      { error: 'Failed to create blog post' },
      { status: 500 }
    );
  }
} 