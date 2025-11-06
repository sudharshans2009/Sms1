import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/attendance
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get('date');
    const classParam = searchParams.get('class');
    const section = searchParams.get('section');
    const studentId = searchParams.get('studentId');

    const where: any = {};

    if (date) {
      const dateObj = new Date(date);
      const startOfDay = new Date(dateObj.setHours(0, 0, 0, 0));
      const endOfDay = new Date(dateObj.setHours(23, 59, 59, 999));
      
      where.date = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    if (classParam) {
      where.class = classParam;
    }

    if (section) {
      where.section = section;
    }

    if (studentId) {
      const student = await prisma.student.findUnique({
        where: { studentId },
      });
      if (student) {
        where.studentId = student.id;
      }
    }

    const attendance = await prisma.attendance.findMany({
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
        { date: 'desc' },
        { class: 'asc' },
        { section: 'asc' },
      ],
    });

    return NextResponse.json({ success: true, data: attendance });
  } catch (error) {
    console.error('Error fetching attendance:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch attendance' },
      { status: 500 }
    );
  }
}

// POST /api/attendance - Mark attendance (can be single or bulk)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Check if it's bulk attendance or single
    if (Array.isArray(body)) {
      // Bulk attendance
      const results = [];
      for (const record of body) {
        const { studentId, date, status, class: classParam, section } = record;
        
        if (!studentId || !date || !status || !classParam || !section) {
          continue; // Skip invalid records
        }

        const student = await prisma.student.findUnique({
          where: { studentId },
        });

        if (!student) {
          continue; // Skip if student not found
        }

        const attendanceRecord = await prisma.attendance.upsert({
          where: {
            studentId_date: {
              studentId: student.id,
              date: new Date(date),
            },
          },
          update: {
            status,
          },
          create: {
            studentId: student.id,
            date: new Date(date),
            status,
            class: classParam,
            section,
          },
        });

        results.push(attendanceRecord);
      }

      return NextResponse.json({ 
        success: true, 
        data: results,
        message: `Marked attendance for ${results.length} students`,
      });
    } else {
      // Single attendance
      const { studentId, date, status, class: classParam, section } = body;

      if (!studentId || !date || !status || !classParam || !section) {
        return NextResponse.json(
          { success: false, error: 'Missing required fields' },
          { status: 400 }
        );
      }

      const student = await prisma.student.findUnique({
        where: { studentId },
      });

      if (!student) {
        return NextResponse.json(
          { success: false, error: 'Student not found' },
          { status: 404 }
        );
      }

      const attendanceRecord = await prisma.attendance.upsert({
        where: {
          studentId_date: {
            studentId: student.id,
            date: new Date(date),
          },
        },
        update: {
          status,
        },
        create: {
          studentId: student.id,
          date: new Date(date),
          status,
          class: classParam,
          section,
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
        data: attendanceRecord,
        message: 'Attendance marked successfully',
      });
    }
  } catch (error) {
    console.error('Error adding attendance:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add attendance' },
      { status: 500 }
    );
  }
}
