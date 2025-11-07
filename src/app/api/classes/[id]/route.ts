import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/classes/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const classItem = await prisma.class.findUnique({
      where: { id },
      include: {
        teacher: true,
      },
    });

    if (!classItem) {
      return NextResponse.json(
        { success: false, error: 'Class not found' },
        { status: 404 }
      );
    }

    // Get students for this class separately
    const students = await prisma.student.findMany({
      where: {
        class: classItem.class,
        section: classItem.section,
      },
      select: {
        id: true,
        name: true,
        rollNumber: true,
        studentId: true,
      },
    });

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
      students: students,
      studentsCount: students.length,
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    console.log('📤 Updating class:', id, body);
    
    // Validate required fields
    if (!body.name || !body.section) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: name, section' },
        { status: 400 }
      );
    }

    // Check if class exists
    const existing = await prisma.class.findUnique({
      where: { id },
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
        id: { not: id }, // Exclude current class
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
      where: { id },
      data: {
        class: body.name,
        section: body.section,
        teacherId: body.teacherId || null,
        room: body.room || null,
        capacity: body.capacity || null,
      },
      include: {
        teacher: true,
      },
    });

    // Get students for this class separately
    const students = await prisma.student.findMany({
      where: {
        class: updatedClass.class,
        section: updatedClass.section,
      },
      select: {
        id: true,
        name: true,
        rollNumber: true,
        studentId: true,
      },
    });

    const formattedClass = {
      ...updatedClass,
      students: students,
      studentsCount: students.length,
    };

    console.log('✅ Class updated successfully:', updatedClass.id);
    return NextResponse.json({ success: true, data: formattedClass });
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('🗑️ Deleting class:', id);
    
    // Check if class exists
    const existing = await prisma.class.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Class not found' },
        { status: 404 }
      );
    }

    // Check if class has students
    const studentsCount = await prisma.student.count({
      where: {
        class: existing.class,
        section: existing.section,
      },
    });

    if (studentsCount > 0) {
      return NextResponse.json(
        { success: false, error: `Cannot delete class with ${studentsCount} students. Please reassign students first.` },
        { status: 400 }
      );
    }

    // Delete class
    await prisma.class.delete({
      where: { id },
    });

    console.log('✅ Class deleted successfully:', id);
    return NextResponse.json({ success: true, message: 'Class deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting class:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete class' },
      { status: 500 }
    );
  }
}