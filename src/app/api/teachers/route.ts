import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/teachers
export async function GET(request: NextRequest) {
  try {
    const teachers = await prisma.teacher.findMany({
      orderBy: { name: 'asc' },
    });
    
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
    
    // Validate required fields
    if (!body.teacherId || !body.name) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: teacherId, name' },
        { status: 400 }
      );
    }

    // Check if teacher ID already exists
    const existing = await prisma.teacher.findUnique({
      where: { teacherId: body.teacherId },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Teacher ID already exists' },
        { status: 400 }
      );
    }

    // Create teacher
    const teacher = await prisma.teacher.create({
      data: {
        teacherId: body.teacherId,
        name: body.name,
        subject: body.subject || null,
        qualification: body.qualification || null,
        experience: body.experience || null,
        phone: body.phone || null,
        email: body.email || null,
        address: body.address || null,
        joiningDate: body.joiningDate ? new Date(body.joiningDate) : new Date(),
      },
    });

    return NextResponse.json({ success: true, data: teacher });
  } catch (error) {
    console.error('Error adding teacher:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add teacher' },
      { status: 500 }
    );
  }
}
