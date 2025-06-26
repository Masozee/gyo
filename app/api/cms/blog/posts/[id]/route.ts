import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db-server';
import { blogPosts, blogCategories, users } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid post ID' },
        { status: 400 }
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
    .where(eq(blogPosts.id, id))
    .limit(1);

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ post: result[0] });
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog post' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid post ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    
    const updateData = {
      ...body,
      updatedAt: new Date().toISOString(),
    };

    const result = await db.update(blogPosts)
      .set(updateData)
      .where(eq(blogPosts.id, id))
      .returning();

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ post: result[0] });
  } catch (error) {
    console.error('Error updating blog post:', error);
    return NextResponse.json(
      { error: 'Failed to update blog post' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid post ID' },
        { status: 400 }
      );
    }

    const result = await db.delete(blogPosts)
      .where(eq(blogPosts.id, id))
      .returning();

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting blog post:', error);
    return NextResponse.json(
      { error: 'Failed to delete blog post' },
      { status: 500 }
    );
  }
} 