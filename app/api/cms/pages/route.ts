import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { pages } from '@/lib/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const published = searchParams.get('published');

    let result;
    
    if (published !== null) {
      result = await db.select().from(pages)
        .where(eq(pages.isPublished, published === 'true'))
        .orderBy(desc(pages.order), desc(pages.createdAt));
    } else {
      result = await db.select().from(pages)
        .orderBy(desc(pages.order), desc(pages.createdAt));
    }

    return NextResponse.json({ pages: result });
  } catch (error) {
    console.error('Error fetching pages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pages' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const newPage = {
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const result = await db.insert(pages).values(newPage).returning();

    return NextResponse.json({ page: result[0] }, { status: 201 });
  } catch (error) {
    console.error('Error creating page:', error);
    return NextResponse.json(
      { error: 'Failed to create page' },
      { status: 500 }
    );
  }
} 