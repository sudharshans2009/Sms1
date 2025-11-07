// Test page to verify the fixed announcement deletion and message sending
'use client';

import AnnouncementsModuleFixed from '@/components/AnnouncementsModuleFixed';
import MessagesModuleFixed from '@/components/MessagesModuleFixed';
import { useState } from 'react';

export default function TestFixesPage() {
  const [activeModule, setActiveModule] = useState<'announcements' | 'messages'>('announcements');

  // Mock current user for testing
  const mockUser = {
    id: 'test-user-123',
    name: 'Test Admin User', 
    role: 'admin'
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold mb-4 text-center">🔧 Testing Fixed Components</h1>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
            Testing announcement deletion and message sending fixes
          </p>

          {/* Module Selector */}
          <div className="flex justify-center space-x-4 mb-6">
            <button
              onClick={() => setActiveModule('announcements')}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                activeModule === 'announcements'
                  ? 'bg-amrita-orange text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              📢 Test Announcements
            </button>
            <button
              onClick={() => setActiveModule('messages')}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                activeModule === 'messages'
                  ? 'bg-amrita-orange text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              📨 Test Messages
            </button>
          </div>

          {/* Testing Instructions */}
          <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
            <h3 className="font-bold text-blue-800 dark:text-blue-200 mb-2">Testing Instructions:</h3>
            
            {activeModule === 'announcements' ? (
              <ul className="list-disc list-inside text-blue-700 dark:text-blue-300 space-y-1">
                <li>✅ Create a new announcement using the "New Announcement" button</li>
                <li>✅ Edit an existing announcement by clicking "Edit"</li>
                <li>🧪 **Test deletion by clicking "Delete" on any announcement**</li>
                <li>📋 Check the browser console for detailed debugging information</li>
              </ul>
            ) : (
              <ul className="list-disc list-inside text-blue-700 dark:text-blue-300 space-y-1">
                <li>✅ Click "Compose" to create a new message</li>
                <li>👥 Select a recipient from the dropdown (students/teachers loaded automatically)</li>
                <li>🧪 **Test sending by filling out subject, content, and clicking "Send Message"**</li>
                <li>💾 Test draft saving by clicking "Save Draft"</li>
                <li>📋 Check the browser console for detailed debugging information</li>
              </ul>
            )}
          </div>

          {/* User Context Display */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 mb-6 text-sm">
            <strong>Test User Context:</strong> {mockUser.name} (ID: {mockUser.id}, Role: {mockUser.role})
          </div>
        </div>

        {/* Component Display */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          {activeModule === 'announcements' ? (
            <AnnouncementsModuleFixed userRole={mockUser.role} />
          ) : (
            <MessagesModuleFixed currentUser={mockUser} />
          )}
        </div>

        {/* Debug Console */}
        <div className="mt-6 bg-gray-900 text-green-400 rounded-xl p-4">
          <h3 className="font-bold mb-2">🔧 Debug Console</h3>
          <p className="text-sm opacity-75">
            Open your browser's Developer Console (F12) to see detailed debugging information while testing.
          </p>
        </div>
      </div>
    </div>
  );
}