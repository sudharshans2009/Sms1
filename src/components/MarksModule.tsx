'use client';

import React, { useState, useEffect } from 'react';

interface Mark {
  id?: string;
  studentId: string;
  subject: string;
  marks: number;
  maxMarks: number;
  examType: string;
  examDate: string;
}

interface Student {
  id: string;
  studentId: string;
  name: string;
  rollNumber: string;
  class: string;
  section: string;
}

interface MarksModuleProps {
  userRole: string;
}

const MarksModule: React.FC<MarksModuleProps> = ({ userRole }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedExamType, setSelectedExamType] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [examDate, setExamDate] = useState(new Date().toISOString().split('T')[0]);
  const [maxMarks, setMaxMarks] = useState(100);
  const [marks, setMarks] = useState<{ [studentId: string]: number }>({});
  const [existingMarks, setExistingMarks] = useState<Mark[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const classes = ['LKG', 'UKG', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
  const sections = ['A', 'B', 'C', 'D'];
  const examTypes = [
    { value: 'periodic', label: 'Periodic Test' },
    { value: 'midterm', label: 'Mid Term' },
    { value: 'term', label: 'Term Exam' },
    { value: 'practical', label: 'Practical' },
  ];
  const subjects = ['English', 'Mathematics', 'Science', 'Social Studies', 'Hindi', 'Computer Science', 'Physical Education'];

  useEffect(() => {
    if (selectedClass && selectedSection) {
      loadStudents();
    }
  }, [selectedClass, selectedSection]);

  useEffect(() => {
    if (selectedClass && selectedSection && selectedExamType && selectedSubject) {
      loadExistingMarks();
    }
  }, [selectedClass, selectedSection, selectedExamType, selectedSubject, examDate]);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/students?class=${selectedClass}&section=${selectedSection}`);
      if (response.ok) {
        const result = await response.json();
        setStudents(result.success ? result.data : result);
      }
    } catch (error) {
      console.error('Error loading students:', error);
      setMessage({ type: 'error', text: 'Failed to load students' });
    } finally {
      setLoading(false);
    }
  };

  const loadExistingMarks = async () => {
    try {
      const response = await fetch(
        `/api/marks?class=${selectedClass}&section=${selectedSection}&examType=${selectedExamType}&subject=${selectedSubject}&examDate=${examDate}`
      );
      if (response.ok) {
        const data = await response.json();
        setExistingMarks(data);
        
        // Pre-fill marks for students who already have them
        const marksMap: { [studentId: string]: number } = {};
        data.forEach((mark: Mark) => {
          marksMap[mark.studentId] = mark.marks;
        });
        setMarks(marksMap);
      }
    } catch (error) {
      console.error('Error loading marks:', error);
    }
  };

  const handleMarksChange = (studentId: string, value: string) => {
    const marksValue = parseInt(value) || 0;
    if (marksValue >= 0 && marksValue <= maxMarks) {
      setMarks(prev => ({ ...prev, [studentId]: marksValue }));
    }
  };

  const handleSaveMarks = async () => {
    if (!selectedClass || !selectedSection || !selectedExamType || !selectedSubject) {
      setMessage({ type: 'error', text: 'Please select class, section, exam type, and subject' });
      return;
    }

    try {
      setLoading(true);
      const marksData = Object.entries(marks).map(([studentId, marksValue]) => ({
        studentId,
        subject: selectedSubject,
        marks: marksValue,
        maxMarks,
        examType: selectedExamType,
        examDate,
        class: selectedClass,
        section: selectedSection,
      }));

      const response = await fetch('/api/marks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ marks: marksData }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Marks saved successfully!' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        loadExistingMarks();
      } else {
        setMessage({ type: 'error', text: 'Failed to save marks' });
      }
    } catch (error) {
      console.error('Error saving marks:', error);
      setMessage({ type: 'error', text: 'Failed to save marks' });
    } finally {
      setLoading(false);
    }
  };

  const calculateGrade = (marks: number, maxMarks: number) => {
    const percentage = (marks / maxMarks) * 100;
    if (percentage >= 90) return { grade: 'A+', color: 'text-green-600' };
    if (percentage >= 80) return { grade: 'A', color: 'text-green-500' };
    if (percentage >= 70) return { grade: 'B+', color: 'text-blue-600' };
    if (percentage >= 60) return { grade: 'B', color: 'text-blue-500' };
    if (percentage >= 50) return { grade: 'C', color: 'text-yellow-600' };
    if (percentage >= 40) return { grade: 'D', color: 'text-orange-600' };
    return { grade: 'F', color: 'text-red-600' };
  };

  const handleClearAll = () => {
    setMarks({});
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Marks Management</h2>
      </div>

      {message.text && (
        <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message.text}
        </div>
      )}

      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Class</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="input-field"
            >
              <option value="">Select Class</option>
              {classes.map(c => (
                <option key={c} value={c}>Class {c}</option>
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
              {sections.map(s => (
                <option key={s} value={s}>Section {s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Exam Type</label>
            <select
              value={selectedExamType}
              onChange={(e) => setSelectedExamType(e.target.value)}
              className="input-field"
            >
              <option value="">Select Exam Type</option>
              {examTypes.map(exam => (
                <option key={exam.value} value={exam.value}>{exam.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Subject</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="input-field"
            >
              <option value="">Select Subject</option>
              {subjects.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Exam Date</label>
            <input
              type="date"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
              className="input-field"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium mb-2">Maximum Marks</label>
          <input
            type="number"
            value={maxMarks}
            onChange={(e) => setMaxMarks(parseInt(e.target.value) || 100)}
            className="input-field w-32"
            min="1"
          />
        </div>
      </div>

      {students.length > 0 && selectedExamType && selectedSubject ? (
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">
              Enter Marks - {selectedSubject} ({selectedExamType})
            </h3>
            <div className="space-x-2">
              <button
                onClick={handleClearAll}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                Clear All
              </button>
              <button
                onClick={handleSaveMarks}
                disabled={loading}
                className="btn-primary"
              >
                {loading ? 'Saving...' : 'Save Marks'}
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Roll No
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Marks (out of {maxMarks})
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Percentage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Grade
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students.map((student) => {
                  const studentMarks = marks[student.id] || 0;
                  const percentage = maxMarks > 0 ? ((studentMarks / maxMarks) * 100).toFixed(2) : '0.00';
                  const gradeInfo = calculateGrade(studentMarks, maxMarks);

                  return (
                    <tr key={student.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {student.rollNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {student.studentId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {student.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          value={marks[student.id] || ''}
                          onChange={(e) => handleMarksChange(student.id, e.target.value)}
                          className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          min="0"
                          max={maxMarks}
                          placeholder="0"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {percentage}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-semibold ${gradeInfo.color}`}>
                          {gradeInfo.grade}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card text-center py-12">
          <p className="text-gray-500">
            {!selectedClass || !selectedSection
              ? 'Please select class and section to load students'
              : !selectedExamType
              ? 'Please select exam type'
              : !selectedSubject
              ? 'Please select subject'
              : 'No students found'}
          </p>
        </div>
      )}
    </div>
  );
};

export default MarksModule;
