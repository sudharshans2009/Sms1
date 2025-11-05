import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';

// GET /api/marks
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const studentId = searchParams.get('studentId');

    if (!studentId) {
      return NextResponse.json(
        { success: false, error: 'Student ID required' },
        { status: 400 }
      );
    }

    const db = getDatabase();
    const marks = db.getMarksByStudent(studentId);

    return NextResponse.json({ success: true, data: marks });
  } catch (error) {
    console.error('Error fetching marks:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch marks' },
      { status: 500 }
    );
  }
}

// POST /api/marks
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const db = getDatabase();
    
    const marks = db.addMarks(body);
    return NextResponse.json({ success: true, data: marks });
  } catch (error) {
    console.error('Error adding marks:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add marks' },
      { status: 500 }
    );
  }
}
