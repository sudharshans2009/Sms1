import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/library/borrowed - Get all borrowed books
export async function GET(request: NextRequest) {
  try {
    const borrowedBooks = await prisma.borrowedBook.findMany({
      include: {
        book: true,
        student: true,
      },
      orderBy: { borrowDate: 'desc' },
    });

    // Check for overdue books and update status
    const now = new Date();
    for (const borrow of borrowedBooks) {
      if (
        borrow.status === 'BORROWED' &&
        new Date(borrow.dueDate) < now &&
        !borrow.returnDate
      ) {
        await prisma.borrowedBook.update({
          where: { id: borrow.id },
          data: { status: 'OVERDUE' },
        });
        borrow.status = 'OVERDUE';
      }
    }

    return NextResponse.json({
      success: true,
      data: borrowedBooks,
    });
  } catch (error) {
    console.error('Error fetching borrowed books:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch borrowed books' },
      { status: 500 }
    );
  }
}

// POST /api/library/borrow - Borrow a book
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookId, studentId, dueDate } = body;

    if (!bookId || !studentId || !dueDate) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if book exists and is available
    const book = await prisma.book.findUnique({
      where: { id: bookId },
    });

    if (!book) {
      return NextResponse.json(
        { success: false, error: 'Book not found' },
        { status: 404 }
      );
    }

    if (book.available <= 0) {
      return NextResponse.json(
        { success: false, error: 'Book is not available' },
        { status: 400 }
      );
    }

    // Check if student exists
    const student = await prisma.student.findFirst({
      where: { studentId },
    });

    if (!student) {
      return NextResponse.json(
        { success: false, error: 'Student not found' },
        { status: 404 }
      );
    }

    // Check if student already has this book borrowed
    const existingBorrow = await prisma.borrowedBook.findFirst({
      where: {
        bookId,
        studentId: student.id,
        status: { in: ['BORROWED', 'OVERDUE'] },
      },
    });

    if (existingBorrow) {
      return NextResponse.json(
        { success: false, error: 'Student already has this book borrowed' },
        { status: 400 }
      );
    }

    // Create borrow record and update book availability
    const [borrowedBook] = await prisma.$transaction([
      prisma.borrowedBook.create({
        data: {
          bookId,
          studentId: student.id,
          dueDate: new Date(dueDate),
          status: 'BORROWED',
        },
        include: {
          book: true,
          student: true,
        },
      }),
      prisma.book.update({
        where: { id: bookId },
        data: { available: { decrement: 1 } },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: borrowedBook,
      message: 'Book borrowed successfully',
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error borrowing book:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to borrow book' },
      { status: 500 }
    );
  }
}
