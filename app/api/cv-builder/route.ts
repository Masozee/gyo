import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db-server';
import { cvs } from '@/lib/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    const allCVs = await db
      .select()
      .from(cvs)
      .orderBy(desc(cvs.updatedAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({
      cvs: allCVs,
      total: allCVs.length,
    });
  } catch (error) {
    console.error('Failed to fetch CVs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch CVs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, template, data, isPublic = false } = body;

    if (!title || !template || !data) {
      return NextResponse.json(
        { error: 'Missing required fields: title, template, data' },
        { status: 400 }
      );
    }

    // Generate a file name
    const fileName = `${title.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.pdf`;

    const [newCV] = await db
      .insert(cvs)
      .values({
        title,
        template,
        data,
        fileName,
        isPublic,
        // Note: fileUrl will be set when PDF is generated
      })
      .returning();

    return NextResponse.json({ 
      success: true, 
      cv: newCV,
      id: newCV.id 
    });
  } catch (error) {
    console.error('Failed to create CV:', error);
    return NextResponse.json(
      { error: 'Failed to create CV' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, title, template, data, isPublic } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'CV ID is required' },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (template !== undefined) updateData.template = template;
    if (data !== undefined) updateData.data = data;
    if (isPublic !== undefined) updateData.isPublic = isPublic;
    
    updateData.updatedAt = new Date();

    const [updatedCV] = await db
      .update(cvs)
      .set(updateData)
      .where(eq(cvs.id, id))
      .returning();

    if (!updatedCV) {
      return NextResponse.json(
        { error: 'CV not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      cv: updatedCV 
    });
  } catch (error) {
    console.error('Failed to update CV:', error);
    return NextResponse.json(
      { error: 'Failed to update CV' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'CV ID is required' },
        { status: 400 }
      );
    }

    const [deletedCV] = await db
      .delete(cvs)
      .where(eq(cvs.id, parseInt(id)))
      .returning();

    if (!deletedCV) {
      return NextResponse.json(
        { error: 'CV not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'CV deleted successfully' 
    });
  } catch (error) {
    console.error('Failed to delete CV:', error);
    return NextResponse.json(
      { error: 'Failed to delete CV' },
      { status: 500 }
    );
  }
}