'use client';

import { useState } from 'react';

export default function TestPage() {
  const [loginResult, setLoginResult] = useState('');
  const [messageResult, setMessageResult] = useState('');
  const [testCredentials, setTestCredentials] = useState({
    email: 'admin@amrita.edu',
    password: 'admin123',
    role: 'admin'
  });

  const testLogin = async () => {
    try {
      setLoginResult('Testing...');
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testCredentials),
      });

      const data = await response.json();
      setLoginResult(JSON.stringify(data, null, 2));
    } catch (error: any) {
      setLoginResult('Error: ' + (error?.message || 'Unknown error'));
    }
  };

  const testMessages = async () => {
    try {
      setMessageResult('Testing...');
      
      // Test creating a message
      const createResponse = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: 'Test Message',
          content: 'This is a test message to verify the messaging system is working.',
          senderId: 'admin-id',
          senderName: 'Admin',
          senderRole: 'ADMIN',
          receiverId: 'teacher-id',
          receiverName: 'Teacher',
          receiverRole: 'TEACHER',
          priority: 'NORMAL',
          category: 'GENERAL',
          isDraft: false,
        }),
      });

      const createData = await createResponse.json();
      
      // Test getting messages
      const getResponse = await fetch('/api/messages?userId=admin-id&type=sent');
      const getData = await getResponse.json();

      setMessageResult(JSON.stringify({
        createResult: createData,
        getResult: getData,
      }, null, 2));
    } catch (error: any) {
      setMessageResult('Error: ' + (error?.message || 'Unknown error'));
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-center">SMS System Test Page</h1>
        
        {/* Login Test */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">Login Test</h2>
          
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email:</label>
              <input
                type="email"
                value={testCredentials.email}
                onChange={(e) => setTestCredentials({...testCredentials, email: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password:</label>
              <input
                type="password"
                value={testCredentials.password}
                onChange={(e) => setTestCredentials({...testCredentials, password: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Role:</label>
              <select
                value={testCredentials.role}
                onChange={(e) => setTestCredentials({...testCredentials, role: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="admin">Admin</option>
                <option value="teacher">Teacher</option>
                <option value="student">Student</option>
                <option value="driver">Driver</option>
              </select>
            </div>
          </div>
          
          <button
            onClick={testLogin}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Test Login
          </button>
          
          <div className="mt-4">
            <h3 className="font-semibold">Result:</h3>
            <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-64">
              {loginResult}
            </pre>
          </div>
        </div>

        {/* Message Test */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">Message System Test</h2>
          
          <button
            onClick={testMessages}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Test Message System
          </button>
          
          <div className="mt-4">
            <h3 className="font-semibold">Result:</h3>
            <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-64">
              {messageResult}
            </pre>
          </div>
        </div>

        {/* Navigation */}
        <div className="text-center space-x-4">
          <a 
            href="/login" 
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 inline-block"
          >
            Go to Login Page
          </a>
          <a 
            href="/dashboard" 
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 inline-block"
          >
            Go to Dashboard
          </a>
        </div>

        {/* Test Credentials */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">Test Credentials:</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Admin:</strong><br />
              Email: admin@amrita.edu<br />
              Password: admin123
            </div>
            <div>
              <strong>Teacher:</strong><br />
              Email: teacher@amrita.edu<br />
              Password: teacher123
            </div>
            <div>
              <strong>Student:</strong><br />
              Email: student@amrita.edu<br />
              Password: student123
            </div>
            <div>
              <strong>Driver:</strong><br />
              Email: driver@amrita.edu<br />
              Password: driver123
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}