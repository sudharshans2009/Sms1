'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

interface ReportsModuleProps {
  userRole: string;
  students?: any[];
}

export default function ReportsModule({ userRole, students: initialStudents }: ReportsModuleProps) {
  const [students, setStudents] = useState<any[]>(initialStudents || []);
  const [reportType, setReportType] = useState('analysis');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [studentProfile, setStudentProfile] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [marks, setMarks] = useState<any[]>([]);

  const classes = ['LKG', 'UKG', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
  const sections = ['A', 'B', 'C', 'D'];

  useEffect(() => {
    if (!initialStudents) {
      loadStudents();
    }
    loadAttendanceAndMarks();
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

  const loadAttendanceAndMarks = async () => {
    try {
      const [attendanceRes, marksRes] = await Promise.all([
        axios.get('/api/attendance'),
        axios.get('/api/marks')
      ]);
      
      if (attendanceRes.data.success) {
        setAttendance(attendanceRes.data.data);
      }
      if (marksRes.data.success) {
        setMarks(marksRes.data.data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const loadStudentProfile = async (studentId: string) => {
    if (!studentId) return;
    
    setLoadingProfile(true);
    try {
      const response = await axios.get(`/api/student-profile?studentId=${studentId}&include=all`);
      if (response.data.success) {
        setStudentProfile(response.data.data);
      }
    } catch (error) {
      console.error('Error loading student profile:', error);
      alert('Failed to load student profile');
    } finally {
      setLoadingProfile(false);
    }
  };

  const calculateStudentMetrics = (student: any) => {
    const studentAttendance = attendance.filter((a: any) => a.studentId === student.id);
    const totalDays = studentAttendance.length;
    const presentDays = studentAttendance.filter((a: any) => 
      a.status === 'PRESENT' || a.status === 'LATE'
    ).length;
    const attendancePercentage = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;

    const studentMarks = marks.filter((m: any) => m.studentId === student.id);
    let totalMarks = 0;
    let obtainedMarks = 0;
    let subjectCount = 0;

    studentMarks.forEach((mark: any) => {
      totalMarks += mark.totalMarks || 100;
      obtainedMarks += mark.marksObtained || 0;
      subjectCount++;
    });

    const percentage = totalMarks > 0 ? (obtainedMarks / totalMarks) * 100 : 0;
    
    let grade = 'F';
    if (percentage >= 90) grade = 'A+';
    else if (percentage >= 80) grade = 'A';
    else if (percentage >= 70) grade = 'B+';
    else if (percentage >= 60) grade = 'B';
    else if (percentage >= 50) grade = 'C';
    else if (percentage >= 40) grade = 'D';

    let status = 'Needs Attention';
    if (attendancePercentage >= 90 && percentage >= 85) status = 'Excellent';
    else if (attendancePercentage >= 80 && percentage >= 70) status = 'Very Good';
    else if (attendancePercentage >= 75 && percentage >= 60) status = 'Good';
    else if (attendancePercentage >= 70 && percentage >= 50) status = 'Average';

    return {
      attendancePercentage: parseFloat(attendancePercentage.toFixed(2)),
      totalDays,
      presentDays,
      percentage: parseFloat(percentage.toFixed(2)),
      grade,
      status,
      totalMarks,
      obtainedMarks,
      subjectCount
    };
  };

  const generateReport = () => {
    setLoading(true);
    setStudentProfile(null);
    
    let filtered = students;
    
    if (selectedClass) {
      filtered = filtered.filter((s: any) => s.class === selectedClass);
    }
    if (selectedSection) {
      filtered = filtered.filter((s: any) => s.section === selectedSection);
    }

    const studentsWithMetrics = filtered.map((student: any) => ({
      ...student,
      metrics: calculateStudentMetrics(student)
    }));

    const totalStudents = studentsWithMetrics.length;
    const avgAttendance = studentsWithMetrics.reduce((sum: number, s: any) => sum + s.metrics.attendancePercentage, 0) / totalStudents || 0;
    const avgPercentage = studentsWithMetrics.reduce((sum: number, s: any) => sum + s.metrics.percentage, 0) / totalStudents || 0;
    
    const excellent = studentsWithMetrics.filter((s: any) => s.metrics.status === 'Excellent').length;
    const veryGood = studentsWithMetrics.filter((s: any) => s.metrics.status === 'Very Good').length;
    const good = studentsWithMetrics.filter((s: any) => s.metrics.status === 'Good').length;
    const average = studentsWithMetrics.filter((s: any) => s.metrics.status === 'Average').length;
    const needsAttention = studentsWithMetrics.filter((s: any) => s.metrics.status === 'Needs Attention').length;

    const data = {
      students: studentsWithMetrics,
      summary: {
        total: totalStudents,
        avgAttendance: parseFloat(avgAttendance.toFixed(2)),
        avgPercentage: parseFloat(avgPercentage.toFixed(2)),
        excellent,
        veryGood,
        good,
        average,
        needsAttention
      }
    };

    setReportData(data);
    setLoading(false);
  };

  const filteredStudentsForDropdown = students
    .filter((s: any) => {
      if (selectedClass && s.class !== selectedClass) return false;
      if (selectedSection && s.section !== selectedSection) return false;
      return true;
    })
    .sort((a: any, b: any) => a.name.localeCompare(b.name));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          📊 Reports & Analysis
        </h2>
      </div>

      <div className="card">
        <h3 className="text-lg font-bold mb-4 text-amrita-orange">📋 Generate Report</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Report Type</label>
            <select value={reportType} onChange={(e) => setReportType(e.target.value)} className="input-field">
              <option value="analysis">Student Analysis</option>
              <option value="attendance">Attendance Report</option>
              <option value="performance">Performance Report</option>
              <option value="class">Class Summary</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Class</label>
            <select
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                setSelectedStudentId('');
              }}
              className="input-field"
            >
              <option value="">All Classes</option>
              {classes.map((cls: string) => (
                <option key={cls} value={cls}>{cls === 'LKG' || cls === 'UKG' ? cls : `Class ${cls}`}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Section</label>
            <select
              value={selectedSection}
              onChange={(e) => {
                setSelectedSection(e.target.value);
                setSelectedStudentId('');
              }}
              className="input-field"
            >
              <option value="">All Sections</option>
              {sections.map((sec: string) => (
                <option key={sec} value={sec}>Section {sec}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">&nbsp;</label>
            <button onClick={generateReport} disabled={loading} className="w-full btn-primary bg-amrita-orange hover:bg-orange-600">
              {loading ? 'Generating...' : '📊 Generate Report'}
            </button>
          </div>
        </div>

        {reportType === 'analysis' && (
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h4 className="font-bold mb-3 text-blue-900 dark:text-blue-300">🔍 Individual Student Analysis (100% Accurate)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Select Student</label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => {
                    setSelectedStudentId(e.target.value);
                    if (e.target.value) {
                      loadStudentProfile(e.target.value);
                    } else {
                      setStudentProfile(null);
                    }
                  }}
                  className="input-field"
                  disabled={loadingProfile}
                >
                  <option value="">Select a student...</option>
                  {filteredStudentsForDropdown.map((student: any) => (
                    <option key={student.id} value={student.id}>
                      {student.studentId} - {student.name} ({student.class}-{student.section})
                    </option>
                  ))}
                </select>
              </div>
              {loadingProfile && (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amrita-blue"></div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {studentProfile && reportType === 'analysis' && (
        <div className="space-y-4">
          <div className="card bg-gradient-to-r from-amrita-blue to-amrita-orange text-white">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-4xl">
                {studentProfile.gender === 'Male' ? '👨‍🎓' : studentProfile.gender === 'Female' ? '👩‍🎓' : '🎓'}
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold">{studentProfile.name}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2 text-sm">
                  <p><strong>ID:</strong> {studentProfile.studentId}</p>
                  <p><strong>Class:</strong> {studentProfile.class}-{studentProfile.section}</p>
                  <p><strong>Roll No:</strong> {studentProfile.rollNumber || 'N/A'}</p>
                  <p><strong>DOB:</strong> {studentProfile.dateOfBirth ? new Date(studentProfile.dateOfBirth).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          {studentProfile.medical && (
            <div className="card border-2 border-red-200 dark:border-red-800">
              <h3 className="text-xl font-bold mb-4 text-red-600 dark:text-red-400">🏥 Health & Medical Records</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Blood Group</p>
                  <p className="text-2xl font-bold text-red-600">{studentProfile.bloodGroup || studentProfile.medical.bloodGroup || 'Not Recorded'}</p>
                </div>
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Height / Weight</p>
                  <p className="font-bold">{studentProfile.medical.height || 'N/A'} cm / {studentProfile.medical.weight || 'N/A'} kg</p>
                </div>
                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Special Needs</p>
                  <p className="font-bold">{studentProfile.medical.specialNeeds || 'None'}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {reportData && !selectedStudentId && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white text-center">
              <h3 className="text-sm font-semibold opacity-90">Total Students</h3>
              <p className="text-3xl font-bold mt-2">{reportData.summary.total}</p>
            </div>
            <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white text-center">
              <h3 className="text-sm font-semibold opacity-90">Excellent</h3>
              <p className="text-3xl font-bold mt-2">{reportData.summary.excellent}</p>
            </div>
            <div className="card bg-gradient-to-br from-teal-500 to-teal-600 text-white text-center">
              <h3 className="text-sm font-semibold opacity-90">Very Good</h3>
              <p className="text-3xl font-bold mt-2">{reportData.summary.veryGood}</p>
            </div>
            <div className="card bg-gradient-to-br from-yellow-500 to-yellow-600 text-white text-center">
              <h3 className="text-sm font-semibold opacity-90">Needs Focus</h3>
              <p className="text-3xl font-bold mt-2">{reportData.summary.needsAttention}</p>
            </div>
            <div className="card bg-gradient-to-br from-amrita-orange to-amrita-blue text-white text-center">
              <h3 className="text-sm font-semibold opacity-90">Avg Performance</h3>
              <p className="text-3xl font-bold mt-2">{reportData.summary.avgPercentage.toFixed(1)}%</p>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-bold mb-4">Detailed Class Analysis</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase">Student ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase">Class</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase">Attendance</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase">Performance</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase">Grade</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {reportData.students.map((student: any) => (
                    <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-4 py-3 font-medium">{student.studentId}</td>
                      <td className="px-4 py-3">{student.name}</td>
                      <td className="px-4 py-3">{student.class}-{student.section}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          student.metrics.attendancePercentage >= 90 ? 'bg-green-100 text-green-700' :
                          student.metrics.attendancePercentage >= 75 ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {student.metrics.attendancePercentage}%
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          student.metrics.percentage >= 85 ? 'bg-green-100 text-green-700' :
                          student.metrics.percentage >= 70 ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {student.metrics.percentage}%
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-bold">
                          {student.metrics.grade}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          student.metrics.status === 'Excellent' ? 'bg-green-100 text-green-700' :
                          student.metrics.status === 'Very Good' ? 'bg-teal-100 text-teal-700' :
                          student.metrics.status === 'Good' ? 'bg-blue-100 text-blue-700' :
                          student.metrics.status === 'Average' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {student.metrics.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => {
                            setSelectedStudentId(student.id);
                            loadStudentProfile(student.id);
                          }}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {!reportData && !studentProfile && !loading && (
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
