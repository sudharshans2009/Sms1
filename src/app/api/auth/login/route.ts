import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Configure for Vercel serverless
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 30;

// POST /api/auth/login
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, role } = body;

    if (!email || !password || !role) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Query user from database
    const user = await prisma.user.findFirst({
      where: {
        email: email.toLowerCase(),
        role: role.toUpperCase(),
      }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // In production, use bcrypt for password hashing
    // For now, simple password comparison
    if (user.password !== password) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      success: true,
      data: {
        user: {
          ...userWithoutPassword,
          role: user.role.toLowerCase(), // Convert back to lowercase for frontend
        },
        token: `token-${user.id}` // Replace with real JWT in production
      }
    });
  } catch (error) {
    console.error('Error during login:', error);
    return NextResponse.json(
      { success: false, error: 'Login failed' },
      { status: 500 }
    );
  }
}
