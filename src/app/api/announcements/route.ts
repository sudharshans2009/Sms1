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
