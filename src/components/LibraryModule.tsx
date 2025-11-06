'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

interface LibraryModuleProps {
  userRole: string;
}

interface Book {
  id: string;
  bookId: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  publisher: string;
  year: number;
  edition?: string;
  language: string;
  pages?: number;
  price?: number;
  quantity: number;
  available: number;
  location: string;
  description?: string;
  coverImage?: string;
}

interface BorrowedBook {
  id: string;
  book: Book;
  student: any;
  borrowDate: string;
  dueDate: string;
  returnDate?: string;
  status: 'BORROWED' | 'RETURNED' | 'OVERDUE' | 'LOST';
  fine: number;
}

export default function LibraryModule({ userRole }: LibraryModuleProps) {
  const [books, setBooks] = useState<Book[]>([]);
  const [borrowedBooks, setBorrowedBooks] = useState<BorrowedBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'borrowed' | 'add'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBorrowModal, setShowBorrowModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  const [newBook, setNewBook] = useState({
    bookId: '',
    title: '',
    author: '',
    isbn: '',
    category: 'textbook',
    publisher: '',
    year: new Date().getFullYear(),
    edition: '',
    language: 'English',
    pages: 0,
    price: 0,
    quantity: 1,
    location: '',
    description: '',
  });

  const [borrowData, setBorrowData] = useState({
    studentId: '',
    dueDate: '',
  });

  const categories = [
    'textbook',
    'reference',
    'fiction',
    'non-fiction',
    'science',
    'history',
    'biography',
    'children',
    'magazine',
    'other',
  ];

  useEffect(() => {
    loadBooks();
    if (userRole === 'admin' || userRole === 'teacher') {
      loadBorrowedBooks();
    }
  }, [userRole]);

  const loadBooks = async () => {
    try {
      const response = await axios.get('/api/library/books');
      if (response.data.success) {
        setBooks(response.data.data);
      }
    } catch (error) {
      console.error('Error loading books:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBorrowedBooks = async () => {
    try {
      const response = await axios.get('/api/library/borrowed');
      if (response.data.success) {
        setBorrowedBooks(response.data.data);
      }
    } catch (error) {
      console.error('Error loading borrowed books:', error);
    }
  };

  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/library/books', newBook);
      if (response.data.success) {
        setBooks([response.data.data, ...books]);
        setShowAddModal(false);
        setNewBook({
          bookId: '',
          title: '',
          author: '',
          isbn: '',
          category: 'textbook',
          publisher: '',
          year: new Date().getFullYear(),
          edition: '',
          language: 'English',
          pages: 0,
          price: 0,
          quantity: 1,
          location: '',
          description: '',
        });
        alert('✅ Book added successfully!');
      }
    } catch (error) {
      console.error('Error adding book:', error);
      alert('❌ Failed to add book');
    }
  };

  const handleBorrowBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBook) return;

    try {
      const response = await axios.post('/api/library/borrow', {
        bookId: selectedBook.id,
        ...borrowData,
      });
      if (response.data.success) {
        loadBooks();
        loadBorrowedBooks();
        setShowBorrowModal(false);
        setSelectedBook(null);
        setBorrowData({ studentId: '', dueDate: '' });
        alert('✅ Book borrowed successfully!');
      }
    } catch (error: any) {
      console.error('Error borrowing book:', error);
      alert(`❌ ${error.response?.data?.error || 'Failed to borrow book'}`);
    }
  };

  const handleReturnBook = async (borrowId: string) => {
    if (!confirm('Mark this book as returned?')) return;

    try {
      const response = await axios.put(`/api/library/borrowed/${borrowId}/return`);
      if (response.data.success) {
        loadBooks();
        loadBorrowedBooks();
        alert('✅ Book returned successfully!');
      }
    } catch (error) {
      console.error('Error returning book:', error);
      alert('❌ Failed to return book');
    }
  };

  const handleDeleteBook = async (bookId: string) => {
    if (!confirm('Are you sure you want to delete this book?')) return;

    try {
      const response = await axios.delete(`/api/library/books/${bookId}`);
      if (response.data.success) {
        setBooks(books.filter((b) => b.id !== bookId));
        alert('✅ Book deleted successfully!');
      }
    } catch (error) {
      console.error('Error deleting book:', error);
      alert('❌ Failed to delete book');
    }
  };

  const handleDeleteAllBooks = async () => {
    if (!confirm('⚠️ Are you sure you want to delete ALL books? This action cannot be undone!')) return;
    
    if (!confirm('⚠️ FINAL WARNING: This will permanently delete ALL books from the library. Continue?')) return;

    try {
      setLoading(true);
      // Delete all books one by one
      const deletePromises = books.map((book) => axios.delete(`/api/library/books/${book.id}`));
      await Promise.all(deletePromises);
      
      setBooks([]);
      alert('✅ All books deleted successfully!');
    } catch (error) {
      console.error('Error deleting all books:', error);
      alert('❌ Failed to delete all books');
    } finally {
      setLoading(false);
    }
  };

  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.isbn.includes(searchTerm) ||
      book.bookId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || book.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const stats = {
    totalBooks: books.reduce((sum, b) => sum + b.quantity, 0),
    available: books.reduce((sum, b) => sum + b.available, 0),
    borrowed: books.reduce((sum, b) => sum + (b.quantity - b.available), 0),
    categories: new Set(books.map((b) => b.category)).size,
    overdue: borrowedBooks.filter((b) => b.status === 'OVERDUE').length,
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amrita-orange"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading library...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span>📚</span>
            Library Management System
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage books, track borrowing, and monitor inventory
          </p>
        </div>
        {(userRole === 'admin' || userRole === 'teacher') && (
          <div className="flex gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary bg-amrita-orange hover:bg-orange-600 flex items-center gap-2"
            >
              <span>➕</span>
              Add New Book
            </button>
            {userRole === 'admin' && books.length > 0 && (
              <button
                onClick={handleDeleteAllBooks}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
              >
                <span>🗑️</span>
                Delete All Books
              </button>
            )}
          </div>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <h3 className="text-sm font-semibold opacity-90">Total Books</h3>
          <p className="text-3xl font-bold mt-2">{stats.totalBooks}</p>
          <p className="text-xs mt-1 opacity-75">All copies</p>
        </div>
        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <h3 className="text-sm font-semibold opacity-90">Available</h3>
          <p className="text-3xl font-bold mt-2">{stats.available}</p>
          <p className="text-xs mt-1 opacity-75">Ready to borrow</p>
        </div>
        <div className="card bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
          <h3 className="text-sm font-semibold opacity-90">Borrowed</h3>
          <p className="text-3xl font-bold mt-2">{stats.borrowed}</p>
          <p className="text-xs mt-1 opacity-75">Currently out</p>
        </div>
        <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <h3 className="text-sm font-semibold opacity-90">Categories</h3>
          <p className="text-3xl font-bold mt-2">{stats.categories}</p>
          <p className="text-xs mt-1 opacity-75">Different types</p>
        </div>
        <div className="card bg-gradient-to-br from-red-500 to-red-600 text-white">
          <h3 className="text-sm font-semibold opacity-90">Overdue</h3>
          <p className="text-3xl font-bold mt-2">{stats.overdue}</p>
          <p className="text-xs mt-1 opacity-75">Need attention</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-6 py-3 font-semibold transition-colors ${
            activeTab === 'all'
              ? 'border-b-2 border-amrita-orange text-amrita-orange'
              : 'text-gray-600 dark:text-gray-400 hover:text-amrita-orange'
          }`}
        >
          📚 All Books ({books.length})
        </button>
        {(userRole === 'admin' || userRole === 'teacher') && (
          <button
            onClick={() => setActiveTab('borrowed')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'borrowed'
                ? 'border-b-2 border-amrita-orange text-amrita-orange'
                : 'text-gray-600 dark:text-gray-400 hover:text-amrita-orange'
            }`}
          >
            📖 Borrowed Books ({borrowedBooks.length})
          </button>
        )}
      </div>

      {/* All Books Tab */}
      {activeTab === 'all' && (
        <>
          {/* Search and Filter */}
          <div className="card">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">
                  🔍 Search Books
                </label>
                <input
                  type="text"
                  placeholder="Search by title, author, ISBN, or book ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  📂 Filter by Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="input-field"
                >
                  <option value="all">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Books Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBooks.map((book) => (
              <div key={book.id} className="card hover:shadow-xl transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-20 h-28 bg-gradient-to-br from-amrita-orange to-amrita-blue rounded-lg flex items-center justify-center text-4xl">
                      📖
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg mb-1 truncate">{book.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      by {book.author}
                    </p>
                    <div className="space-y-1 text-xs">
                      <p>
                        <span className="font-semibold">ID:</span> {book.bookId}
                      </p>
                      <p>
                        <span className="font-semibold">ISBN:</span> {book.isbn}
                      </p>
                      <p>
                        <span className="font-semibold">Category:</span>{' '}
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 rounded-full">
                          {book.category}
                        </span>
                      </p>
                      <p>
                        <span className="font-semibold">Publisher:</span> {book.publisher} ({book.year})
                      </p>
                      <p>
                        <span className="font-semibold">Location:</span> {book.location}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Availability</p>
                      <p className="text-lg font-bold">
                        <span className="text-green-600">{book.available}</span> /{' '}
                        {book.quantity}
                      </p>
                    </div>
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        book.available > 0
                          ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                          : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                      }`}
                    >
                      {book.available > 0 ? '✓ Available' : '✗ Not Available'}
                    </div>
                  </div>

                  {(userRole === 'admin' || userRole === 'teacher') && (
                    <div className="flex gap-2">
                      {book.available > 0 && (
                        <button
                          onClick={() => {
                            setSelectedBook(book);
                            setShowBorrowModal(true);
                          }}
                          className="flex-1 bg-amrita-blue text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-blue-600 transition-colors"
                        >
                          Borrow
                        </button>
                      )}
                      {userRole === 'admin' && (
                        <button
                          onClick={() => handleDeleteBook(book.id)}
                          className="bg-red-500 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredBooks.length === 0 && (
            <div className="card text-center py-12">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-xl font-bold text-gray-600 dark:text-gray-400">
                No books found
              </h3>
              <p className="text-gray-500 dark:text-gray-500 mt-2">
                Try adjusting your search or filter criteria
              </p>
            </div>
          )}
        </>
      )}

      {/* Borrowed Books Tab */}
      {activeTab === 'borrowed' && (userRole === 'admin' || userRole === 'teacher') && (
        <div className="card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-amrita-orange to-amrita-blue text-white">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase">Book</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase">Student</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase">Borrowed Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase">Due Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase">Fine</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {borrowedBooks.map((borrow) => (
                  <tr key={borrow.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-semibold">{borrow.book.title}</p>
                        <p className="text-xs text-gray-500">{borrow.book.bookId}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-semibold">{borrow.student.name}</p>
                        <p className="text-xs text-gray-500">{borrow.student.studentId}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {new Date(borrow.borrowDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {new Date(borrow.dueDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-bold ${
                          borrow.status === 'BORROWED'
                            ? 'bg-blue-100 text-blue-700'
                            : borrow.status === 'RETURNED'
                            ? 'bg-green-100 text-green-700'
                            : borrow.status === 'OVERDUE'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {borrow.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold">
                      {borrow.fine > 0 ? `₹${borrow.fine}` : '-'}
                    </td>
                    <td className="px-4 py-3">
                      {borrow.status === 'BORROWED' || borrow.status === 'OVERDUE' ? (
                        <button
                          onClick={() => handleReturnBook(borrow.id)}
                          className="bg-green-500 text-white px-3 py-1 rounded text-xs font-semibold hover:bg-green-600"
                        >
                          Return
                        </button>
                      ) : (
                        <span className="text-gray-400 text-xs">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {borrowedBooks.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📖</div>
                <p className="text-gray-600 dark:text-gray-400">No borrowed books</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Book Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-2xl font-bold">Add New Book</h3>
            </div>
            <form onSubmit={handleAddBook} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Book ID *</label>
                  <input
                    type="text"
                    required
                    value={newBook.bookId}
                    onChange={(e) => setNewBook({ ...newBook, bookId: e.target.value })}
                    className="input-field"
                    placeholder="B001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">ISBN *</label>
                  <input
                    type="text"
                    required
                    value={newBook.isbn}
                    onChange={(e) => setNewBook({ ...newBook, isbn: e.target.value })}
                    className="input-field"
                    placeholder="978-3-16-148410-0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Title *</label>
                <input
                  type="text"
                  required
                  value={newBook.title}
                  onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                  className="input-field"
                  placeholder="Book title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Author *</label>
                <input
                  type="text"
                  required
                  value={newBook.author}
                  onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
                  className="input-field"
                  placeholder="Author name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Category *</label>
                  <select
                    value={newBook.category}
                    onChange={(e) => setNewBook({ ...newBook, category: e.target.value })}
                    className="input-field"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Language</label>
                  <input
                    type="text"
                    value={newBook.language}
                    onChange={(e) => setNewBook({ ...newBook, language: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Publisher *</label>
                  <input
                    type="text"
                    required
                    value={newBook.publisher}
                    onChange={(e) => setNewBook({ ...newBook, publisher: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Year *</label>
                  <input
                    type="number"
                    required
                    value={newBook.year}
                    onChange={(e) =>
                      setNewBook({ ...newBook, year: parseInt(e.target.value) })
                    }
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Edition</label>
                  <input
                    type="text"
                    value={newBook.edition}
                    onChange={(e) => setNewBook({ ...newBook, edition: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Pages</label>
                  <input
                    type="number"
                    value={newBook.pages}
                    onChange={(e) =>
                      setNewBook({ ...newBook, pages: parseInt(e.target.value) || 0 })
                    }
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newBook.price}
                    onChange={(e) =>
                      setNewBook({ ...newBook, price: parseFloat(e.target.value) || 0 })
                    }
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Quantity *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newBook.quantity}
                    onChange={(e) =>
                      setNewBook({ ...newBook, quantity: parseInt(e.target.value) || 1 })
                    }
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Location *</label>
                <input
                  type="text"
                  required
                  value={newBook.location}
                  onChange={(e) => setNewBook({ ...newBook, location: e.target.value })}
                  className="input-field"
                  placeholder="Shelf A-1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={newBook.description}
                  onChange={(e) => setNewBook({ ...newBook, description: e.target.value })}
                  className="input-field"
                  rows={3}
                  placeholder="Brief description of the book"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 btn-primary bg-amrita-orange hover:bg-orange-600">
                  Add Book
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Borrow Book Modal */}
      {showBorrowModal && selectedBook && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-2xl font-bold">Borrow Book</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {selectedBook.title}
              </p>
            </div>
            <form onSubmit={handleBorrowBook} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Student ID *</label>
                <input
                  type="text"
                  required
                  value={borrowData.studentId}
                  onChange={(e) =>
                    setBorrowData({ ...borrowData, studentId: e.target.value })
                  }
                  className="input-field"
                  placeholder="AV001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Due Date *</label>
                <input
                  type="date"
                  required
                  value={borrowData.dueDate}
                  onChange={(e) =>
                    setBorrowData({ ...borrowData, dueDate: e.target.value })
                  }
                  className="input-field"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 btn-primary bg-amrita-blue hover:bg-blue-600"
                >
                  Confirm Borrow
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowBorrowModal(false);
                    setSelectedBook(null);
                  }}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
