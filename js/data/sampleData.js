// Sample Data for School Management System

const sampleStudents = [
    { id: 'AV001', name: 'Alice Smith', class: '5', section: 'A', parentPhone: '+1234567890', parentEmail: 'parent1@example.com', bus: 'AV01' },
    { id: 'AV002', name: 'Bob Johnson', class: '5', section: 'A', parentPhone: '+1234567891', parentEmail: 'parent2@example.com', bus: 'AV02' },
    { id: 'AV003', name: 'Carol Williams', class: '11', section: 'A', parentPhone: '+1234567892', parentEmail: 'parent3@example.com', studentPhone: '+1234567893', studentEmail: 'student3@example.com', bus: 'P1' },
    { id: 'AV004', name: 'David Brown', class: '11', section: 'A', parentPhone: '+1234567894', parentEmail: 'parent4@example.com', studentPhone: '+1234567895', studentEmail: 'student4@example.com', bus: 'P2' }
];

const sampleTeachers = [
    { id: 'T001', name: 'Jane Davis', subject: 'Mathematics', classTeacher: '5-A', phone: '+1234567896', email: 'jane@amrita.edu', isClassHead: false },
    { id: 'T002', name: 'Robert Miller', subject: 'Science', classTeacher: '5-B', phone: '+1234567897', email: 'robert@amrita.edu', isClassHead: false },
    { id: 'T003', name: 'Emily Wilson', subject: 'English', classTeacher: '11-A', phone: '+1234567898', email: 'emily@amrita.edu', isClassHead: true }
];

const sampleClasses = [
    { class: '5', section: 'A', classTeacher: 'Jane Davis', studentsCount: 30, classHead: 'John Doe' },
    { class: '5', section: 'B', classTeacher: 'Robert Miller', studentsCount: 28, classHead: 'Jane Smith' },
    { class: '11', section: 'A', classTeacher: 'Emily Wilson', studentsCount: 25, classHead: 'Michael Brown' }
];

const sampleAnnouncements = [
    { id: 1, title: 'School Annual Day', content: 'Annual day celebration will be held on 25th November 2024. All students are requested to participate.', date: '2024-11-01', priority: 'important', target: 'all' },
    { id: 2, title: 'PTA Meeting', content: 'Parent-Teacher meeting scheduled for 15th November 2024 at 10:00 AM.', date: '2024-10-28', priority: 'normal', target: 'parents' },
    { id: 3, title: 'Exam Schedule', content: 'Mid-term examinations will commence from 5th December 2024.', date: '2024-10-25', priority: 'important', target: 'students' }
];

const sampleBuses = [
    { id: 'AV01', driverName: 'Ramesh Kumar', route: 'Ettimadai - Coimbatore', currentLocation: { lat: 10.9027, lng: 76.9015 }, status: 'Active', students: 25, speed: 40 },
    { id: 'AV02', driverName: 'Suresh Babu', route: 'Ettimadai - Palakkad', currentLocation: { lat: 10.7827, lng: 76.6515 }, status: 'Active', students: 20, speed: 35 },
    { id: 'P1', driverName: 'Manoj Kumar', route: 'Ettimadai - Coimbatore', currentLocation: { lat: 10.8527, lng: 76.8015 }, status: 'Active', students: 15, speed: 45 },
    { id: 'P2', driverName: 'Vijay Kumar', route: 'Ettimadai - Palakkad', currentLocation: { lat: 10.7327, lng: 76.6015 }, status: 'Active', students: 18, speed: 38 }
];

const sampleBooks = [
    { id: 'B001', title: 'Mathematics for Class 5', author: 'R.D. Sharma', isbn: '978-93-5141-234-5', category: 'textbook', publisher: 'Dhanpat Rai', year: 2020, quantity: 50, available: 35, location: 'Shelf A-1' },
    { id: 'B002', title: 'Science for Class 5', author: 'Lakhmir Singh', isbn: '978-93-87445-123-4', category: 'textbook', publisher: 'S. Chand', year: 2021, quantity: 40, available: 28, location: 'Shelf A-2' },
    { id: 'B003', title: 'Harry Potter and the Philosopher\'s Stone', author: 'J.K. Rowling', isbn: '978-0-7475-3269-9', category: 'fiction', publisher: 'Bloomsbury', year: 1997, quantity: 20, available: 15, location: 'Shelf B-1' },
    { id: 'B004', title: 'The Diary of a Young Girl', author: 'Anne Frank', isbn: '978-0-14-028655-2', category: 'non-fiction', publisher: 'Penguin', year: 1947, quantity: 15, available: 10, location: 'Shelf B-2' }
];
