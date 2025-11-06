import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/timetable?class=5&section=A
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const classParam = searchParams.get('class');
    const section = searchParams.get('section');

    if (!classParam || !section) {
      // Return all timetables
      const allTimetables = await prisma.timetable.findMany({
        include: {
          class: true,
        },
        orderBy: {
          updatedAt: 'desc',
        },
      });
      return NextResponse.json({ success: true, data: allTimetables });
    }

    // Find the class first
    const classRecord = await prisma.class.findUnique({
      where: {
        class_section: {
          class: classParam,
          section: section,
        },
      },
    });

    if (!classRecord) {
      return NextResponse.json(
        { success: false, error: 'Class not found' },
        { status: 404 }
      );
    }

    // Return specific timetable
    const timetable = await prisma.timetable.findUnique({
      where: { classId: classRecord.id },
      include: {
        class: true,
      },
    });
    
    if (!timetable) {
      return NextResponse.json(
        { success: false, error: 'Timetable not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: timetable });
  } catch (error) {
    console.error('Error fetching timetable:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch timetable' },
      { status: 500 }
    );
  }
}

// POST /api/timetable - Create new timetable
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { class: classParam, section, schedule, updatedBy } = body;

    if (!classParam || !section || !schedule) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Find or create class
    const classRecord = await prisma.class.upsert({
      where: {
        class_section: {
          class: classParam,
          section: section,
        },
      },
      update: {},
      create: {
        class: classParam,
        section: section,
        classTeacher: updatedBy || 'Admin',
        classHead: updatedBy || 'Admin',
      },
    });

    // Create or update timetable
    const timetable = await prisma.timetable.upsert({
      where: { classId: classRecord.id },
      update: {
        schedule,
        lastUpdated: new Date(),
        updatedBy: updatedBy || 'admin',
      },
      create: {
        classId: classRecord.id,
        schedule,
        lastUpdated: new Date(),
        updatedBy: updatedBy || 'admin',
      },
      include: {
        class: true,
      },
    });

    return NextResponse.json({ success: true, data: timetable });
  } catch (error) {
    console.error('Error creating timetable:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create timetable' },
      { status: 500 }
    );
  }
}

// PUT /api/timetable - Update existing timetable
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { class: classParam, section, schedule, updatedBy } = body;

    if (!classParam || !section || !schedule) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Find class
    const classRecord = await prisma.class.findUnique({
      where: {
        class_section: {
          class: classParam,
          section: section,
        },
      },
    });

    if (!classRecord) {
      return NextResponse.json(
        { success: false, error: 'Class not found' },
        { status: 404 }
      );
    }

    // Update timetable
    const timetable = await prisma.timetable.upsert({
      where: { classId: classRecord.id },
      update: {
        schedule,
        lastUpdated: new Date(),
        updatedBy: updatedBy || 'admin',
      },
      create: {
        classId: classRecord.id,
        schedule,
        lastUpdated: new Date(),
        updatedBy: updatedBy || 'admin',
      },
      include: {
        class: true,
      },
    });

    return NextResponse.json({ success: true, data: timetable });
  } catch (error) {
    console.error('Error updating timetable:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update timetable' },
      { status: 500 }
    );
  }
}
