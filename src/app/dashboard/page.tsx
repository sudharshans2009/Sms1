'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

// Dynamic imports for better performance
const TimetableComponent = dynamic(() => import('@/components/TimetableComponent'), { ssr: false });
const StudentsModule = dynamic(() => import('@/components/StudentsModule'), { ssr: false });
const TeachersModule = dynamic(() => import('@/components/TeachersModule'), { ssr: false });
const ClassesModule = dynamic(() => import('@/components/ClassesModule'), { ssr: false });
const AttendanceModule = dynamic(() => import('@/components/AttendanceModule'), { ssr: false });
const MarksModule = dynamic(() => import('@/components/MarksModule'), { ssr: false });
const BusTrackingModule = dynamic(() => import('@/components/BusTrackingModule'), { ssr: false });
const ReportsModule = dynamic(() => import('@/components/ReportsModule'), { ssr: false });
const AnnouncementsModule = dynamic(() => import('@/components/AnnouncementsModule'), { ssr: false });
const LibraryModuleEnhanced = dynamic(() => import('@/components/LibraryModule'), { ssr: false });

// Placeholder component (no longer needed but keeping for reference)
const PlaceholderModule = ({ userRole, classes }: any) => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold">Classes Management</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {classes?.map((cls: any) => (
        <div key={`${cls.class}-${cls.section}`} className="card">
          <h3 className="text-xl font-bold mb-2">Class {cls.class} - Section {cls.section}</h3>
          <p className="text-gray-600 dark:text-gray-400">Class Teacher: {cls.classTeacher}</p>
          <p className="text-gray-600 dark:text-gray-400">Students: {cls.studentsCount}</p>
          <p className="text-gray-600 dark:text-gray-400">Class Head: {cls.classHead}</p>
        </div>
      ))}
    </div>
  </div>
);

const MessagesModule = ({ userRole }: any) => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold">Messages</h2>
      <button className="btn-primary">Compose Message</button>
    </div>
    <div className="card">
      <p className="text-gray-600 dark:text-gray-400">Messaging system - Communication with parents, teachers, and students</p>
    </div>
  </div>
);

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [activePage, setActivePage] = useState('dashboard');
  const [data, setData] = useState<any>({});
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user');
      if (!userData) {
        router.push('/');
      } else {
        setUser(JSON.parse(userData));
        loadDashboardData();
      }

      // Load theme from localStorage
      const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
      if (savedTheme) {
        setTheme(savedTheme);
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(savedTheme);
      }
    }
  }, [router]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', newTheme);
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(newTheme);
    }
  };

  const loadDashboardData = async () => {
    try {
      const [students, teachers, classes, announcements, buses, books] = await Promise.all([
        fetch('/api/students').then(r => r.json()),
        fetch('/api/teachers').then(r => r.json()),
        fetch('/api/classes').then(r => r.json()),
        fetch('/api/announcements').then(r => r.json()),
        fetch('/api/buses').then(r => r.json()),
        fetch('/api/library/books').then(r => r.json()),
      ]);

      setData({
        students: students.data || [],
        teachers: teachers.data || [],
        classes: classes.data || [],
        announcements: announcements.data || [],
        buses: buses.data || [],
        books: books.data || [],
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
    router.push('/');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amrita-orange"></div>
      </div>
    );
  }

  const menuItems = {
    admin: [
      { id: 'dashboard', name: 'Dashboard', icon: '📊' },
      { id: 'students', name: 'Students', icon: '👨‍🎓' },
      { id: 'teachers', name: 'Teachers', icon: '👨‍🏫' },
      { id: 'classes', name: 'Classes', icon: '🏫' },
      { id: 'timetable', name: 'Timetable', icon: '📅' },
      { id: 'attendance', name: 'Attendance', icon: '✓' },
      { id: 'marks', name: 'Marks', icon: '📝' },
      { id: 'reports', name: 'Reports', icon: '📈' },
      { id: 'buses', name: 'Bus Tracking', icon: '🚌' },
      { id: 'library', name: 'Library', icon: '📚' },
      { id: 'announcements', name: 'Announcements', icon: '📢' },
      { id: 'messages', name: 'Messages', icon: '💬' },
    ],
    teacher: [
      { id: 'dashboard', name: 'Dashboard', icon: '📊' },
      { id: 'students', name: 'Students', icon: '👨‍🎓' },
      { id: 'timetable', name: 'Timetable', icon: '📅' },
      { id: 'attendance', name: 'Attendance', icon: '✓' },
      { id: 'marks', name: 'Marks', icon: '📝' },
      { id: 'reports', name: 'Reports', icon: '📈' },
      { id: 'library', name: 'Library', icon: '📚' },
      { id: 'announcements', name: 'Announcements', icon: '📢' },
      { id: 'messages', name: 'Messages', icon: '💬' },
    ],
    student: [
      { id: 'dashboard', name: 'Dashboard', icon: '📊' },
      { id: 'timetable', name: 'Timetable', icon: '📅' },
      { id: 'attendance', name: 'My Attendance', icon: '✓' },
      { id: 'marks', name: 'My Marks', icon: '📝' },
      { id: 'library', name: 'Library', icon: '📚' },
      { id: 'announcements', name: 'Announcements', icon: '📢' },
      { id: 'buses', name: 'Bus Tracking', icon: '🚌' },
    ],
    driver: [
      { id: 'dashboard', name: 'Dashboard', icon: '📊' },
      { id: 'buses', name: 'My Bus', icon: '🚌' },
      { id: 'messages', name: 'Messages', icon: '�' },
    ],
  };

  const currentMenuItems = menuItems[user.role as keyof typeof menuItems] || menuItems.student;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-bold text-amrita-orange">Amrita Vidyalayam</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                aria-label="Toggle theme"
              >
                {theme === 'light' ? (
                  <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                )}
              </button>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="btn-secondary text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white dark:bg-gray-800 min-h-screen shadow-lg">
          <nav className="mt-5 px-2">
            {currentMenuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg mb-2 transition-all ${
                  activePage === item.id
                    ? 'bg-gradient-to-r from-amrita-orange to-amrita-blue text-white shadow-lg'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <span className="mr-3 text-xl">{item.icon}</span>
                {item.name}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            {activePage === 'dashboard' && (
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                  Welcome back, {user.name}!
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="card bg-gradient-to-br from-amrita-orange to-orange-600 text-white transform hover:scale-105 transition-transform">
                    <h3 className="text-lg font-semibold">Total Students</h3>
                    <p className="text-4xl font-bold mt-2">{data.students?.length || 0}</p>
                    <p className="text-sm mt-2 opacity-90">Across all classes</p>
                  </div>
                  <div className="card bg-gradient-to-br from-amrita-blue to-blue-600 text-white transform hover:scale-105 transition-transform">
                    <h3 className="text-lg font-semibold">Total Teachers</h3>
                    <p className="text-4xl font-bold mt-2">{data.teachers?.length || 0}</p>
                    <p className="text-sm mt-2 opacity-90">Active staff</p>
                  </div>
                  <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white transform hover:scale-105 transition-transform">
                    <h3 className="text-lg font-semibold">Classes</h3>
                    <p className="text-4xl font-bold mt-2">{data.classes?.length || 0}</p>
                    <p className="text-sm mt-2 opacity-90">All sections</p>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="card">
                    <h3 className="text-xl font-semibold mb-4">Recent Announcements</h3>
                    <div className="space-y-3">
                      {data.announcements?.slice(0, 3).map((announcement: any) => (
                        <div key={announcement.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
                          <h4 className="font-semibold">{announcement.title}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{announcement.content}</p>
                          <p className="text-xs text-gray-500 mt-1">{announcement.date}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="card">
                    <h3 className="text-xl font-semibold mb-4">Quick Stats</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
                        <span>Active Buses</span>
                        <span className="font-bold text-xl">{data.buses?.length || 0}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
                        <span>Library Books</span>
                        <span className="font-bold text-xl">{data.books?.length || 0}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
                        <span>Total Classes</span>
                        <span className="font-bold text-xl">{data.classes?.length || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activePage === 'students' && (
              <StudentsModule userRole={user.role} />
            )}

            {activePage === 'timetable' && (
              <TimetableComponent userRole={user.role} />
            )}

            {activePage === 'teachers' && (
              <TeachersModule userRole={user.role} />
            )}

            {activePage === 'classes' && (
              <ClassesModule userRole={user.role} />
            )}

            {activePage === 'attendance' && (
              <AttendanceModule userRole={user.role} />
            )}

            {activePage === 'marks' && (
              <MarksModule userRole={user.role} />
            )}

            {activePage === 'reports' && (
              <ReportsModule userRole={user.role} students={data.students} />
            )}

            {activePage === 'buses' && (
              <BusTrackingModule userRole={user.role} buses={data.buses} />
            )}

            {activePage === 'library' && (
              <LibraryModuleEnhanced userRole={user.role} />
            )}

            {activePage === 'announcements' && (
              <AnnouncementsModule userRole={user.role} announcements={data.announcements} />
            )}

            {activePage === 'messages' && (
              <MessagesModule userRole={user.role} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
