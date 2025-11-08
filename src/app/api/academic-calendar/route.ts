import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/academic-calendar - Get academic events, holidays, and exams
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year');
    const month = searchParams.get('month');
    const type = searchParams.get('type'); // events, holidays, exams, all
    const userRole = searchParams.get('userRole');
    const userClass = searchParams.get('userClass');
    const userSection = searchParams.get('userSection');

    // Get current or specified academic year
    let academicYear;
    if (year) {
      academicYear = await prisma.academicYear.findUnique({
        where: { year },
      });
    } else {
      academicYear = await prisma.academicYear.findFirst({
        where: { isActive: true },
      });
    }

    if (!academicYear) {
      return NextResponse.json({
        success: false,
        error: 'No academic year found',
      }, { status: 404 });
    }

    const data: any = {
      academicYear,
      events: [],
      holidays: [],
      exams: [],
      terms: [],
    };

    // Build date filter for month if specified
    const dateFilter: any = {};
    if (month) {
      const startOfMonth = new Date(academicYear.startDate.getFullYear(), parseInt(month) - 1, 1);
      const endOfMonth = new Date(academicYear.startDate.getFullYear(), parseInt(month), 0);
      dateFilter.startDate = {
        gte: startOfMonth,
        lte: endOfMonth,
      };
    }

    // Get academic terms
    data.terms = await prisma.academicTerm.findMany({
      where: { academicYearId: academicYear.id },
      orderBy: { startDate: 'asc' },
    });

    // Get events
    if (type === 'events' || type === 'all' || !type) {
      const eventFilter: any = {
        academicYearId: academicYear.id,
        ...dateFilter,
      };

      // Role-based filtering
      if (userRole) {
        eventFilter.OR = [
          { targetRole: null },
          { targetRole: userRole.toUpperCase() },
          { isPublic: true },
        ];
      }

      // Class/section filtering
      if (userClass) {
        eventFilter.OR = [
          ...(eventFilter.OR || []),
          { targetClass: null },
          { targetClass: userClass },
        ];
      }

      if (userSection) {
        eventFilter.OR = [
          ...(eventFilter.OR || []),
          { targetSection: null },
          { targetSection: userSection },
        ];
      }

      data.events = await prisma.academicEvent.findMany({
        where: eventFilter,
        include: {
          term: true,
          attendees: true,
        },
        orderBy: { startDate: 'asc' },
      });
    }

    // Get holidays
    if (type === 'holidays' || type === 'all' || !type) {
      const holidayFilter: any = {
        academicYearId: academicYear.id,
      };

      if (month) {
        const startOfMonth = new Date(academicYear.startDate.getFullYear(), parseInt(month) - 1, 1);
        const endOfMonth = new Date(academicYear.startDate.getFullYear(), parseInt(month), 0);
        holidayFilter.date = {
          gte: startOfMonth,
          lte: endOfMonth,
        };
      }

      data.holidays = await prisma.holiday.findMany({
        where: holidayFilter,
        orderBy: { date: 'asc' },
      });
    }

    // Get exams
    if (type === 'exams' || type === 'all' || !type) {
      const examFilter: any = {};

      if (userClass) {
        examFilter.class = userClass;
      }

      if (userSection) {
        examFilter.section = userSection;
      }

      if (month) {
        const startOfMonth = new Date(academicYear.startDate.getFullYear(), parseInt(month) - 1, 1);
        const endOfMonth = new Date(academicYear.startDate.getFullYear(), parseInt(month), 0);
        examFilter.startDate = {
          gte: startOfMonth,
          lte: endOfMonth,
        };
      }

      data.exams = await prisma.exam.findMany({
        where: examFilter,
        include: {
          term: true,
          subjects: true,
          schedule: true,
        },
        orderBy: { startDate: 'asc' },
      });
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error('Error fetching academic calendar:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch academic calendar',
      details: error.message,
    }, { status: 500 });
  }
}

// POST /api/academic-calendar - Create academic event, holiday, or exam
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, ...data } = body;

    if (!type) {
      return NextResponse.json({
        success: false,
        error: 'Type is required (event, holiday, exam)',
      }, { status: 400 });
    }

    let result;

    switch (type) {
      case 'event':
        // Validate required fields for event
        if (!data.title || !data.startDate || !data.eventType) {
          return NextResponse.json({
            success: false,
            error: 'Missing required fields: title, startDate, eventType',
          }, { status: 400 });
        }

        result = await prisma.academicEvent.create({
          data: {
            ...data,
            startDate: new Date(data.startDate),
            endDate: data.endDate ? new Date(data.endDate) : null,
          },
          include: {
            term: true,
            academicYear: true,
          },
        });
        break;

      case 'holiday':
        // Validate required fields for holiday
        if (!data.name || !data.date || !data.academicYearId) {
          return NextResponse.json({
            success: false,
            error: 'Missing required fields: name, date, academicYearId',
          }, { status: 400 });
        }

        result = await prisma.holiday.create({
          data: {
            ...data,
            date: new Date(data.date),
          },
          include: {
            academicYear: true,
          },
        });
        break;

      case 'exam':
        // Validate required fields for exam
        if (!data.name || !data.startDate || !data.termId || !data.class) {
          return NextResponse.json({
            success: false,
            error: 'Missing required fields: name, startDate, termId, class',
          }, { status: 400 });
        }

        result = await prisma.exam.create({
          data: {
            ...data,
            startDate: new Date(data.startDate),
            endDate: new Date(data.endDate),
          },
          include: {
            term: true,
            subjects: true,
          },
        });
        break;

      case 'academic-year':
        // Create new academic year
        if (!data.year || !data.startDate || !data.endDate) {
          return NextResponse.json({
            success: false,
            error: 'Missing required fields: year, startDate, endDate',
          }, { status: 400 });
        }

        result = await prisma.academicYear.create({
          data: {
            ...data,
            startDate: new Date(data.startDate),
            endDate: new Date(data.endDate),
          },
        });
        break;

      case 'term':
        // Create academic term
        if (!data.name || !data.startDate || !data.endDate || !data.academicYearId) {
          return NextResponse.json({
            success: false,
            error: 'Missing required fields: name, startDate, endDate, academicYearId',
          }, { status: 400 });
        }

        result = await prisma.academicTerm.create({
          data: {
            ...data,
            startDate: new Date(data.startDate),
            endDate: new Date(data.endDate),
          },
          include: {
            academicYear: true,
          },
        });
        break;

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid type. Must be: event, holiday, exam, academic-year, or term',
        }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: result,
      message: `${type.charAt(0).toUpperCase() + type.slice(1)} created successfully`,
    });
  } catch (error: any) {
    console.error('Error creating calendar item:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create calendar item',
      details: error.message,
    }, { status: 500 });
  }
}