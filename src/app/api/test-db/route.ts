import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 30;

export async function GET() {
  try {
    // Test connection
    await prisma.$connect();
    
    // Count records
    const userCount = await prisma.user.count();
    const studentCount = await prisma.student.count();
    const teacherCount = await prisma.teacher.count();
    
    // Test a simple query
    const users = await prisma.user.findMany({
      take: 5,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      }
    });
    
    await prisma.$disconnect();
    
    return NextResponse.json({
      success: true,
      message: '✅ Database connected successfully',
      counts: {
        users: userCount,
        students: studentCount,
        teachers: teacherCount,
      },
      sampleUsers: users,
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasDbUrl: !!process.env.POSTGRES_PRISMA_URL,
        timestamp: new Date().toISOString(),
      }
    });
  } catch (error: any) {
    console.error('Database test error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasDbUrl: !!process.env.POSTGRES_PRISMA_URL,
        timestamp: new Date().toISOString(),
      }
    }, { status: 500 });
  }
}
