import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/classes/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const classItem = await prisma.class.findUnique({
      where: { id: params.id },
      include: {
        teacher: true,
        students: {
          select: {
            id: true,
            name: true,
            rollNumber: true,
          },
        },
      },
    });

    if (!classItem) {
      return NextResponse.json(
        { success: false, error: 'Class not found' },
        { status: 404 }
      );
    }

    // Format response to match expected structure
    const formattedClass = {
      id: classItem.id,
      name: classItem.class,
      section: classItem.section,
      class: classItem.class,
      classTeacher: classItem.teacher,
      classTeacherId: classItem.teacherId,
      room: classItem.room,
      capacity: classItem.capacity,
      students: classItem.students,
      studentsCount: classItem.students.length,
    };
    
    return NextResponse.json({ success: true, data: formattedClass });
  } catch (error) {
    console.error('Error fetching class:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch class' },
      { status: 500 }
    );
  }
}

// PUT /api/classes/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    console.log('📤 Updating class:', params.id, body);
    
    // Validate required fields
    if (!body.name || !body.section) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: name, section' },
        { status: 400 }
      );
    }

    // Check if class exists
    const existing = await prisma.class.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Class not found' },
        { status: 404 }
      );
    }

    // Check if another class has the same name/section combination
    const duplicate = await prisma.class.findFirst({
      where: {
        class: body.name,
        section: body.section,
        id: { not: params.id }, // Exclude current class
      },
    });

    if (duplicate) {
      return NextResponse.json(
        { success: false, error: 'Another class with this name and section already exists' },
        { status: 400 }
      );
    }

    // Update class
    const updatedClass = await prisma.class.update({
      where: { id: params.id },
      data: {
        class: body.name,
        section: body.section,
        teacherId: body.teacherId || null,
        room: body.room || null,
        capacity: body.capacity || null,
      },
      include: {
        teacher: true,
        students: {
          select: {
            id: true,
            name: true,
            rollNumber: true,
          },
        },
      },
    });

    console.log('✅ Class updated successfully:', updatedClass.id);
    return NextResponse.json({ success: true, data: updatedClass });
  } catch (error) {
    console.error('❌ Error updating class:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update class' },
      { status: 500 }
    );
  }
}

// DELETE /api/classes/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🗑️ Deleting class:', params.id);
    
    // Check if class exists
    const existing = await prisma.class.findUnique({
      where: { id: params.id },
      include: {
        students: true,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Class not found' },
        { status: 404 }
      );
    }

    // Check if class has students
    if (existing.students && existing.students.length > 0) {
      return NextResponse.json(
        { success: false, error: `Cannot delete class with ${existing.students.length} students. Please reassign students first.` },
        { status: 400 }
      );
    }

    // Delete class
    await prisma.class.delete({
      where: { id: params.id },
    });

    console.log('✅ Class deleted successfully:', params.id);
    return NextResponse.json({ success: true, message: 'Class deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting class:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete class' },
      { status: 500 }
    );
  }
}