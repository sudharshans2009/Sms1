import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/classes
export async function GET(request: NextRequest) {
  try {
    const classes = await prisma.class.findMany({
      include: {
        teacher: true,
      },
      orderBy: [
        { class: 'asc' },
        { section: 'asc' },
      ],
    });

    // Format response to match expected structure
    const formattedClasses = classes.map((cls: any) => ({
      id: cls.id,
      name: cls.class,
      section: cls.section,
      class: cls.class,
      classTeacher: cls.teacher,
      room: cls.room,
      capacity: cls.capacity,
      students: [], // Would need to query separately if needed
      studentsCount: cls.studentsCount || 0,
    }));
    
    return NextResponse.json({ success: true, data: formattedClasses });
  } catch (error) {
    console.error('Error fetching classes:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch classes' },
      { status: 500 }
    );
  }
}

// POST /api/classes
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.section) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: name, section' },
        { status: 400 }
      );
    }

    // Check if class already exists
    const existing = await prisma.class.findFirst({
      where: {
        class: body.name,
        section: body.section,
      },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Class with this name and section already exists' },
        { status: 400 }
      );
    }

    // Create class
    const classData = await prisma.class.create({
      data: {
        class: body.name,
        section: body.section,
        classTeacher: body.classTeacher || 'TBD',
        classHead: body.classHead || 'TBD',
        teacherId: body.teacherId || null,
        room: body.room || null,
        capacity: body.capacity || null,
      },
      include: {
        teacher: true,
      },
    });

    return NextResponse.json({ success: true, data: classData });
  } catch (error) {
    console.error('Error adding class:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add class' },
      { status: 500 }
    );
  }
}
