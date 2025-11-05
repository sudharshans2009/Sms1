'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

interface ReportsModuleProps {
  userRole: string;
  students?: any[];
}

export default function ReportsModule({ userRole, students: initialStudents }: ReportsModuleProps) {
  const [students, setStudents] = useState<any[]>(initialStudents || []);
  const [reportType, setReportType] = useState('attendance');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const classes = ['LKG', 'UKG', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
  const sections = ['A', 'B', 'C', 'D'];

  useEffect(() => {
    if (!initialStudents) {
      loadStudents();
    }
  }, []);

  const loadStudents = async () => {
    try {
      const response = await axios.get('/api/students');
      if (response.data.success) {
        setStudents(response.data.data);
      }
    } catch (error) {
      console.error('Error loading students:', error);
    }
  };

  const generateReport = () => {
    setLoading(true);
    
    // Simulate report generation
    setTimeout(() => {
      let filtered = students;
      
      if (selectedClass) {
        filtered = filtered.filter(s => s.class === selectedClass);
      }
      if (selectedSection) {
        filtered = filtered.filter(s => s.section === selectedSection);
      }

      // Generate mock report data based on type
      const data = {
        students: filtered,
        summary: {
          total: filtered.length,
          present: Math.floor(filtered.length * 0.92),
          absent: Math.floor(filtered.length * 0.08),
          averageAttendance: '92%',
          averageMarks: '78.5%',
        }
      };

      setReportData(data);
      setLoading(false);
    }, 1000);
  };

  const exportReport = (format: string) => {
    alert(`Exporting report as ${format.toUpperCase()}...`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Reports & Analytics
        </h2>
      </div>

      {/* Report Configuration */}
      <div className="card">
        <h3 className="text-lg font-bold mb-4 text-amrita-orange">Generate Report</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Report Type</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="input-field"
            >
              <option value="attendance">Attendance Report</option>
              <option value="performance">Performance Report</option>
              <option value="class">Class-wise Summary</option>
              <option value="student">Student Progress</option>
              <option value="teacher">Teacher Report</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Class</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="input-field"
            >
              <option value="">All Classes</option>
              {classes.map(cls => (
                <option key={cls} value={cls}>{cls === 'LKG' || cls === 'UKG' ? cls : `Class ${cls}`}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Section</label>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="input-field"
            >
              <option value="">All Sections</option>
              {sections.map(sec => (
                <option key={sec} value={sec}>Section {sec}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">&nbsp;</label>
            <button
              onClick={generateReport}
              disabled={loading}
              className="w-full btn-primary bg-amrita-orange hover:bg-orange-600"
            >
              {loading ? 'Generating...' : '📊 Generate Report'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium mb-2">Date From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Date To</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="input-field"
            />
          </div>
        </div>
      </div>

      {/* Report Results */}
      {reportData && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <h3 className="text-sm font-semibold opacity-90">Total Students</h3>
              <p className="text-3xl font-bold mt-2">{reportData.summary.total}</p>
            </div>
            <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
              <h3 className="text-sm font-semibold opacity-90">Present</h3>
              <p className="text-3xl font-bold mt-2">{reportData.summary.present}</p>
            </div>
            <div className="card bg-gradient-to-br from-red-500 to-red-600 text-white">
              <h3 className="text-sm font-semibold opacity-90">Absent</h3>
              <p className="text-3xl font-bold mt-2">{reportData.summary.absent}</p>
            </div>
            <div className="card bg-gradient-to-br from-amrita-orange to-amrita-blue text-white">
              <h3 className="text-sm font-semibold opacity-90">Avg Attendance</h3>
              <p className="text-3xl font-bold mt-2">{reportData.summary.averageAttendance}</p>
            </div>
          </div>

          {/* Detailed Report Table */}
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Detailed Report - {reportType.charAt(0).toUpperCase() + reportType.slice(1)}</h3>
              <div className="flex gap-2">
                <button onClick={() => exportReport('pdf')} className="btn-secondary text-sm">
                  📄 Export PDF
                </button>
                <button onClick={() => exportReport('excel')} className="btn-secondary text-sm">
                  📊 Export Excel
                </button>
                <button onClick={() => exportReport('csv')} className="btn-secondary text-sm">
                  📋 Export CSV
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase">Student ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase">Class</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase">Section</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase">Attendance</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase">Performance</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {reportData.students.map((student: any, index: number) => {
                    const attendance = 88 + Math.random() * 12;
                    const performance = 70 + Math.random() * 30;
                    return (
                      <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-4 py-3 font-medium">{student.id}</td>
                        <td className="px-4 py-3">{student.name}</td>
                        <td className="px-4 py-3">{student.class}</td>
                        <td className="px-4 py-3">{student.section}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${
                            attendance >= 90 ? 'bg-green-100 text-green-700' :
                            attendance >= 75 ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {attendance.toFixed(1)}%
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${
                            performance >= 85 ? 'bg-green-100 text-green-700' :
                            performance >= 70 ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {performance.toFixed(1)}%
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${
                            attendance >= 90 && performance >= 85 ? 'bg-green-100 text-green-700' :
                            attendance >= 75 && performance >= 70 ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {attendance >= 90 && performance >= 85 ? 'Excellent' :
                             attendance >= 75 && performance >= 70 ? 'Good' :
                             'Needs Attention'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Charts Placeholder */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="text-lg font-bold mb-4">Attendance Trends</h3>
              <div className="h-64 bg-gradient-to-t from-amrita-blue/20 to-transparent rounded flex items-end justify-around p-4">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day, i) => (
                  <div key={day} className="flex flex-col items-center gap-2">
                    <div 
                      className="w-12 bg-amrita-blue rounded-t"
                      style={{ height: `${80 + Math.random() * 60}px` }}
                    ></div>
                    <span className="text-xs font-medium">{day}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <h3 className="text-lg font-bold mb-4">Performance Distribution</h3>
              <div className="h-64 flex items-center justify-center">
                <div className="w-48 h-48 rounded-full border-8 border-amrita-orange flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-4xl font-bold text-amrita-orange">78.5%</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Average Score</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* No Report Generated */}
      {!reportData && !loading && (
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-xl font-bold mb-2">No Report Generated</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Select report parameters above and click "Generate Report" to view analytics
          </p>
        </div>
      )}
    </div>
  );
}
