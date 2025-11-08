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
    const subject = searchParams.get('subject');
    const examDate = searchParams.get('examDate');

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

    // Filter by subject if provided and transform to individual subject marks
    if (subject) {
      const filteredMarks = marks
        .filter((mark: any) => {
          const subjectsData = mark.subjects as any;
          return subjectsData && subject in subjectsData;
        })
        .map((mark: any) => ({
          id: mark.id,
          studentId: mark.studentId,
          subject: subject,
          marks: (mark.subjects as any)[subject] || 0,
          maxMarks: 100, // Default
          examType: mark.examType,
          examDate: examDate || new Date().toISOString().split('T')[0],
          class: mark.class,
          section: mark.section,
        }));
      
      return NextResponse.json(filteredMarks, { status: 200 });
    }

    return NextResponse.json({ success: true, data: marks });
  } catch (error) {
    console.error('Error fetching marks:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch marks' },
      { status: 500 }
    );
  }
}

// POST /api/marks - Add new marks entry or bulk marks
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Check if it's bulk marks (array) or single entry
    if (body.marks && Array.isArray(body.marks)) {
      // Bulk marks entry - for individual subject marks
      const marksData = body.marks;
      const results = [];
      
      for (const markEntry of marksData) {
        const { studentId, subject, marks, maxMarks, examType, examDate, class: classParam, section } = markEntry;
        
        if (!studentId || !subject || marks === undefined) {
          continue; // Skip invalid entries
        }
        
        // Check if marks already exist for this student, exam, and subject
        const existingMarks = await prisma.marks.findFirst({
          where: {
            studentId,
            class: classParam,
            section,
            examType,
          },
        });
        
        if (existingMarks) {
          // Update existing marks - merge the subject
          const subjectsData = (existingMarks.subjects as any) || {};
          subjectsData[subject] = marks;
          
          // Recalculate total
          const total = Object.values(subjectsData).reduce((sum: number, mark: any) => sum + (Number(mark) || 0), 0);
          const subjectCount = Object.keys(subjectsData).length;
          const percentage = (total / (subjectCount * (maxMarks || 100))) * 100;
          
          let grade = 'F';
          if (percentage >= 90) grade = 'A+';
          else if (percentage >= 80) grade = 'A';
          else if (percentage >= 70) grade = 'B';
          else if (percentage >= 60) grade = 'C';
          else if (percentage >= 50) grade = 'D';
          
          const updated = await prisma.marks.update({
            where: { id: existingMarks.id },
            data: {
              subjects: JSON.stringify(subjectsData),
              total,
              grade,
            },
          });
          results.push(updated);
        } else {
          // Create new marks entry
          const subjectsData = { [subject]: marks };
          const percentage = (marks / (maxMarks || 100)) * 100;
          
          let grade = 'F';
          if (percentage >= 90) grade = 'A+';
          else if (percentage >= 80) grade = 'A';
          else if (percentage >= 70) grade = 'B';
          else if (percentage >= 60) grade = 'C';
          else if (percentage >= 50) grade = 'D';
          
          const newMarks = await prisma.marks.create({
            data: {
              studentId,
              class: classParam,
              section,
              examType,
              subjects: JSON.stringify(subjectsData),
              total: marks,
              grade,
            },
          });
          results.push(newMarks);
        }
      }
      
      return NextResponse.json({ 
        success: true, 
        data: results,
        message: 'Marks saved successfully',
      });
    } else {
      // Single marks entry (legacy format)
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
    }
  } catch (error) {
    console.error('Error adding marks:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add marks' },
      { status: 500 }
    );
  }
}
