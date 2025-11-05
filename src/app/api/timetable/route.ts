import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';

// GET /api/timetable?class=5&section=A
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const classId = searchParams.get('class');
    const section = searchParams.get('section');

    const db = getDatabase();

    if (!classId || !section) {
      // Return all timetables
      const allTimetables = db.getAllTimetables();
      return NextResponse.json({ success: true, data: allTimetables });
    }

    // Return specific timetable
    const timetable = db.getTimetable(classId, section);
    
    if (!timetable) {
      return NextResponse.json(
        { success: false, error: 'Timetable not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: timetable });
  } catch (error) {
    console.error('Error fetching timetable:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch timetable' },
      { status: 500 }
    );
  }
}

// POST /api/timetable - Create new timetable
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { class: classId, section, schedule, updatedBy } = body;

    if (!classId || !section || !schedule) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const db = getDatabase();
    const timetable = db.updateTimetable(classId, section, schedule, updatedBy || 'admin');

    return NextResponse.json({ success: true, data: timetable });
  } catch (error) {
    console.error('Error creating timetable:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create timetable' },
      { status: 500 }
    );
  }
}

// PUT /api/timetable - Update existing timetable
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { class: classId, section, schedule, updatedBy } = body;

    if (!classId || !section || !schedule) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const db = getDatabase();
    const timetable = db.updateTimetable(classId, section, schedule, updatedBy || 'admin');

    return NextResponse.json({ success: true, data: timetable });
  } catch (error) {
    console.error('Error updating timetable:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update timetable' },
      { status: 500 }
    );
  }
}
