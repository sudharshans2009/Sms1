import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// DELETE /api/library/books/[id] - Delete a book
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if book exists
    const book = await prisma.book.findUnique({
      where: { id },
      include: { borrowedBooks: true },
    });

    if (!book) {
      return NextResponse.json(
        { success: false, error: 'Book not found' },
        { status: 404 }
      );
    }

    // Check if book is currently borrowed
    const activeBorrows = book.borrowedBooks.filter(
      (b: any) => b.status === 'BORROWED' || b.status === 'OVERDUE'
    );

    if (activeBorrows.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cannot delete book with active borrows. Please return all copies first.',
        },
        { status: 400 }
      );
    }

    // Delete the book
    await prisma.book.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Book deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting book:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete book' },
      { status: 500 }
    );
  }
}

// PUT /api/library/books/[id] - Update a book
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const book = await prisma.book.update({
      where: { id },
      data: {
        ...body,
        year: body.year ? parseInt(body.year) : undefined,
        pages: body.pages ? parseInt(body.pages) : undefined,
        price: body.price ? parseFloat(body.price) : undefined,
        quantity: body.quantity ? parseInt(body.quantity) : undefined,
      },
    });

    return NextResponse.json({
      success: true,
      data: book,
      message: 'Book updated successfully',
    });
  } catch (error) {
    console.error('Error updating book:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update book' },
      { status: 500 }
    );
  }
}
