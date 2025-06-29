import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db-server';
import { cvs } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid CV ID' },
        { status: 400 }
      );
    }

    const [cv] = await db
      .select()
      .from(cvs)
      .where(eq(cvs.id, id))
      .limit(1);

    if (!cv) {
      return NextResponse.json(
        { error: 'CV not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(cv);
  } catch (error) {
    console.error('Failed to fetch CV:', error);
    return NextResponse.json(
      { error: 'Failed to fetch CV' },
      { status: 500 }
    );
  }
}