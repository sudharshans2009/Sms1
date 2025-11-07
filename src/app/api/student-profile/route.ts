import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET - Get comprehensive student profile
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const include = searchParams.get('include'); // all, medical, academic, fees, attendance

    if (!studentId) {
      return NextResponse.json(
        { error: 'Student ID is required' },
        { status: 400 }
      );
    }

    const includeAll = !include || include === 'all';

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        user: {
          select: {
            email: true,
            role: true,
          },
        },
        bus: includeAll || include === 'bus' ? {
          select: {
            busId: true,
            route: true,
            driverName: true,
            status: true,
          },
        } : false,
        medical: includeAll || include === 'medical',
        academic: includeAll || include === 'academic' ? {
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
        } : false,
        feePayments: includeAll || include === 'fees' ? {
          include: {
            feeStructure: true,
          },
          orderBy: {
            dueDate: 'asc',
          },
        } : false,
        attendance: includeAll || include === 'attendance' ? {
          orderBy: {
            date: 'desc',
          },
          take: 30,
        } : false,
        marks: includeAll || include === 'marks',
      },
    });

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    // Calculate attendance percentage if attendance included
    let attendancePercentage = null;
    if (student.attendance && student.attendance.length > 0) {
      const totalDays = student.attendance.length;
      const presentDays = student.attendance.filter(
        (a: any) => a.status === 'PRESENT' || a.status === 'LATE'
      ).length;
      attendancePercentage = ((presentDays / totalDays) * 100).toFixed(2);
    }

    // Calculate fee summary if fees included
    let feeSummary = null;
    if (student.feePayments && student.feePayments.length > 0) {
      const totalDue = student.feePayments.reduce((sum: number, p: any) => sum + p.amountDue, 0);
      const totalPaid = student.feePayments.reduce((sum: number, p: any) => sum + p.amountPaid, 0);
      const totalPending = student.feePayments.reduce((sum: number, p: any) => sum + p.amountPending, 0);
      const totalFine = student.feePayments.reduce((sum: number, p: any) => sum + p.fine, 0);
      
      feeSummary = {
        totalDue,
        totalPaid,
        totalPending,
        totalFine,
        paymentsMade: student.feePayments.filter((p: any) => p.status === 'PAID').length,
        pendingPayments: student.feePayments.filter((p: any) => p.status !== 'PAID').length,
      };
    }

    return NextResponse.json({
      success: true,
      student,
      attendancePercentage,
      feeSummary,
    });
  } catch (error: any) {
    console.error('Error fetching student profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch student profile', details: error.message },
      { status: 500 }
    );
  }
}

// POST - Create or update medical/academic records
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, studentId } = body;

    if (!studentId) {
      return NextResponse.json(
        { error: 'Student ID is required' },
        { status: 400 }
      );
    }

    if (action === 'updateMedical') {
      const {
        bloodGroup,
        height,
        weight,
        allergies = [],
        chronicIllness = [],
        disabilities,
        currentMedications = [],
        pastSurgeries = [],
        emergencyContact,
        emergencyPhone,
        emergencyRelation,
        vaccinations = [],
        lastCheckup,
        notes,
      } = body;

      const medical = await prisma.studentMedical.upsert({
        where: { studentId },
        update: {
          bloodGroup,
          height,
          weight,
          allergies,
          chronicIllness,
          disabilities,
          currentMedications,
          pastSurgeries,
          emergencyContact,
          emergencyPhone,
          emergencyRelation,
          vaccinations,
          lastCheckup: lastCheckup ? new Date(lastCheckup) : null,
          notes,
        },
        create: {
          studentId,
          bloodGroup,
          height,
          weight,
          allergies,
          chronicIllness,
          disabilities,
          currentMedications,
          pastSurgeries,
          emergencyContact: emergencyContact || '',
          emergencyPhone: emergencyPhone || '',
          emergencyRelation: emergencyRelation || '',
          vaccinations,
          lastCheckup: lastCheckup ? new Date(lastCheckup) : null,
          notes,
        },
      });

      return NextResponse.json({
        success: true,
        medical,
      });
    }

    if (action === 'addAcademic') {
      const {
        academicYear,
        term,
        subjects,
        totalMarks,
        maxMarks,
        percentage,
        grade,
        rank,
        totalDays,
        presentDays,
        absentDays,
        attendancePercentage,
        studyStatus = 'REGULAR',
        promoted = false,
        teacherRemarks,
        principalRemarks,
      } = body;

      if (!academicYear || !term || !subjects) {
        return NextResponse.json(
          { error: 'Academic year, term, and subjects are required' },
          { status: 400 }
        );
      }

      const academic = await prisma.studentAcademic.upsert({
        where: {
          studentId_academicYear_term: {
            studentId,
            academicYear,
            term,
          },
        },
        update: {
          subjects,
          totalMarks,
          maxMarks,
          percentage,
          grade,
          rank,
          totalDays,
          presentDays,
          absentDays,
          attendancePercentage,
          studyStatus,
          promoted,
          teacherRemarks,
          principalRemarks,
        },
        create: {
          studentId,
          academicYear,
          term,
          subjects,
          totalMarks,
          maxMarks,
          percentage,
          grade,
          rank,
          totalDays,
          presentDays,
          absentDays,
          attendancePercentage,
          studyStatus,
          promoted,
          teacherRemarks,
          principalRemarks,
        },
      });

      return NextResponse.json({
        success: true,
        academic,
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Error updating student profile:', error);
    return NextResponse.json(
      { error: 'Failed to update student profile', details: error.message },
      { status: 500 }
    );
  }
}
