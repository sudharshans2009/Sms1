import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/academic-calendar/[id] - Get specific calendar item
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (!type) {
      return NextResponse.json({
        success: false,
        error: 'Type parameter is required (event, holiday, exam, academic-year, term)',
      }, { status: 400 });
    }

    let item;

    switch (type) {
      case 'event':
        item = await prisma.academicEvent.findUnique({
          where: { id },
          include: {
            term: true,
            academicYear: true,
            attendees: true,
            reminders: true,
          },
        });
        break;

      case 'holiday':
        item = await prisma.holiday.findUnique({
          where: { id },
          include: {
            academicYear: true,
          },
        });
        break;

      case 'exam':
        item = await prisma.exam.findUnique({
          where: { id },
          include: {
            term: true,
            subjects: true,
            schedule: true,
            results: true,
          },
        });
        break;

      case 'academic-year':
        item = await prisma.academicYear.findUnique({
          where: { id },
          include: {
            events: true,
            terms: true,
            holidays: true,
          },
        });
        break;

      case 'term':
        item = await prisma.academicTerm.findUnique({
          where: { id },
          include: {
            academicYear: true,
            events: true,
            exams: true,
          },
        });
        break;

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid type',
        }, { status: 400 });
    }

    if (!item) {
      return NextResponse.json({
        success: false,
        error: `${type.charAt(0).toUpperCase() + type.slice(1)} not found`,
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: item,
    });
  } catch (error: any) {
    console.error('Error fetching calendar item:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch calendar item',
      details: error.message,
    }, { status: 500 });
  }
}

// PUT /api/academic-calendar/[id] - Update calendar item
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { type, ...data } = body;

    if (!type) {
      return NextResponse.json({
        success: false,
        error: 'Type parameter is required',
      }, { status: 400 });
    }

    // Remove ID from data to prevent overwriting
    delete data.id;

    let result;

    switch (type) {
      case 'event':
        result = await prisma.academicEvent.update({
          where: { id },
          data: {
            ...data,
            ...(data.startDate && { startDate: new Date(data.startDate) }),
            ...(data.endDate && { endDate: new Date(data.endDate) }),
          },
          include: {
            term: true,
            academicYear: true,
          },
        });
        break;

      case 'holiday':
        result = await prisma.holiday.update({
          where: { id },
          data: {
            ...data,
            ...(data.date && { date: new Date(data.date) }),
          },
          include: {
            academicYear: true,
          },
        });
        break;

      case 'exam':
        result = await prisma.exam.update({
          where: { id },
          data: {
            ...data,
            ...(data.startDate && { startDate: new Date(data.startDate) }),
            ...(data.endDate && { endDate: new Date(data.endDate) }),
          },
          include: {
            term: true,
            subjects: true,
          },
        });
        break;

      case 'academic-year':
        result = await prisma.academicYear.update({
          where: { id },
          data: {
            ...data,
            ...(data.startDate && { startDate: new Date(data.startDate) }),
            ...(data.endDate && { endDate: new Date(data.endDate) }),
          },
        });
        break;

      case 'term':
        result = await prisma.academicTerm.update({
          where: { id },
          data: {
            ...data,
            ...(data.startDate && { startDate: new Date(data.startDate) }),
            ...(data.endDate && { endDate: new Date(data.endDate) }),
          },
          include: {
            academicYear: true,
          },
        });
        break;

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid type',
        }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: result,
      message: `${type.charAt(0).toUpperCase() + type.slice(1)} updated successfully`,
    });
  } catch (error: any) {
    console.error('Error updating calendar item:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update calendar item',
      details: error.message,
    }, { status: 500 });
  }
}

// DELETE /api/academic-calendar/[id] - Delete calendar item
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (!type) {
      return NextResponse.json({
        success: false,
        error: 'Type parameter is required',
      }, { status: 400 });
    }

    switch (type) {
      case 'event':
        await prisma.academicEvent.delete({
          where: { id },
        });
        break;

      case 'holiday':
        await prisma.holiday.delete({
          where: { id },
        });
        break;

      case 'exam':
        // Check if exam has results first
        const examWithResults = await prisma.exam.findUnique({
          where: { id },
          include: { results: true },
        });

        if (examWithResults?.results && examWithResults.results.length > 0) {
          return NextResponse.json({
            success: false,
            error: 'Cannot delete exam with existing results',
          }, { status: 400 });
        }

        await prisma.exam.delete({
          where: { id },
        });
        break;

      case 'academic-year':
        // Check if academic year has dependencies
        const yearWithDeps = await prisma.academicYear.findUnique({
          where: { id },
          include: { events: true, terms: true, holidays: true },
        });

        if (yearWithDeps && (
          yearWithDeps.events.length > 0 ||
          yearWithDeps.terms.length > 0 ||
          yearWithDeps.holidays.length > 0
        )) {
          return NextResponse.json({
            success: false,
            error: 'Cannot delete academic year with existing events, terms, or holidays',
          }, { status: 400 });
        }

        await prisma.academicYear.delete({
          where: { id },
        });
        break;

      case 'term':
        // Check if term has dependencies
        const termWithDeps = await prisma.academicTerm.findUnique({
          where: { id },
          include: { events: true, exams: true },
        });

        if (termWithDeps && (
          termWithDeps.events.length > 0 ||
          termWithDeps.exams.length > 0
        )) {
          return NextResponse.json({
            success: false,
            error: 'Cannot delete term with existing events or exams',
          }, { status: 400 });
        }

        await prisma.academicTerm.delete({
          where: { id },
        });
        break;

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid type',
        }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: `${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully`,
    });
  } catch (error: any) {
    console.error('Error deleting calendar item:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete calendar item',
      details: error.message,
    }, { status: 500 });
  }
}