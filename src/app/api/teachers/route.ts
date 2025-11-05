import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';

// GET /api/teachers
export async function GET(request: NextRequest) {
  try {
    const db = getDatabase();
    const teachers = db.getAllTeachers();
    return NextResponse.json({ success: true, data: teachers });
  } catch (error) {
    console.error('Error fetching teachers:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch teachers' },
      { status: 500 }
    );
  }
}

// POST /api/teachers
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const db = getDatabase();
    
    const teacher = db.addTeacher(body);
    return NextResponse.json({ success: true, data: teacher });
  } catch (error) {
    console.error('Error adding teacher:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add teacher' },
      { status: 500 }
    );
  }
}
