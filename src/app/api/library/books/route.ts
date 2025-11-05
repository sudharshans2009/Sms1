import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/library/books - Get all books
export async function GET(request: NextRequest) {
  try {
    const books = await prisma.book.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: books,
    });
  } catch (error) {
    console.error('Error fetching books:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch books' },
      { status: 500 }
    );
  }
}

// POST /api/library/books - Add new book
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      bookId,
      title,
      author,
      isbn,
      category,
      publisher,
      year,
      edition,
      language,
      pages,
      price,
      quantity,
      location,
      description,
    } = body;

    // Validate required fields
    if (!bookId || !title || !author || !isbn || !category || !publisher || !year || !location) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if book ID or ISBN already exists
    const existingBook = await prisma.book.findFirst({
      where: {
        OR: [{ bookId }, { isbn }],
      },
    });

    if (existingBook) {
      return NextResponse.json(
        { success: false, error: 'Book with this ID or ISBN already exists' },
        { status: 400 }
      );
    }

    const book = await prisma.book.create({
      data: {
        bookId,
        title,
        author,
        isbn,
        category,
        publisher,
        year: parseInt(year),
        edition: edition || null,
        language: language || 'English',
        pages: pages ? parseInt(pages) : null,
        price: price ? parseFloat(price) : null,
        quantity: parseInt(quantity) || 1,
        available: parseInt(quantity) || 1,
        location,
        description: description || null,
      },
    });

    return NextResponse.json({
      success: true,
      data: book,
      message: 'Book added successfully',
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error adding book:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to add book' },
      { status: 500 }
    );
  }
}
