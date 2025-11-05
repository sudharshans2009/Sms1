import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';

// GET /api/attendance
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get('date');
    const classId = searchParams.get('class');
    const section = searchParams.get('section');

    if (!date || !classId || !section) {
      return NextResponse.json(
        { success: false, error: 'Date, class, and section required' },
        { status: 400 }
      );
    }

    const db = getDatabase();
    const attendance = db.getAttendanceByDateAndClass(date, classId, section);

    return NextResponse.json({ success: true, data: attendance });
  } catch (error) {
    console.error('Error fetching attendance:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch attendance' },
      { status: 500 }
    );
  }
}

// POST /api/attendance
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const db = getDatabase();
    
    const attendance = db.addAttendance(body);
    return NextResponse.json({ success: true, data: attendance });
  } catch (error) {
    console.error('Error adding attendance:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add attendance' },
      { status: 500 }
    );
  }
}
