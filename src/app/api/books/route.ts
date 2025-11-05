import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';

// GET /api/books
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');

    const db = getDatabase();
    let books = db.getAllBooks();

    if (category && category !== 'all') {
      books = books.filter(b => b.category === category);
    }

    return NextResponse.json({ success: true, data: books });
  } catch (error) {
    console.error('Error fetching books:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch books' },
      { status: 500 }
    );
  }
}

// POST /api/books
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const db = getDatabase();
    
    const book = db.addBook(body);
    return NextResponse.json({ success: true, data: book });
  } catch (error) {
    console.error('Error adding book:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add book' },
      { status: 500 }
    );
  }
}

// PUT /api/books
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...bookData } = body;

    const db = getDatabase();
    const book = db.updateBook(id, bookData);

    if (!book) {
      return NextResponse.json(
        { success: false, error: 'Book not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: book });
  } catch (error) {
    console.error('Error updating book:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update book' },
      { status: 500 }
    );
  }
}

// DELETE /api/books
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Book ID required' },
        { status: 400 }
      );
    }

    const db = getDatabase();
    const deleted = db.deleteBook(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Book not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: 'Book deleted' });
  } catch (error) {
    console.error('Error deleting book:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete book' },
      { status: 500 }
    );
  }
}
