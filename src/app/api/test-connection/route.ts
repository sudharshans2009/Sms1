import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing database connection from API...');
    
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Prisma connected');
    
    // Test simple queries
    const userCount = await prisma.user.count();
    const studentCount = await prisma.student.count();
    const academicYearCount = await prisma.academicYear.count();
    
    console.log(`Users: ${userCount}, Students: ${studentCount}, Academic Years: ${academicYearCount}`);
    
    // Test sample data retrieval
    const sampleStudents = await prisma.student.findMany({
      take: 3,
      select: {
        id: true,
        name: true,
        class: true,
        section: true,
      }
    });
    
    const sampleEvents = await prisma.academicEvent.findMany({
      take: 3,
      select: {
        id: true,
        title: true,
        eventType: true,
      }
    });
    
    return NextResponse.json({
      success: true,
      status: 'Database connection working perfectly',
      counts: {
        users: userCount,
        students: studentCount,
        academicYears: academicYearCount
      },
      sampleData: {
        students: sampleStudents,
        events: sampleEvents
      }
    });
    
  } catch (error: any) {
    console.error('❌ Database test API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Database connection failed',
      details: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}