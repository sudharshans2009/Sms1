'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

interface AttendanceModuleProps {
  userRole: string;
}

export default function AttendanceModule({ userRole }: AttendanceModuleProps) {
  const [students, setStudents] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [attendanceData, setAttendanceData] = useState<{ [key: string]: string }>({});
  const [saving, setSaving] = useState(false);

  const classes = ['LKG', 'UKG', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
  const sections = ['A', 'B', 'C', 'D'];

  useEffect(() => {
    if (selectedClass && selectedSection) {
      loadStudents();
      loadAttendance();
    }
  }, [selectedClass, selectedSection, selectedDate]);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/students?class=${selectedClass}&section=${selectedSection}`);
      if (response.data.success) {
        setStudents(response.data.data);
      }
    } catch (error) {
      console.error('Error loading students:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAttendance = async () => {
    try {
      const response = await axios.get(`/api/attendance?date=${selectedDate}&class=${selectedClass}&section=${selectedSection}`);
      if (response.data.success) {
        setAttendance(response.data.data);
        
        // Pre-fill attendance data
        const data: { [key: string]: string } = {};
        response.data.data.forEach((record: any) => {
          data[record.student.studentId] = record.status;
        });
        setAttendanceData(data);
      }
    } catch (error) {
      console.error('Error loading attendance:', error);
    }
  };

  const handleStatusChange = (studentId: string, status: string) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleMarkAll = (status: string) => {
    const data: { [key: string]: string } = {};
    students.forEach(student => {
      data[student.studentId] = status;
    });
    setAttendanceData(data);
  };

  const handleSaveAttendance = async () => {
    if (!selectedClass || !selectedSection) {
      alert('Please select class and section');
      return;
    }

    setSaving(true);
    try {
      const records = students.map(student => ({
        studentId: student.studentId,
        date: selectedDate,
        status: attendanceData[student.studentId] || 'ABSENT',
        class: selectedClass,
        section: selectedSection
      }));

      const response = await axios.post('/api/attendance', records);
      if (response.data.success) {
        alert('Attendance saved successfully!');
        loadAttendance();
      }
    } catch (error) {
      console.error('Error saving attendance:', error);
      alert('Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PRESENT': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'ABSENT': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'LATE': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'LEAVE': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Attendance Management
        </h2>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Class</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="input-field"
            >
              <option value="">Select Class</option>
              {classes.map((cls) => (
                <option key={cls} value={cls}>{cls}</option>
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
              <option value="">Select Section</option>
              {sections.map((sec) => (
                <option key={sec} value={sec}>{sec}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setSelectedClass('');
                setSelectedSection('');
              }}
              className="btn-secondary w-full"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        {selectedClass && selectedSection && students.length > 0 && (
          <div className="mt-4 flex gap-2">
            <button onClick={() => handleMarkAll('PRESENT')} className="btn-primary text-sm">
              Mark All Present
            </button>
            <button onClick={() => handleMarkAll('ABSENT')} className="btn-secondary text-sm">
              Mark All Absent
            </button>
            <button onClick={handleSaveAttendance} disabled={saving} className="btn-primary text-sm ml-auto">
              {saving ? 'Saving...' : 'Save Attendance'}
            </button>
          </div>
        )}
      </div>

      {/* Students Table */}
      {selectedClass && selectedSection && (
        <div className="card overflow-hidden p-0">
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amrita-blue"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Loading students...</p>
            </div>
          ) : students.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              No students found for Class {selectedClass} - Section {selectedSection}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Roll No
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Student ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Present
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Absent
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Late
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Leave
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {students.map((student, index) => {
                    const status = attendanceData[student.studentId] || '';
                    return (
                      <tr key={student.studentId} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {student.rollNumber || index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {student.studentId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                          {student.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <input
                            type="radio"
                            name={`attendance-${student.studentId}`}
                            checked={status === 'PRESENT'}
                            onChange={() => handleStatusChange(student.studentId, 'PRESENT')}
                            className="w-4 h-4 text-green-600"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <input
                            type="radio"
                            name={`attendance-${student.studentId}`}
                            checked={status === 'ABSENT'}
                            onChange={() => handleStatusChange(student.studentId, 'ABSENT')}
                            className="w-4 h-4 text-red-600"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <input
                            type="radio"
                            name={`attendance-${student.studentId}`}
                            checked={status === 'LATE'}
                            onChange={() => handleStatusChange(student.studentId, 'LATE')}
                            className="w-4 h-4 text-yellow-600"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <input
                            type="radio"
                            name={`attendance-${student.studentId}`}
                            checked={status === 'LEAVE'}
                            onChange={() => handleStatusChange(student.studentId, 'LEAVE')}
                            className="w-4 h-4 text-blue-600"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          {status && (
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(status)}`}>
                              {status}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {!selectedClass && !selectedSection && (
        <div className="card text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">
            Please select a class and section to mark attendance
          </p>
        </div>
      )}
    </div>
  );
}
