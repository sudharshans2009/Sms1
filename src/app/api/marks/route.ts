import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/marks - Get marks with optional filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const studentId = searchParams.get('studentId');
    const classParam = searchParams.get('class');
    const section = searchParams.get('section');
    const examType = searchParams.get('examType');

    const where: any = {};

    if (studentId) {
      // Find student first
      const student = await prisma.student.findUnique({
        where: { studentId },
      });
      if (!student) {
        return NextResponse.json(
          { success: false, error: 'Student not found' },
          { status: 404 }
        );
      }
      where.studentId = student.id;
    }

    if (classParam) {
      where.class = classParam;
    }

    if (section) {
      where.section = section;
    }

    if (examType) {
      where.examType = examType;
    }

    const marks = await prisma.marks.findMany({
      where,
      include: {
        student: {
          select: {
            studentId: true,
            name: true,
            class: true,
            section: true,
          },
        },
      },
      orderBy: [
        { class: 'asc' },
        { section: 'asc' },
        { examType: 'asc' },
      ],
    });

    return NextResponse.json({ success: true, data: marks });
  } catch (error) {
    console.error('Error fetching marks:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch marks' },
      { status: 500 }
    );
  }
}

// POST /api/marks - Add new marks entry
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { studentId, class: classParam, section, examType, subjects, total, grade } = body;

    if (!studentId || !classParam || !section || !examType || !subjects) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Find student
    const student = await prisma.student.findUnique({
      where: { studentId },
    });

    if (!student) {
      return NextResponse.json(
        { success: false, error: 'Student not found' },
        { status: 404 }
      );
    }

    // Calculate total if not provided
    let calculatedTotal = total;
    if (!calculatedTotal && typeof subjects === 'object') {
      calculatedTotal = Object.values(subjects).reduce((sum: number, mark: any) => sum + (Number(mark) || 0), 0);
    }

    // Calculate grade if not provided
    let calculatedGrade = grade;
    if (!calculatedGrade && calculatedTotal) {
      const percentage = (calculatedTotal / (Object.keys(subjects).length * 100)) * 100;
      if (percentage >= 90) calculatedGrade = 'A+';
      else if (percentage >= 80) calculatedGrade = 'A';
      else if (percentage >= 70) calculatedGrade = 'B';
      else if (percentage >= 60) calculatedGrade = 'C';
      else if (percentage >= 50) calculatedGrade = 'D';
      else calculatedGrade = 'F';
    }

    const newMarks = await prisma.marks.create({
      data: {
        studentId: student.id,
        class: classParam,
        section,
        examType,
        subjects,
        total: calculatedTotal || 0,
        grade: calculatedGrade || 'F',
      },
      include: {
        student: {
          select: {
            studentId: true,
            name: true,
            class: true,
            section: true,
          },
        },
      },
    });

    return NextResponse.json({ 
      success: true, 
      data: newMarks,
      message: 'Marks added successfully',
    });
  } catch (error) {
    console.error('Error adding marks:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add marks' },
      { status: 500 }
    );
  }
}
