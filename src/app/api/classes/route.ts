import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';

// GET /api/classes
export async function GET(request: NextRequest) {
  try {
    const db = getDatabase();
    const classes = db.getAllClasses();
    return NextResponse.json({ success: true, data: classes });
  } catch (error) {
    console.error('Error fetching classes:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch classes' },
      { status: 500 }
    );
  }
}

// POST /api/classes
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const db = getDatabase();
    
    const classData = db.addClass(body);
    return NextResponse.json({ success: true, data: classData });
  } catch (error) {
    console.error('Error adding class:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add class' },
      { status: 500 }
    );
  }
}
