import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/students
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const classId = searchParams.get('class');
    const section = searchParams.get('section');

    let students;

    if (classId) {
      students = await prisma.student.findMany({
        where: {
          class: classId,
          ...(section && { section }),
        },
        orderBy: [
          { class: 'asc' },
          { section: 'asc' },
          { name: 'asc' },
        ],
      });
    } else {
      students = await prisma.student.findMany({
        orderBy: [
          { class: 'asc' },
          { section: 'asc' },
          { name: 'asc' },
        ],
      });
    }

    return NextResponse.json({ success: true, data: students });
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch students' },
      { status: 500 }
    );
  }
}

// POST /api/students
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.studentId || !body.name || !body.class || !body.section) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: studentId, name, class, section' },
        { status: 400 }
      );
    }

    // Check if student ID already exists
    const existing = await prisma.student.findUnique({
      where: { studentId: body.studentId },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Student ID already exists' },
        { status: 400 }
      );
    }

    // Create student
    const student = await prisma.student.create({
      data: {
        studentId: body.studentId,
        name: body.name,
        class: body.class,
        section: body.section,
        rollNumber: body.rollNumber || null,
        dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : null,
        gender: body.gender || null,
        parentName: body.parentName || null,
        parentPhone: body.parentPhone || null,
        parentEmail: body.parentEmail || null,
        address: body.address || null,
        bloodGroup: body.bloodGroup || null,
        admissionDate: body.admissionDate ? new Date(body.admissionDate) : new Date(),
      },
    });

    return NextResponse.json({ success: true, data: student });
  } catch (error) {
    console.error('Error adding student:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add student' },
      { status: 500 }
    );
  }
}
