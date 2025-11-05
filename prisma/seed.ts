const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create Users
  console.log('Creating users...');
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@123' },
    update: {},
    create: {
      email: 'admin@123',
      password: 'admin', // In production, use bcrypt
      name: 'Admin User',
      role: 'ADMIN',
    },
  });

  const teacherUser = await prisma.user.upsert({
    where: { email: 'teacher@123' },
    update: {},
    create: {
      email: 'teacher@123',
      password: 'teacher',
      name: 'Teacher User',
      role: 'TEACHER',
    },
  });

  const studentUser = await prisma.user.upsert({
    where: { email: 'student@123' },
    update: {},
    create: {
      email: 'student@123',
      password: 'student',
      name: 'Student User',
      role: 'STUDENT',
    },
  });

  const driverUser = await prisma.user.upsert({
    where: { email: 'driver@123' },
    update: {},
    create: {
      email: 'driver@123',
      password: 'driver',
      name: 'Driver User',
      role: 'DRIVER',
    },
  });

  console.log('✅ Users created');

  // Create Students
  console.log('Creating students...');
  const students = [
    {
      studentId: 'AV001',
      name: 'Alice Smith',
      class: '5',
      section: 'A',
      parentPhone: '+1234567890',
      parentEmail: 'parent1@example.com',
    },
    {
      studentId: 'AV002',
      name: 'Bob Johnson',
      class: '5',
      section: 'B',
      parentPhone: '+1234567891',
      parentEmail: 'parent2@example.com',
    },
    {
      studentId: 'AV003',
      name: 'Carol Williams',
      class: '11',
      section: 'A',
      parentPhone: '+1234567892',
      parentEmail: 'parent3@example.com',
      studentPhone: '+1234567893',
      studentEmail: 'student3@example.com',
    },
    {
      studentId: 'AV004',
      name: 'David Brown',
      class: '11',
      section: 'B',
      parentPhone: '+1234567894',
      parentEmail: 'parent4@example.com',
      studentPhone: '+1234567895',
      studentEmail: 'student4@example.com',
    },
  ];

  for (const student of students) {
    await prisma.student.upsert({
      where: { studentId: student.studentId },
      update: {},
      create: student,
    });
  }

  console.log('✅ Students created');

  // Create Books
  console.log('Creating library books...');
  const books = [
    {
      bookId: 'B001',
      title: 'Mathematics for Class 5',
      author: 'R.D. Sharma',
      isbn: '978-93-5141-234-5',
      category: 'textbook',
      publisher: 'Dhanpat Rai',
      year: 2020,
      language: 'English',
      pages: 350,
      price: 450.00,
      quantity: 50,
      available: 45,
      location: 'Shelf A-1',
      description: 'Complete mathematics textbook for Class 5 students',
    },
    {
      bookId: 'B002',
      title: 'Science for Class 5',
      author: 'Lakhmir Singh',
      isbn: '978-93-87445-123-4',
      category: 'textbook',
      publisher: 'S. Chand',
      year: 2021,
      language: 'English',
      pages: 280,
      price: 380.00,
      quantity: 40,
      available: 35,
      location: 'Shelf A-2',
      description: 'Science textbook with experiments and activities',
    },
    {
      bookId: 'B003',
      title: 'Harry Potter and the Philosopher\'s Stone',
      author: 'J.K. Rowling',
      isbn: '978-0-7475-3269-9',
      category: 'fiction',
      publisher: 'Bloomsbury',
      year: 1997,
      language: 'English',
      pages: 223,
      price: 299.00,
      quantity: 20,
      available: 18,
      location: 'Shelf B-1',
      description: 'First book in the Harry Potter series',
    },
    {
      bookId: 'B004',
      title: 'The Diary of a Young Girl',
      author: 'Anne Frank',
      isbn: '978-0-14-028655-2',
      category: 'non-fiction',
      publisher: 'Penguin',
      year: 1947,
      language: 'English',
      pages: 283,
      price: 250.00,
      quantity: 15,
      available: 13,
      location: 'Shelf B-2',
      description: 'The diary of Anne Frank during World War II',
    },
    {
      bookId: 'B005',
      title: 'A Brief History of Time',
      author: 'Stephen Hawking',
      isbn: '978-0-553-10953-5',
      category: 'science',
      publisher: 'Bantam',
      year: 1988,
      language: 'English',
      pages: 256,
      price: 450.00,
      quantity: 10,
      available: 10,
      location: 'Shelf C-1',
      description: 'Popular science book about cosmology',
    },
    {
      bookId: 'B006',
      title: 'The Complete Works of William Shakespeare',
      author: 'William Shakespeare',
      isbn: '978-0-19-953734-1',
      category: 'fiction',
      publisher: 'Oxford',
      year: 2008,
      language: 'English',
      pages: 1344,
      price: 850.00,
      quantity: 8,
      available: 8,
      location: 'Shelf C-2',
      description: 'Complete collection of Shakespeare\'s plays and sonnets',
    },
    {
      bookId: 'B007',
      title: 'Indian History',
      author: 'Bipan Chandra',
      isbn: '978-0-14-303177-3',
      category: 'history',
      publisher: 'Orient Blackswan',
      year: 2016,
      language: 'English',
      pages: 520,
      price: 550.00,
      quantity: 25,
      available: 22,
      location: 'Shelf D-1',
      description: 'Comprehensive history of modern India',
    },
    {
      bookId: 'B008',
      title: 'Wings of Fire',
      author: 'A.P.J. Abdul Kalam',
      isbn: '978-81-7371-146-6',
      category: 'biography',
      publisher: 'Universities Press',
      year: 1999,
      language: 'English',
      pages: 196,
      price: 200.00,
      quantity: 30,
      available: 25,
      location: 'Shelf D-2',
      description: 'Autobiography of Dr. A.P.J. Abdul Kalam',
    },
  ];

  for (const book of books) {
    await prisma.book.upsert({
      where: { bookId: book.bookId },
      update: {},
      create: book,
    });
  }

  console.log('✅ Books created');

  // Create Book Categories
  console.log('Creating book categories...');
  const categories = [
    { name: 'textbook', description: 'School textbooks and educational materials' },
    { name: 'reference', description: 'Reference books and encyclopedias' },
    { name: 'fiction', description: 'Fiction novels and story books' },
    { name: 'non-fiction', description: 'Non-fiction books and essays' },
    { name: 'science', description: 'Science and technology books' },
    { name: 'history', description: 'History and historical fiction' },
    { name: 'biography', description: 'Biographies and autobiographies' },
    { name: 'children', description: 'Children\'s books and picture books' },
    { name: 'magazine', description: 'Magazines and periodicals' },
    { name: 'other', description: 'Other books' },
  ];

  for (const category of categories) {
    await prisma.bookCategory.upsert({
      where: { name: category.name },
      update: {},
      create: category,
    });
  }

  console.log('✅ Categories created');

  // Create Classes
  console.log('Creating classes...');
  const classes = [
    { class: '5', section: 'A', classTeacher: 'Jane Davis', studentsCount: 30, classHead: 'John Doe' },
    { class: '5', section: 'B', classTeacher: 'Robert Miller', studentsCount: 28, classHead: 'Jane Smith' },
    { class: '11', section: 'A', classTeacher: 'Emily Wilson', studentsCount: 25, classHead: 'Michael Brown' },
    { class: '11', section: 'B', classTeacher: 'Sarah Johnson', studentsCount: 27, classHead: 'David Lee' },
  ];

  for (const cls of classes) {
    await prisma.class.upsert({
      where: { class_section: { class: cls.class, section: cls.section } },
      update: {},
      create: cls,
    });
  }

  console.log('✅ Classes created');

  // Create Buses
  console.log('Creating buses...');
  const buses = [
    {
      busId: 'AV01',
      driverName: 'Ramesh Kumar',
      route: 'Ettimadai - Coimbatore',
      currentLat: 10.9027,
      currentLng: 76.9015,
      status: 'ACTIVE',
      speed: 40,
    },
    {
      busId: 'AV02',
      driverName: 'Suresh Babu',
      route: 'Ettimadai - Palakkad',
      currentLat: 10.7827,
      currentLng: 76.6515,
      status: 'ACTIVE',
      speed: 35,
    },
    {
      busId: 'P1',
      driverName: 'Manoj Kumar',
      route: 'Ettimadai - Coimbatore',
      currentLat: 10.8527,
      currentLng: 76.8015,
      status: 'ACTIVE',
      speed: 45,
    },
    {
      busId: 'P2',
      driverName: 'Vijay Kumar',
      route: 'Ettimadai - Palakkad',
      currentLat: 10.7327,
      currentLng: 76.6015,
      status: 'ACTIVE',
      speed: 38,
    },
  ];

  for (const bus of buses) {
    await prisma.bus.upsert({
      where: { busId: bus.busId },
      update: {},
      create: bus,
    });
  }

  console.log('✅ Buses created');

  // Create Announcements
  console.log('Creating announcements...');
  const announcements = [
    {
      title: 'School Annual Day',
      content: 'Annual day celebration will be held on 25th November 2024. All students must attend.',
      priority: 'IMPORTANT',
      target: 'ALL',
    },
    {
      title: 'Library New Books',
      content: 'New collection of books has arrived in the library. Visit during break time to check them out.',
      priority: 'NORMAL',
      target: 'STUDENTS',
    },
    {
      title: 'PTA Meeting',
      content: 'Parent-Teacher meeting scheduled for 15th November 2024 at 10:00 AM.',
      priority: 'IMPORTANT',
      target: 'PARENTS',
    },
  ];

  for (const announcement of announcements) {
    await prisma.announcement.create({
      data: announcement,
    });
  }

  console.log('✅ Announcements created');

  console.log('');
  console.log('🎉 Database seeding completed successfully!');
  console.log('');
  console.log('📚 Created:');
  console.log('   - 4 Users (admin, teacher, student, driver)');
  console.log('   - 4 Students');
  console.log('   - 8 Library Books');
  console.log('   - 10 Book Categories');
  console.log('   - 4 Classes');
  console.log('   - 4 Buses');
  console.log('   - 3 Announcements');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
