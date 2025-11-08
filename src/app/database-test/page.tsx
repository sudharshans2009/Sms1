'use client';

import { useState, useEffect } from 'react';

interface TestResult {
  success: boolean;
  status?: string;
  counts?: {
    users: number;
    students: number;
    academicYears: number;
  };
  sampleData?: {
    students: Array<{ id: string; name: string; class: string; section: string; }>;
    events: Array<{ id: string; title: string; eventType: string; }>;
  };
  error?: string;
  details?: string;
}

export default function DatabaseTestPage() {
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [apiTests, setApiTests] = useState<{ [key: string]: string }>({});

  const testDatabaseConnection = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/test-connection');
      const data = await response.json();
      setTestResult(data);
    } catch (error: any) {
      setTestResult({
        success: false,
        error: 'Failed to fetch test results',
        details: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const testAPIEndpoints = async () => {
    const endpoints = [
      'students',
      'teachers', 
      'classes',
      'buses',
      'announcements',
      'academic-calendar?type=academic-year',
      'academic-calendar?type=event',
      'library/books'
    ];
    
    const results: { [key: string]: string } = {};
    
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`/api/${endpoint}`);
        const data = await response.json();
        
        if (data.success && data.data) {
          results[endpoint] = `✅ SUCCESS (${data.data.length} items)`;
        } else if (data.error) {
          results[endpoint] = `❌ ERROR: ${data.error}`;
        } else {
          results[endpoint] = `⚠️ UNKNOWN RESPONSE`;
        }
      } catch (error: any) {
        results[endpoint] = `❌ FETCH ERROR: ${error.message}`;
      }
    }
    
    setApiTests(results);
  };

  useEffect(() => {
    testDatabaseConnection();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          🏥 Database Connection Diagnostic
        </h1>

        {/* Database Connection Test */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Database Connection Test</h2>
          
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2">Testing connection...</span>
            </div>
          )}
          
          {testResult && (
            <div className={`p-4 rounded-lg ${
              testResult.success 
                ? 'bg-green-100 border border-green-400' 
                : 'bg-red-100 border border-red-400'
            }`}>
              <div className="flex items-center mb-2">
                <span className={`text-xl mr-2 ${
                  testResult.success ? 'text-green-600' : 'text-red-600'
                }`}>
                  {testResult.success ? '✅' : '❌'}
                </span>
                <span className={`font-semibold ${
                  testResult.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  {testResult.status || (testResult.success ? 'Success' : 'Failed')}
                </span>
              </div>
              
              {testResult.counts && (
                <div className="mt-4">
                  <h3 className="font-semibold text-gray-700 mb-2">Database Counts:</h3>
                  <ul className="text-sm text-gray-600">
                    <li>👥 Users: {testResult.counts.users}</li>
                    <li>👨‍🎓 Students: {testResult.counts.students}</li>
                    <li>📅 Academic Years: {testResult.counts.academicYears}</li>
                  </ul>
                </div>
              )}
              
              {testResult.sampleData && (
                <div className="mt-4">
                  <h3 className="font-semibold text-gray-700 mb-2">Sample Data:</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-600">Students:</h4>
                      <ul className="text-sm text-gray-500">
                        {testResult.sampleData.students.map(student => (
                          <li key={student.id}>
                            {student.name} - Class {student.class}{student.section}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-600">Events:</h4>
                      <ul className="text-sm text-gray-500">
                        {testResult.sampleData.events.map(event => (
                          <li key={event.id}>
                            {event.title} ({event.eventType})
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
              
              {testResult.error && (
                <div className="mt-4">
                  <p className="text-red-700 font-semibold">{testResult.error}</p>
                  {testResult.details && (
                    <pre className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded overflow-auto">
                      {testResult.details}
                    </pre>
                  )}
                </div>
              )}
            </div>
          )}
          
          <button
            onClick={testDatabaseConnection}
            disabled={loading}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Again'}
          </button>
        </div>

        {/* API Endpoints Test */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">API Endpoints Test</h2>
          
          <button
            onClick={testAPIEndpoints}
            className="mb-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Test All API Endpoints
          </button>
          
          {Object.keys(apiTests).length > 0 && (
            <div className="grid grid-cols-1 gap-2">
              {Object.entries(apiTests).map(([endpoint, result]) => (
                <div key={endpoint} className="flex items-center justify-between p-2 border-b">
                  <span className="font-mono text-sm">/api/{endpoint}</span>
                  <span className="text-sm">{result}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Navigation */}
        <div className="mt-8 text-center">
          <a
            href="/dashboard"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 inline-block"
          >
            Return to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}