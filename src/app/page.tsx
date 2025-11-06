'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function Home() {
  const router = useRouter();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'admin' | 'teacher' | 'student' | 'driver'>('admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('user');
      if (user) {
        router.push('/dashboard');
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

  const openLoginModal = (role: 'admin' | 'teacher' | 'student' | 'driver') => {
    setSelectedRole(role);
    setShowLoginModal(true);
    setError('');
    setEmail('');
    setPassword('');
  };

  const closeLoginModal = () => {
    setShowLoginModal(false);
    setError('');
    setEmail('');
    setPassword('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('Attempting login with:', { email, role: selectedRole });
      
      const response = await axios.post('/api/auth/login', {
        email,
        password,
        role: selectedRole
      });

      console.log('Login response:', response.data);

      if (response.data.success) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(response.data.data.user));
          localStorage.setItem('token', response.data.data.token);
        }
        router.push('/dashboard');
      } else {
        setError(response.data.error || 'Login failed');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.response?.data?.error || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loginCards = [
    {
      role: 'admin' as const,
      title: 'Administrator',
      icon: '👨‍💼',
      description: 'Full system access and management',
      gradient: 'from-purple-500 to-pink-500',
      bgLight: 'bg-purple-50',
      bgDark: 'bg-purple-900/20'
    },
    {
      role: 'teacher' as const,
      title: 'Teacher',
      icon: '👨‍🏫',
      description: 'Manage classes, attendance, and marks',
      gradient: 'from-blue-500 to-cyan-500',
      bgLight: 'bg-blue-50',
      bgDark: 'bg-blue-900/20'
    },
    {
      role: 'student' as const,
      title: 'Student',
      icon: '👨‍🎓',
      description: 'View attendance, marks, and timetable',
      gradient: 'from-green-500 to-emerald-500',
      bgLight: 'bg-green-50',
      bgDark: 'bg-green-900/20'
    },
    {
      role: 'driver' as const,
      title: 'Driver',
      icon: '🚌',
      description: 'Bus route and student tracking',
      gradient: 'from-orange-500 to-red-500',
      bgLight: 'bg-orange-50',
      bgDark: 'bg-orange-900/20'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      {/* Theme Toggle Button */}
      <div className="fixed top-6 right-6 z-50">
        <button
          onClick={toggleTheme}
          className="p-3 rounded-full bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300"
          aria-label="Toggle theme"
        >
          {theme === 'light' ? (
            <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          ) : (
            <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          )}
        </button>
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16 animate-fade-in">
          {/* School Logo/Icon */}
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full mb-6 shadow-2xl">
            <svg className="w-14 h-14 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/>
            </svg>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4">
            <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
              Amrita Vidyalayam
            </span>
          </h1>
          
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-700 dark:text-gray-300 mb-6">
            School Management System
          </h2>

          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-4">
            A comprehensive platform for managing all aspects of school operations including student records, 
            teacher management, attendance tracking, library system, bus tracking, and more.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-full shadow-md">
              <span className="text-2xl">📚</span>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Library Management</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-full shadow-md">
              <span className="text-2xl">📊</span>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Attendance & Marks</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-full shadow-md">
              <span className="text-2xl">🚌</span>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Bus Tracking</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-full shadow-md">
              <span className="text-2xl">📅</span>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Timetable</span>
            </div>
          </div>
        </div>

        {/* Login Cards */}
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-10">
            Select Your Role to Login
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {loginCards.map((card) => (
              <div
                key={card.role}
                onClick={() => openLoginModal(card.role)}
                className={`${card.bgLight} dark:${card.bgDark} rounded-2xl p-6 cursor-pointer transform hover:scale-105 hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-opacity-50`}
                style={{
                  borderImage: `linear-gradient(135deg, var(--tw-gradient-stops)) 1`,
                }}
              >
                <div className={`w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br ${card.gradient} flex items-center justify-center text-4xl shadow-lg`}>
                  {card.icon}
                </div>
                
                <h4 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-2">
                  {card.title}
                </h4>
                
                <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-4">
                  {card.description}
                </p>

                <div className={`mt-4 py-2 px-4 rounded-lg bg-gradient-to-r ${card.gradient} text-white text-center font-semibold shadow-md`}>
                  Login
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Features Section */}
        <div className="max-w-6xl mx-auto mt-20">
          <h3 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-10">
            Key Features
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <div className="text-4xl mb-4">🎯</div>
              <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Complete Management</h4>
              <p className="text-gray-600 dark:text-gray-400">
                Manage students, teachers, classes, attendance, marks, and announcements all in one place.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <div className="text-4xl mb-4">📱</div>
              <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Real-time Tracking</h4>
              <p className="text-gray-600 dark:text-gray-400">
                Live bus tracking with GPS, real-time attendance updates, and instant notifications.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <div className="text-4xl mb-4">🔒</div>
              <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Secure & Reliable</h4>
              <p className="text-gray-600 dark:text-gray-400">
                Role-based access control with encrypted data storage in PostgreSQL database.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-100">
            {/* Modal Header */}
            <div className={`bg-gradient-to-r ${loginCards.find(c => c.role === selectedRole)?.gradient} p-6 rounded-t-2xl`}>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{loginCards.find(c => c.role === selectedRole)?.icon}</span>
                  <div>
                    <h3 className="text-2xl font-bold text-white">
                      {loginCards.find(c => c.role === selectedRole)?.title} Login
                    </h3>
                    <p className="text-white text-opacity-90 text-sm">
                      Enter your credentials to continue
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeLoginModal}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleLogin} className="p-6">
              {error && (
                <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-400 text-red-700 dark:text-red-400 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                    placeholder="your.email@amrita.edu"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full mt-6 py-3 px-4 bg-gradient-to-r ${loginCards.find(c => c.role === selectedRole)?.gradient} text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Logging in...
                  </span>
                ) : (
                  'Login'
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}

