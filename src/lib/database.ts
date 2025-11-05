// Fake Database - In-Memory Storage
// This will be replaced with actual database later

export interface Timetable {
  id: string;
  class: string;
  section: string;
  schedule: {
    [day: string]: {
      [period: string]: string;
    };
  };
  lastUpdated: string;
  updatedBy: string;
}

export interface Student {
  id: string;
  name: string;
  class: string;
  section: string;
  parentPhone: string;
  parentEmail: string;
  studentPhone?: string;
  studentEmail?: string;
  bus: string;
}

export interface Teacher {
  id: string;
  name: string;
  subject: string;
  classTeacher: string;
  phone: string;
  email: string;
  isClassHead: boolean;
}

export interface User {
  id: string;
  email: string;
  password: string;
  role: 'admin' | 'teacher' | 'student' | 'driver';
  name: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  priority: 'normal' | 'important' | 'urgent';
  target: 'all' | 'students' | 'teachers' | 'parents';
}

export interface Class {
  class: string;
  section: string;
  classTeacher: string;
  studentsCount: number;
  classHead: string;
}

export interface Bus {
  id: string;
  driverName: string;
  route: string;
  currentLocation: { lat: number; lng: number };
  status: string;
  students: number;
  speed: number;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  publisher: string;
  year: number;
  quantity: number;
  available: number;
  location: string;
}

export interface Attendance {
  id: string;
  studentId: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'leave';
  class: string;
  section: string;
}

export interface Marks {
  id: string;
  studentId: string;
  class: string;
  section: string;
  examType: string;
  subjects: { [subject: string]: number };
  total: number;
  grade: string;
}

// In-memory storage
class Database {
  private timetables: Map<string, Timetable> = new Map();
  private students: Map<string, Student> = new Map();
  private teachers: Map<string, Teacher> = new Map();
  private users: Map<string, User> = new Map();
  private announcements: Map<string, Announcement> = new Map();
  private classes: Map<string, Class> = new Map();
  private buses: Map<string, Bus> = new Map();
  private books: Map<string, Book> = new Map();
  private attendance: Map<string, Attendance> = new Map();
  private marks: Map<string, Marks> = new Map();

  constructor() {
    this.initializeData();
  }

  private initializeData() {
    // Initialize default users
    this.users.set('admin@123', {
      id: 'u1',
      email: 'admin@123',
      password: 'admin',
      role: 'admin',
      name: 'Admin User'
    });
    this.users.set('teacher@123', {
      id: 'u2',
      email: 'teacher@123',
      password: 'teacher',
      role: 'teacher',
      name: 'Teacher User'
    });
    this.users.set('student@123', {
      id: 'u3',
      email: 'student@123',
      password: 'student',
      role: 'student',
      name: 'Student User'
    });
    this.users.set('driver@123', {
      id: 'u4',
      email: 'driver@123',
      password: 'driver',
      role: 'driver',
      name: 'Driver User'
    });

    // Initialize sample students
    const students: Student[] = [
      { id: 'AV001', name: 'Alice Smith', class: '5', section: 'A', parentPhone: '+1234567890', parentEmail: 'parent1@example.com', bus: 'AV01' },
      { id: 'AV002', name: 'Bob Johnson', class: '5', section: 'B', parentPhone: '+1234567891', parentEmail: 'parent2@example.com', bus: 'AV02' },
      { id: 'AV003', name: 'Carol Williams', class: '11', section: 'A', parentPhone: '+1234567892', parentEmail: 'parent3@example.com', studentPhone: '+1234567893', studentEmail: 'student3@example.com', bus: 'P1' },
      { id: 'AV004', name: 'David Brown', class: '11', section: 'B', parentPhone: '+1234567894', parentEmail: 'parent4@example.com', studentPhone: '+1234567895', studentEmail: 'student4@example.com', bus: 'P2' }
    ];
    students.forEach(s => this.students.set(s.id, s));

    // Initialize sample teachers
    const teachers: Teacher[] = [
      { id: 'T001', name: 'Jane Davis', subject: 'Mathematics', classTeacher: '5-A', phone: '+1234567896', email: 'jane@amrita.edu', isClassHead: false },
      { id: 'T002', name: 'Robert Miller', subject: 'Science', classTeacher: '5-B', phone: '+1234567897', email: 'robert@amrita.edu', isClassHead: false },
      { id: 'T003', name: 'Emily Wilson', subject: 'English', classTeacher: '11-A', phone: '+1234567898', email: 'emily@amrita.edu', isClassHead: true }
    ];
    teachers.forEach(t => this.teachers.set(t.id, t));

    // Initialize separate timetables for each class-section
    this.initializeTimetables();

    // Initialize announcements
    const announcements: Announcement[] = [
      { id: '1', title: 'School Annual Day', content: 'Annual day celebration will be held on 25th November 2024.', date: '2024-11-01', priority: 'important', target: 'all' },
      { id: '2', title: 'PTA Meeting', content: 'Parent-Teacher meeting scheduled for 15th November 2024.', date: '2024-10-28', priority: 'normal', target: 'parents' }
    ];
    announcements.forEach(a => this.announcements.set(a.id, a));

    // Initialize classes
    const classes: Class[] = [
      { class: '5', section: 'A', classTeacher: 'Jane Davis', studentsCount: 30, classHead: 'John Doe' },
      { class: '5', section: 'B', classTeacher: 'Robert Miller', studentsCount: 28, classHead: 'Jane Smith' },
      { class: '11', section: 'A', classTeacher: 'Emily Wilson', studentsCount: 25, classHead: 'Michael Brown' },
      { class: '11', section: 'B', classTeacher: 'Sarah Johnson', studentsCount: 27, classHead: 'David Lee' }
    ];
    classes.forEach(c => this.classes.set(`${c.class}-${c.section}`, c));

    // Initialize buses
    const buses: Bus[] = [
      { id: 'AV01', driverName: 'Ramesh Kumar', route: 'Ettimadai - Coimbatore', currentLocation: { lat: 10.9027, lng: 76.9015 }, status: 'Active', students: 25, speed: 40 },
      { id: 'AV02', driverName: 'Suresh Babu', route: 'Ettimadai - Palakkad', currentLocation: { lat: 10.7827, lng: 76.6515 }, status: 'Active', students: 20, speed: 35 },
      { id: 'P1', driverName: 'Manoj Kumar', route: 'Ettimadai - Coimbatore', currentLocation: { lat: 10.8527, lng: 76.8015 }, status: 'Active', students: 15, speed: 45 },
      { id: 'P2', driverName: 'Vijay Kumar', route: 'Ettimadai - Palakkad', currentLocation: { lat: 10.7327, lng: 76.6015 }, status: 'Active', students: 18, speed: 38 }
    ];
    buses.forEach(b => this.buses.set(b.id, b));

    // Initialize books
    const books: Book[] = [
      { id: 'B001', title: 'Mathematics for Class 5', author: 'R.D. Sharma', isbn: '978-93-5141-234-5', category: 'textbook', publisher: 'Dhanpat Rai', year: 2020, quantity: 50, available: 35, location: 'Shelf A-1' },
      { id: 'B002', title: 'Science for Class 5', author: 'Lakhmir Singh', isbn: '978-93-87445-123-4', category: 'textbook', publisher: 'S. Chand', year: 2021, quantity: 40, available: 28, location: 'Shelf A-2' },
      { id: 'B003', title: 'Harry Potter', author: 'J.K. Rowling', isbn: '978-0-7475-3269-9', category: 'fiction', publisher: 'Bloomsbury', year: 1997, quantity: 20, available: 15, location: 'Shelf B-1' },
      { id: 'B004', title: 'The Diary of a Young Girl', author: 'Anne Frank', isbn: '978-0-14-028655-2', category: 'non-fiction', publisher: 'Penguin', year: 1947, quantity: 15, available: 10, location: 'Shelf B-2' }
    ];
    books.forEach(b => this.books.set(b.id, b));
  }

  private initializeTimetables() {
    // Create unique timetables for different class-sections
    const classSections = [
      { class: '5', section: 'A' },
      { class: '5', section: 'B' },
      { class: '11', section: 'A' },
      { class: '11', section: 'B' }
    ];

    const defaultSchedules = {
      '5-A': {
        Monday: { '1': 'English', '2': 'Mathematics', '3': 'Science', '4': 'Social Science', '5': 'Language', '6': 'Computer', '7': 'Library' },
        Tuesday: { '1': 'Mathematics', '2': 'English', '3': 'Science', '4': 'Social Science', '5': 'Language', '6': 'Physical Education', '7': 'Art' },
        Wednesday: { '1': 'Science', '2': 'Mathematics', '3': 'English', '4': 'Social Science', '5': 'Language', '6': 'Computer', '7': 'Music' },
        Thursday: { '1': 'Social Science', '2': 'Science', '3': 'Mathematics', '4': 'English', '5': 'Language', '6': 'Computer', '7': 'Library' },
        Friday: { '1': 'Language', '2': 'Social Science', '3': 'Science', '4': 'Mathematics', '5': 'English', '6': 'Physical Education', '7': 'Assembly' }
      },
      '5-B': {
        Monday: { '1': 'Mathematics', '2': 'Science', '3': 'English', '4': 'Social Science', '5': 'Computer', '6': 'Language', '7': 'Art' },
        Tuesday: { '1': 'English', '2': 'Mathematics', '3': 'Social Science', '4': 'Science', '5': 'Language', '6': 'Physical Education', '7': 'Library' },
        Wednesday: { '1': 'Science', '2': 'English', '3': 'Mathematics', '4': 'Computer', '5': 'Social Science', '6': 'Language', '7': 'Music' },
        Thursday: { '1': 'Social Science', '2': 'Mathematics', '3': 'Science', '4': 'English', '5': 'Computer', '6': 'Language', '7': 'Art' },
        Friday: { '1': 'Computer', '2': 'Social Science', '3': 'English', '4': 'Mathematics', '5': 'Science', '6': 'Physical Education', '7': 'Assembly' }
      },
      '11-A': {
        Monday: { '1': 'Physics', '2': 'Chemistry', '3': 'Mathematics', '4': 'English', '5': 'Computer Science', '6': 'Biology', '7': 'Lab' },
        Tuesday: { '1': 'Mathematics', '2': 'Physics', '3': 'Chemistry', '4': 'English', '5': 'Computer Science', '6': 'Physical Education', '7': 'Lab' },
        Wednesday: { '1': 'Chemistry', '2': 'Mathematics', '3': 'Physics', '4': 'Biology', '5': 'English', '6': 'Computer Science', '7': 'Lab' },
        Thursday: { '1': 'Biology', '2': 'Chemistry', '3': 'Mathematics', '4': 'Physics', '5': 'English', '6': 'Computer Science', '7': 'Lab' },
        Friday: { '1': 'Computer Science', '2': 'Biology', '3': 'Chemistry', '4': 'Mathematics', '5': 'Physics', '6': 'English', '7': 'Assembly' }
      },
      '11-B': {
        Monday: { '1': 'Commerce', '2': 'Accountancy', '3': 'Economics', '4': 'English', '5': 'Business Studies', '6': 'Mathematics', '7': 'Computer' },
        Tuesday: { '1': 'Economics', '2': 'Commerce', '3': 'Accountancy', '4': 'English', '5': 'Mathematics', '6': 'Physical Education', '7': 'Computer' },
        Wednesday: { '1': 'Accountancy', '2': 'Economics', '3': 'Commerce', '4': 'Business Studies', '5': 'English', '6': 'Mathematics', '7': 'Computer' },
        Thursday: { '1': 'Business Studies', '2': 'Accountancy', '3': 'Economics', '4': 'Commerce', '5': 'English', '6': 'Mathematics', '7': 'Computer' },
        Friday: { '1': 'Mathematics', '2': 'Business Studies', '3': 'Accountancy', '4': 'Economics', '5': 'Commerce', '6': 'English', '7': 'Assembly' }
      }
    };

    classSections.forEach(({ class: cls, section }) => {
      const key = `${cls}-${section}`;
      const schedule = defaultSchedules[key as keyof typeof defaultSchedules] || defaultSchedules['5-A'];
      
      this.timetables.set(key, {
        id: key,
        class: cls,
        section: section,
        schedule: schedule,
        lastUpdated: new Date().toISOString(),
        updatedBy: 'system'
      });
    });
  }

  // Timetable operations
  getTimetable(classId: string, section: string): Timetable | null {
    const key = `${classId}-${section}`;
    return this.timetables.get(key) || null;
  }

  getAllTimetables(): Timetable[] {
    return Array.from(this.timetables.values());
  }

  updateTimetable(classId: string, section: string, schedule: any, updatedBy: string): Timetable {
    const key = `${classId}-${section}`;
    const timetable: Timetable = {
      id: key,
      class: classId,
      section: section,
      schedule: schedule,
      lastUpdated: new Date().toISOString(),
      updatedBy: updatedBy
    };
    this.timetables.set(key, timetable);
    return timetable;
  }

  // Student operations
  getAllStudents(): Student[] {
    return Array.from(this.students.values());
  }

  getStudentsByClass(classId: string, section?: string): Student[] {
    const all = Array.from(this.students.values());
    return all.filter(s => 
      s.class === classId && (!section || s.section === section)
    );
  }

  addStudent(student: Student): Student {
    this.students.set(student.id, student);
    return student;
  }

  // Teacher operations
  getAllTeachers(): Teacher[] {
    return Array.from(this.teachers.values());
  }

  addTeacher(teacher: Teacher): Teacher {
    this.teachers.set(teacher.id, teacher);
    return teacher;
  }

  // User operations
  getUserByEmail(email: string): User | null {
    return this.users.get(email) || null;
  }

  // Announcement operations
  getAllAnnouncements(): Announcement[] {
    return Array.from(this.announcements.values());
  }

  addAnnouncement(announcement: Announcement): Announcement {
    this.announcements.set(announcement.id, announcement);
    return announcement;
  }

  // Class operations
  getAllClasses(): Class[] {
    return Array.from(this.classes.values());
  }

  addClass(classData: Class): Class {
    const key = `${classData.class}-${classData.section}`;
    this.classes.set(key, classData);
    return classData;
  }

  // Bus operations
  getAllBuses(): Bus[] {
    return Array.from(this.buses.values());
  }

  getBus(busId: string): Bus | null {
    return this.buses.get(busId) || null;
  }
 
  addBus(bus: Bus): Bus {
    this.buses.set(bus.id, bus);
    return bus;
  }

  updateBus(busId: string, busData: Partial<Bus>): Bus | null {
    const bus = this.buses.get(busId);
    if (bus) {
      const updated = { ...bus, ...busData };
      this.buses.set(busId, updated);
      return updated;
    }
    return null;
  }

  deleteBus(busId: string): boolean {
    return this.buses.delete(busId);
  }

  // Book operations
  getAllBooks(): Book[] {
    return Array.from(this.books.values());
  }

  getBook(bookId: string): Book | null {
    return this.books.get(bookId) || null;
  }

  addBook(book: Book): Book {
    this.books.set(book.id, book);
    return book;
  }

  updateBook(bookId: string, bookData: Partial<Book>): Book | null {
    const book = this.books.get(bookId);
    if (book) {
      const updated = { ...book, ...bookData };
      this.books.set(bookId, updated);
      return updated;
    }
    return null;
  }

  deleteBook(bookId: string): boolean {
    return this.books.delete(bookId);
  }

  // Attendance operations
  getAttendanceByDateAndClass(date: string, classId: string, section: string): Attendance[] {
    return Array.from(this.attendance.values()).filter(
      a => a.date === date && a.class === classId && a.section === section
    );
  }

  addAttendance(attendance: Attendance): Attendance {
    this.attendance.set(attendance.id, attendance);
    return attendance;
  }

  // Marks operations
  getMarksByStudent(studentId: string): Marks[] {
    return Array.from(this.marks.values()).filter(m => m.studentId === studentId);
  }

  addMarks(marks: Marks): Marks {
    this.marks.set(marks.id, marks);
    return marks;
  }
}

// Singleton instance
let dbInstance: Database | null = null;

export function getDatabase(): Database {
  if (!dbInstance) {
    dbInstance = new Database();
  }
  return dbInstance;
}
