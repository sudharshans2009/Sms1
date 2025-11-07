import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/announcements
export async function GET(request: NextRequest) {
  try {
    const announcements = await prisma.announcement.findMany({
      orderBy: { createdAt: 'desc' },
    });
    
    return NextResponse.json({ success: true, data: announcements });
  } catch (error) {
    console.error('Error fetching announcements:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch announcements' },
      { status: 500 }
    );
  }
}

// POST /api/announcements
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.title || !body.content) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: title, content' },
        { status: 400 }
      );
    }

    const announcement = await prisma.announcement.create({
      data: {
        title: body.title,
        content: body.content,
        priority: body.priority || 'NORMAL',
        target: body.target || 'ALL',
      },
    });
    
    return NextResponse.json({ success: true, data: announcement });
  } catch (error) {
    console.error('Error adding announcement:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add announcement' },
      { status: 500 }
    );
  }
}

// PUT /api/announcements
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.id) {
      return NextResponse.json(
        { success: false, error: 'Missing announcement ID' },
        { status: 400 }
      );
    }

    const announcement = await prisma.announcement.update({
      where: { id: body.id },
      data: {
        title: body.title,
        content: body.content,
        priority: body.priority,
        target: body.target,
      },
    });
    
    return NextResponse.json({ success: true, data: announcement });
  } catch (error) {
    console.error('Error updating announcement:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update announcement' },
      { status: 500 }
    );
  }
}

// DELETE /api/announcements
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Missing announcement ID' },
        { status: 400 }
      );
    }

    await prisma.announcement.delete({
      where: { id },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting announcement:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete announcement' },
      { status: 500 }
    );
  }
}
