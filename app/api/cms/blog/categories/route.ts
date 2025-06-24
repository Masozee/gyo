import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
import { db } from '@/lib/db';
import { blogCategories } from '@/lib/schema';
import { desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const result = await db.select().from(blogCategories)
      .orderBy(desc(blogCategories.createdAt));

    return NextResponse.json({ categories: result });
  } catch (error) {
    console.error('Error fetching blog categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog categories' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const newCategory = {
      ...body,
      createdAt: new Date().toISOString(),
    };

    const result = await db.insert(blogCategories).values(newCategory).returning();

    return NextResponse.json({ category: result[0] }, { status: 201 });
  } catch (error) {
    console.error('Error creating blog category:', error);
    return NextResponse.json(
      { error: 'Failed to create blog category' },
      { status: 500 }
    );
  }
} 