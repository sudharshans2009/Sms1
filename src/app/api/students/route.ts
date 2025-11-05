import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';

// GET /api/students
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const classId = searchParams.get('class');
    const section = searchParams.get('section');

    const db = getDatabase();

    if (classId) {
      const students = db.getStudentsByClass(classId, section || undefined);
      return NextResponse.json({ success: true, data: students });
    }

    const allStudents = db.getAllStudents();
    return NextResponse.json({ success: true, data: allStudents });
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch students' },
      { status: 500 }
    );
  }
}

// POST /api/students
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const db = getDatabase();
    
    const student = db.addStudent(body);
    return NextResponse.json({ success: true, data: student });
  } catch (error) {
    console.error('Error adding student:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add student' },
      { status: 500 }
    );
  }
}
