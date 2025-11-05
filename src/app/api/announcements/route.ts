import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';

// GET /api/announcements
export async function GET(request: NextRequest) {
  try {
    const db = getDatabase();
    const announcements = db.getAllAnnouncements();
    return NextResponse.json({ success: true, data: announcements });
  } catch (error) {
    console.error('Error fetching announcements:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch announcements' },
      { status: 500 }
    );
  }
}

// POST /api/announcements
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const db = getDatabase();
    
    const announcement = db.addAnnouncement(body);
    return NextResponse.json({ success: true, data: announcement });
  } catch (error) {
    console.error('Error adding announcement:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add announcement' },
      { status: 500 }
    );
  }
}
