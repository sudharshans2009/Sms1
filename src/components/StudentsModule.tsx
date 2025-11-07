'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

interface StudentsModuleProps {
  userRole: string;
}

export default function StudentsModule({ userRole }: StudentsModuleProps) {
  const [students, setStudents] = useState<any[]>([]);
  const [buses, setBuses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    studentId: '',
    name: '',
    class: '',
    section: '',
    rollNumber: '',
    dateOfBirth: '',
    gender: '',
    parentName: '',
    parentPhone: '',
    parentEmail: '',
    address: '',
    bloodGroup: '',
    busId: ''
  });
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState<any>(null);
  const [editFormError, setEditFormError] = useState('');
  const [editFormLoading, setEditFormLoading] = useState(false);

  const classes = ['LKG', 'UKG', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
  const sections = ['A', 'B', 'C', 'D'];

  useEffect(() => {
    loadStudents();
    loadBuses();
  }, []);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/students');
      if (response.data.success) {
        setStudents(response.data.data);
      }
    } catch (error) {
      console.error('Error loading students:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBuses = async () => {
    try {
      const response = await axios.get('/api/buses');
      if (response.data.success) {
        setBuses(response.data.data);
      }
    } catch (error) {
      console.error('Error loading buses:', error);
    }
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);

    try {
      const response = await axios.post('/api/students', formData);
      if (response.data.success) {
        if (response.data.success) {
        setShowAddModal(false);
        setFormData({
          studentId: '',
          name: '',
          class: '',
          section: '',
          rollNumber: '',
          dateOfBirth: '',
          gender: '',
          parentName: '',
          parentPhone: '',
          parentEmail: '',
          address: '',
          bloodGroup: '',
          busId: ''
        });
        loadStudents(); // Reload the students list
        alert('Student added successfully!');
      }
      }
    } catch (error: any) {
      setFormError(error.response?.data?.error || 'Failed to add student');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteStudent = async (studentId: string, studentName: string) => {
    if (!confirm(`Are you sure you want to delete ${studentName}? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await axios.delete(`/api/students/${studentId}`);
      if (response.data.success) {
        setStudents(students.filter(s => s.id !== studentId));
        alert('✅ Student deleted successfully!');
      }
    } catch (error: any) {
      console.error('Error deleting student:', error);
      alert(`❌ ${error.response?.data?.error || 'Failed to delete student'}`);
    }
  };

  const handleViewStudent = (student: any) => {
    setSelectedStudent(student);
  };

  const handleOpenEdit = (student: any) => {
    setEditFormError('');
    setEditFormData({
      studentId: student.studentId,
      name: student.name,
      class: student.class,
      section: student.section,
      rollNumber: student.rollNumber || '',
      dateOfBirth: student.dateOfBirth ? new Date(student.dateOfBirth).toISOString().slice(0,10) : '',
      gender: student.gender || '',
      parentName: student.parentName || '',
      parentPhone: student.parentPhone || '',
      parentEmail: student.parentEmail || '',
      address: student.address || '',
      bloodGroup: student.bloodGroup || '',
      studentPhone: student.studentPhone || '',
      studentEmail: student.studentEmail || '',
      busId: student.busId || student.bus || null,
      id: student.id,
    });
    setShowEditModal(true);
  };

  const handleEditStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditFormError('');
    setEditFormLoading(true);

    try {
      const id = editFormData.id;
      const payload = { ...editFormData };
      delete payload.id;

      const response = await axios.put(`/api/students/${id}`, payload);
      if (response.data.success) {
        // update students list in-place
        setStudents((prev) => prev.map(s => s.id === id ? response.data.data : s));
        setShowEditModal(false);
        alert('Student updated successfully!');
      } else {
        setEditFormError(response.data.error || 'Failed to update student');
      }
    } catch (error: any) {
      setEditFormError(error.response?.data?.error || 'Failed to update student');
    } finally {
      setEditFormLoading(false);
    }
  };

  // Export functions
  const exportStudentsToCSV = (data: any[], filename: string) => {
    console.log('📊 Exporting students to CSV:', filename, data.length, 'students');
    
    if (data.length === 0) {
      alert('No students to export');
      return;
    }

    // Define CSV headers
    const headers = [
      'Student ID',
      'Name',
      'Class',
      'Section',
      'Roll Number',
      'Date of Birth',
      'Gender',
      'Parent Name',
      'Parent Phone',
      'Parent Email',
      'Student Phone',
      'Student Email',
      'Address',
      'Blood Group',
      'Bus',
    ];

    // Convert data to CSV format
    const csvData = data.map(student => [
      student.studentId || '',
      student.name || '',
      student.class || '',
      student.section || '',
      student.rollNumber || '',
      student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : '',
      student.gender || '',
      student.parentName || '',
      student.parentPhone || '',
      student.parentEmail || '',
      student.studentPhone || '',
      student.studentEmail || '',
      student.address || '',
      student.bloodGroup || '',
      student.bus || '',
    ]);

    // Combine headers and data
    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    console.log('✅ CSV export completed successfully');
    alert(`Successfully exported ${data.length} students to ${filename}`);
  };

  const handleExportAllStudents = () => {
    console.log('📊 Starting export of all students');
    const currentDate = new Date().toISOString().slice(0, 10);
    const filename = `all_students_${currentDate}.csv`;
    exportStudentsToCSV(students, filename);
  };

  const handleExportByClass = () => {
    console.log('📊 Starting export by class');
    const classFilter = prompt('Enter class to export (e.g., LKG, UKG, 1, 2, 10, 11, 12):');
    
    if (!classFilter) {
      console.log('❌ Export cancelled - no class specified');
      return;
    }

    const filteredStudents = students.filter(student => 
      student.class?.toString().toLowerCase() === classFilter.toLowerCase()
    );

    if (filteredStudents.length === 0) {
      alert(`No students found in class ${classFilter}`);
      console.log(`❌ No students found for class: ${classFilter}`);
      return;
    }

    const currentDate = new Date().toISOString().slice(0, 10);
    const filename = `class_${classFilter}_students_${currentDate}.csv`;
    exportStudentsToCSV(filteredStudents, filename);
  };

  const handleExportBySection = () => {
    console.log('📊 Starting export by section');
    const classFilter = prompt('Enter class (e.g., LKG, UKG, 1, 2, 10, 11, 12):');
    
    if (!classFilter) {
      console.log('❌ Export cancelled - no class specified');
      return;
    }

    const sectionFilter = prompt('Enter section (e.g., A, B, C):');
    
    if (!sectionFilter) {
      console.log('❌ Export cancelled - no section specified');
      return;
    }

    const filteredStudents = students.filter(student => 
      student.class?.toString().toLowerCase() === classFilter.toLowerCase() &&
      student.section?.toLowerCase() === sectionFilter.toLowerCase()
    );

    if (filteredStudents.length === 0) {
      alert(`No students found in class ${classFilter} section ${sectionFilter}`);
      console.log(`❌ No students found for class ${classFilter} section ${sectionFilter}`);
      return;
    }

    const currentDate = new Date().toISOString().slice(0, 10);
    const filename = `class_${classFilter}_section_${sectionFilter}_students_${currentDate}.csv`;
    exportStudentsToCSV(filteredStudents, filename);
  };

  const filterStudents = (students: any[], type: string) => {
    let filtered = students;
    
    // Filter by tab
    switch(type) {
      case 'lkg-10':
        filtered = filtered.filter(s => {
          const cls = s.class.toUpperCase();
          if (cls === 'LKG' || cls === 'UKG') return true;
          const clsNum = parseInt(s.class);
          return !isNaN(clsNum) && clsNum <= 10;
        });
        break;
      case '11-12':
        filtered = filtered.filter(s => ['11', '12'].includes(s.class));
        break;
    }
    
    // Filter by selected class
    if (selectedClass) {
      filtered = filtered.filter(s => s.class === selectedClass);
    }
    
    // Filter by selected section
    if (selectedSection) {
      filtered = filtered.filter(s => s.section === selectedSection);
    }
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.studentId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  };

  const filteredStudents = filterStudents(students, activeTab);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Students Management
        </h2>
        {(userRole === 'admin' || userRole === 'teacher') && (
          <button onClick={() => setShowAddModal(true)} className="btn-primary">
            Add Student
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-gray-200 dark:border-gray-700">
        {[
          { id: 'all', label: 'All Students' },
          { id: 'lkg-10', label: 'LKG - Class 10' },
          { id: '11-12', label: 'Class 11-12' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-amrita-orange border-b-2 border-amrita-orange'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Search</label>
            <input
              type="text"
              placeholder="Search by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Filter by Class</label>
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
            <label className="block text-sm font-medium mb-2">Filter by Section</label>
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
          <div className="flex items-end">
            <button
              onClick={() => {
                setSelectedClass('');
                setSelectedSection('');
                setSearchTerm('');
              }}
              className="btn-secondary w-full"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden p-0">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amrita-blue"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Class</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Section</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Parent Phone</th>
                  {activeTab === '11-12' && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Student Phone</th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Bus</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={activeTab === '11-12' ? 8 : 7} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                      No students found
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map(student => (
                    <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{student.studentId}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{student.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{student.class}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{student.section}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{student.parentPhone || '-'}</td>
                      {activeTab === '11-12' && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{student.studentPhone || '-'}</td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{student.bus || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                        <button onClick={() => handleViewStudent(student)} className="text-blue-600 hover:text-blue-800">View</button>
                        {(userRole === 'admin' || userRole === 'teacher') && (
                          <>
                            <button onClick={() => handleOpenEdit(student)} className="text-green-600 hover:text-green-800">Edit</button>
                            {userRole === 'admin' && (
                              <button 
                                onClick={() => handleDeleteStudent(student.id, student.name)}
                                className="text-red-600 hover:text-red-800"
                              >
                                Delete
                              </button>
                            )}
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Export Section */}
      {userRole === 'admin' && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">📊 Export Data</h3>
          <div className="flex gap-4">
            <button 
              onClick={handleExportAllStudents}
              className="btn-secondary hover:bg-blue-50 hover:text-blue-700 transition-colors flex items-center gap-2"
            >
              📋 Export All Students
            </button>
            <button 
              onClick={handleExportByClass}
              className="btn-secondary hover:bg-green-50 hover:text-green-700 transition-colors flex items-center gap-2"
            >
              🎓 Export by Class
            </button>
            <button 
              onClick={handleExportBySection}
              className="btn-secondary hover:bg-purple-50 hover:text-purple-700 transition-colors flex items-center gap-2"
            >
              📚 Export by Section
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            💡 Exports will be downloaded as CSV files with all student details
          </p>
        </div>
      )}

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-6 rounded-t-2xl sticky top-0">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-white">Add New Student</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleAddStudent} className="p-6">
              {formError && (
                <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-400 text-red-700 dark:text-red-400 rounded-lg text-sm">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Student ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Student ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.studentId}
                    onChange={(e) => setFormData({...formData, studentId: e.target.value})}
                    className="input-field"
                    placeholder="e.g., STU001"
                    required
                  />
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="input-field"
                    placeholder="Enter student name"
                    required
                  />
                </div>

                {/* Class */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Class <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.class}
                    onChange={(e) => setFormData({...formData, class: e.target.value})}
                    className="input-field"
                    required
                  >
                    <option value="">Select Class</option>
                    {classes.map(cls => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                  </select>
                </div>

                {/* Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Section <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.section}
                    onChange={(e) => setFormData({...formData, section: e.target.value})}
                    className="input-field"
                    required
                  >
                    <option value="">Select Section</option>
                    {sections.map(sec => (
                      <option key={sec} value={sec}>{sec}</option>
                    ))}
                  </select>
                </div>

                {/* Roll Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Roll Number
                  </label>
                  <input
                    type="text"
                    value={formData.rollNumber}
                    onChange={(e) => setFormData({...formData, rollNumber: e.target.value})}
                    className="input-field"
                    placeholder="e.g., 25"
                  />
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                    className="input-field"
                  />
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Gender
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({...formData, gender: e.target.value})}
                    className="input-field"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Blood Group */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Blood Group
                  </label>
                  <select
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData({...formData, bloodGroup: e.target.value})}
                    className="input-field"
                  >
                    <option value="">Select Blood Group</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>

                {/* Parent Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Parent/Guardian Name
                  </label>
                  <input
                    type="text"
                    value={formData.parentName}
                    onChange={(e) => setFormData({...formData, parentName: e.target.value})}
                    className="input-field"
                    placeholder="Enter parent name"
                  />
                </div>

                {/* Parent Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Parent Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.parentPhone}
                    onChange={(e) => setFormData({...formData, parentPhone: e.target.value})}
                    className="input-field"
                    placeholder="+91 9876543210"
                  />
                </div>

                {/* Parent Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Parent Email
                  </label>
                  <input
                    type="email"
                    value={formData.parentEmail}
                    onChange={(e) => setFormData({...formData, parentEmail: e.target.value})}
                    className="input-field"
                    placeholder="parent@example.com"
                  />
                </div>

                {/* Address */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Address
                  </label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="input-field"
                    rows={3}
                    placeholder="Enter complete address"
                  />
                </div>

                {/* Bus Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Bus
                  </label>
                  <select
                    value={formData.busId}
                    onChange={(e) => setFormData({...formData, busId: e.target.value})}
                    className="input-field"
                  >
                    <option value="">No Bus Assigned</option>
                    {buses.map(bus => (
                      <option key={bus.id} value={bus.busId}>
                        {bus.busId} - {bus.driverName} ({bus.route})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex gap-4 mt-6">
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {formLoading ? 'Adding...' : 'Add Student'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-6 py-3 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 font-semibold rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Student Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 flex justify-between items-center border-b">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Student Details</h3>
              <button onClick={() => setSelectedStudent(null)} className="text-gray-500">×</button>
            </div>
            <div className="p-6 space-y-3">
              <p><strong>ID:</strong> {selectedStudent.studentId}</p>
              <p><strong>Name:</strong> {selectedStudent.name}</p>
              <p><strong>Class:</strong> {selectedStudent.class} - {selectedStudent.section}</p>
              <p><strong>Roll Number:</strong> {selectedStudent.rollNumber || '-'}</p>
              <p><strong>Date of Birth:</strong> {selectedStudent.dateOfBirth ? new Date(selectedStudent.dateOfBirth).toLocaleDateString() : '-'}</p>
              <p><strong>Gender:</strong> {selectedStudent.gender || '-'}</p>
              <p><strong>Parent:</strong> {selectedStudent.parentName || '-'} ({selectedStudent.parentPhone || '-'})</p>
              <p><strong>Address:</strong> {selectedStudent.address || '-'}</p>
              <p><strong>Bus:</strong> {selectedStudent.bus || selectedStudent.busId || '-'}</p>
            </div>
            <div className="p-6 flex gap-3">
              <button onClick={() => { setSelectedStudent(null); handleOpenEdit(selectedStudent); }} className="btn-primary">Edit</button>
              <button onClick={() => setSelectedStudent(null)} className="btn-secondary">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {showEditModal && editFormData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 flex justify-between items-center border-b">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Student</h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-500">×</button>
            </div>
            <form onSubmit={handleEditStudent} className="p-6 space-y-4">
              {editFormError && <div className="text-sm text-red-600">{editFormError}</div>}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Student ID</label>
                  <input value={editFormData.studentId} onChange={(e)=>setEditFormData({...editFormData, studentId: e.target.value})} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Full Name</label>
                  <input value={editFormData.name} onChange={(e)=>setEditFormData({...editFormData, name: e.target.value})} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Class</label>
                  <select value={editFormData.class} onChange={(e)=>setEditFormData({...editFormData, class: e.target.value})} className="input-field">
                    <option value="">Select Class</option>
                    {classes.map(c=> <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Section</label>
                  <select value={editFormData.section} onChange={(e)=>setEditFormData({...editFormData, section: e.target.value})} className="input-field">
                    <option value="">Select Section</option>
                    {sections.map(s=> <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Parent Phone</label>
                  <input value={editFormData.parentPhone} onChange={(e)=>setEditFormData({...editFormData, parentPhone: e.target.value})} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Parent Email</label>
                  <input value={editFormData.parentEmail} onChange={(e)=>setEditFormData({...editFormData, parentEmail: e.target.value})} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Student Phone</label>
                  <input value={editFormData.studentPhone} onChange={(e)=>setEditFormData({...editFormData, studentPhone: e.target.value})} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Bus</label>
                  <select
                    value={editFormData.busId || ''}
                    onChange={(e) => setEditFormData({...editFormData, busId: e.target.value})}
                    className="input-field"
                  >
                    <option value="">No Bus Assigned</option>
                    {buses.map(bus => (
                      <option key={bus.id} value={bus.busId}>
                        {bus.busId} - {bus.driverName} ({bus.route})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3">
                <button type="submit" disabled={editFormLoading} className="btn-primary">Save Changes</button>
                <button type="button" onClick={()=>setShowEditModal(false)} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
