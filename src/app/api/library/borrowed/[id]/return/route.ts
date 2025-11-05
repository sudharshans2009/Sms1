import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// PUT /api/library/borrowed/[id]/return - Return a book
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Get borrow record
    const borrowRecord = await prisma.borrowedBook.findUnique({
      where: { id },
      include: { book: true },
    });

    if (!borrowRecord) {
      return NextResponse.json(
        { success: false, error: 'Borrow record not found' },
        { status: 404 }
      );
    }

    if (borrowRecord.status === 'RETURNED') {
      return NextResponse.json(
        { success: false, error: 'Book already returned' },
        { status: 400 }
      );
    }

    // Calculate fine if overdue
    const now = new Date();
    const dueDate = new Date(borrowRecord.dueDate);
    let fine = 0;

    if (now > dueDate) {
      const daysLate = Math.ceil((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
      fine = daysLate * 5; // ₹5 per day
    }

    // Update borrow record and book availability
    const [updatedBorrow] = await prisma.$transaction([
      prisma.borrowedBook.update({
        where: { id },
        data: {
          returnDate: now,
          status: 'RETURNED',
          fine,
        },
        include: {
          book: true,
          student: true,
        },
      }),
      prisma.book.update({
        where: { id: borrowRecord.bookId },
        data: { available: { increment: 1 } },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: updatedBorrow,
      message: fine > 0 
        ? `Book returned. Fine: ₹${fine} (${Math.ceil((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))} days late)`
        : 'Book returned successfully',
    });
  } catch (error) {
    console.error('Error returning book:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to return book' },
      { status: 500 }
    );
  }
}
