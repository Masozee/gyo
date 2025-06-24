import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
import { db } from '@/lib/db';
import { pages } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const resolvedParams = await params;
    const result = await db.select().from(pages)
      .where(eq(pages.slug, resolvedParams.slug))
      .limit(1);

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Page not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ page: result[0] });
  } catch (error) {
    console.error('Error fetching page:', error);
    return NextResponse.json(
      { error: 'Failed to fetch page' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const resolvedParams = await params;
    const body = await request.json();
    const id = parseInt(resolvedParams.slug);
    
    const updateData = {
      ...body,
      updatedAt: new Date().toISOString(),
    };

    const result = await db.update(pages)
      .set(updateData)
      .where(eq(pages.id, id))
      .returning();

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Page not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ page: result[0] });
  } catch (error) {
    console.error('Error updating page:', error);
    return NextResponse.json(
      { error: 'Failed to update page' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.slug);
    
    const result = await db.delete(pages)
      .where(eq(pages.id, id))
      .returning();

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Page not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting page:', error);
    return NextResponse.json(
      { error: 'Failed to delete page' },
      { status: 500 }
    );
  }
} 