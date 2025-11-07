'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

interface TeachersModuleProps {
  userRole: string;
}

export default function TeachersModule({ userRole }: TeachersModuleProps) {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    teacherId: '',
    name: '',
    subject: '',
    qualification: '',
    experience: '',
    phone: '',
    email: '',
    address: '',
    joiningDate: ''
  });
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<any | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState<any>(null);
  const [editFormError, setEditFormError] = useState('');
  const [editFormLoading, setEditFormLoading] = useState(false);

  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/teachers');
      if (response.data.success) {
        setTeachers(response.data.data);
      }
    } catch (error) {
      console.error('Error loading teachers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);

    try {
      const response = await axios.post('/api/teachers', formData);
      if (response.data.success) {
        setShowAddModal(false);
        setFormData({
          teacherId: '',
          name: '',
          subject: '',
          qualification: '',
          experience: '',
          phone: '',
          email: '',
          address: '',
          joiningDate: ''
        });
        loadTeachers();
        alert('Teacher added successfully!');
      }
    } catch (error: any) {
      setFormError(error.response?.data?.error || 'Failed to add teacher');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteTeacher = async (teacherId: string, teacherName: string) => {
    if (!confirm(`Are you sure you want to delete ${teacherName}? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await axios.delete(`/api/teachers/${teacherId}`);
      if (response.data.success) {
        setTeachers(teachers.filter(t => t.id !== teacherId));
        alert('✅ Teacher deleted successfully!');
      }
    } catch (error: any) {
      console.error('Error deleting teacher:', error);
      alert(`❌ ${error.response?.data?.error || 'Failed to delete teacher'}`);
    }
  };

  const handleViewTeacher = (teacher: any) => {
    setSelectedTeacher(teacher);
  };

  const handleOpenEdit = (teacher: any) => {
    setEditFormError('');
    setEditFormData({
      teacherId: teacher.teacherId,
      name: teacher.name,
      subject: teacher.subject || '',
      qualification: teacher.qualification || '',
      experience: teacher.experience || '',
      phone: teacher.phone || '',
      email: teacher.email || '',
      address: teacher.address || '',
      joiningDate: teacher.joiningDate ? new Date(teacher.joiningDate).toISOString().slice(0, 10) : '',
      id: teacher.id,
    });
    setShowEditModal(true);
  };

  const handleEditTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditFormError('');
    setEditFormLoading(true);

    try {
      const id = editFormData.id;
      const payload = { ...editFormData };
      delete payload.id;

      const response = await axios.put(`/api/teachers/${id}`, payload);
      if (response.data.success) {
        setTeachers((prev) => prev.map(t => t.id === id ? response.data.data : t));
        setShowEditModal(false);
        alert('Teacher updated successfully!');
      } else {
        setEditFormError(response.data.error || 'Failed to update teacher');
      }
    } catch (error: any) {
      setEditFormError(error.response?.data?.error || 'Failed to update teacher');
    } finally {
      setEditFormLoading(false);
    }
  };

  const filteredTeachers = teachers.filter(t =>
    searchTerm === '' ||
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.teacherId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.subject?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Teachers Management
        </h2>
        {userRole === 'admin' && (
          <button onClick={() => setShowAddModal(true)} className="btn-primary">
            Add Teacher
          </button>
        )}
      </div>

      {/* Search */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">Search Teachers</label>
            <input
              type="text"
              placeholder="Search by name, ID, or subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setSearchTerm('')}
              className="btn-secondary w-full"
            >
              Clear Search
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Subject</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Qualification</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredTeachers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                      No teachers found
                    </td>
                  </tr>
                ) : (
                  filteredTeachers.map(teacher => (
                    <tr key={teacher.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{teacher.teacherId}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{teacher.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{teacher.subject || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{teacher.qualification || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{teacher.phone || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{teacher.email || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                        <button onClick={() => handleViewTeacher(teacher)} className="text-blue-600 hover:text-blue-800">View</button>
                        {userRole === 'admin' && (
                          <>
                            <button onClick={() => handleOpenEdit(teacher)} className="text-green-600 hover:text-green-800">Edit</button>
                            <button 
                              onClick={() => handleDeleteTeacher(teacher.id, teacher.name)}
                              className="text-red-600 hover:text-red-800"
                            >
                              Delete
                            </button>
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

      {/* Add Teacher Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-6 rounded-t-2xl sticky top-0">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-white">Add New Teacher</h3>
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
            <form onSubmit={handleAddTeacher} className="p-6">
              {formError && (
                <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-400 text-red-700 dark:text-red-400 rounded-lg text-sm">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Teacher ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Teacher ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.teacherId}
                    onChange={(e) => setFormData({...formData, teacherId: e.target.value})}
                    className="input-field"
                    placeholder="e.g., T001"
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
                    placeholder="Enter teacher name"
                    required
                  />
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    className="input-field"
                    placeholder="e.g., Mathematics"
                  />
                </div>

                {/* Qualification */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Qualification
                  </label>
                  <input
                    type="text"
                    value={formData.qualification}
                    onChange={(e) => setFormData({...formData, qualification: e.target.value})}
                    className="input-field"
                    placeholder="e.g., M.Sc., B.Ed."
                  />
                </div>

                {/* Experience */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Experience
                  </label>
                  <input
                    type="text"
                    value={formData.experience}
                    onChange={(e) => setFormData({...formData, experience: e.target.value})}
                    className="input-field"
                    placeholder="e.g., 5 years"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="input-field"
                    placeholder="+91 9876543210"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="input-field"
                    placeholder="teacher@amrita.edu"
                  />
                </div>

                {/* Joining Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Joining Date
                  </label>
                  <input
                    type="date"
                    value={formData.joiningDate}
                    onChange={(e) => setFormData({...formData, joiningDate: e.target.value})}
                    className="input-field"
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
              </div>

              {/* Form Actions */}
              <div className="flex gap-4 mt-6">
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {formLoading ? 'Adding...' : 'Add Teacher'}
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

      {/* View Teacher Modal */}
      {selectedTeacher && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 flex justify-between items-center border-b">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Teacher Details</h3>
              <button onClick={() => setSelectedTeacher(null)} className="text-gray-500 text-2xl">×</button>
            </div>
            <div className="p-6 space-y-3">
              <p><strong>ID:</strong> {selectedTeacher.teacherId}</p>
              <p><strong>Name:</strong> {selectedTeacher.name}</p>
              <p><strong>Subject:</strong> {selectedTeacher.subject || '-'}</p>
              <p><strong>Qualification:</strong> {selectedTeacher.qualification || '-'}</p>
              <p><strong>Experience:</strong> {selectedTeacher.experience || '-'}</p>
              <p><strong>Phone:</strong> {selectedTeacher.phone || '-'}</p>
              <p><strong>Email:</strong> {selectedTeacher.email || '-'}</p>
              <p><strong>Joining Date:</strong> {selectedTeacher.joiningDate ? new Date(selectedTeacher.joiningDate).toLocaleDateString() : '-'}</p>
              <p><strong>Address:</strong> {selectedTeacher.address || '-'}</p>
            </div>
            <div className="p-6 flex gap-3">
              {userRole === 'admin' && (
                <button onClick={() => { setSelectedTeacher(null); handleOpenEdit(selectedTeacher); }} className="btn-primary">Edit</button>
              )}
              <button onClick={() => setSelectedTeacher(null)} className="btn-secondary">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Teacher Modal */}
      {showEditModal && editFormData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 flex justify-between items-center border-b">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Teacher</h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-500 text-2xl">×</button>
            </div>
            <form onSubmit={handleEditTeacher} className="p-6 space-y-4">
              {editFormError && <div className="text-sm text-red-600 p-3 bg-red-50 dark:bg-red-900/30 rounded">{editFormError}</div>}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Teacher ID</label>
                  <input value={editFormData.teacherId} onChange={(e)=>setEditFormData({...editFormData, teacherId: e.target.value})} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Full Name</label>
                  <input value={editFormData.name} onChange={(e)=>setEditFormData({...editFormData, name: e.target.value})} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Subject</label>
                  <input value={editFormData.subject} onChange={(e)=>setEditFormData({...editFormData, subject: e.target.value})} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Qualification</label>
                  <input value={editFormData.qualification} onChange={(e)=>setEditFormData({...editFormData, qualification: e.target.value})} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Experience</label>
                  <input value={editFormData.experience} onChange={(e)=>setEditFormData({...editFormData, experience: e.target.value})} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Phone</label>
                  <input value={editFormData.phone} onChange={(e)=>setEditFormData({...editFormData, phone: e.target.value})} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input value={editFormData.email} onChange={(e)=>setEditFormData({...editFormData, email: e.target.value})} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Joining Date</label>
                  <input type="date" value={editFormData.joiningDate} onChange={(e)=>setEditFormData({...editFormData, joiningDate: e.target.value})} className="input-field" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Address</label>
                  <textarea value={editFormData.address} onChange={(e)=>setEditFormData({...editFormData, address: e.target.value})} className="input-field" rows={3} />
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
