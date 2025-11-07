'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

interface ClassesModuleProps {
  userRole: string;
}

export default function ClassesModule({ userRole }: ClassesModuleProps) {
  const [classes, setClasses] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    section: '',
    teacherId: '',
    room: '',
    capacity: ''
  });
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    loadClasses();
    loadTeachers();
  }, []);

  const loadClasses = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/classes');
      if (response.data.success) {
        setClasses(response.data.data);
      }
    } catch (error) {
      console.error('Error loading classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTeachers = async () => {
    try {
      const response = await axios.get('/api/teachers');
      if (response.data.success) {
        setTeachers(response.data.data);
      }
    } catch (error) {
      console.error('Error loading teachers:', error);
    }
  };

  const handleAddClass = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);

    try {
      const response = await axios.post('/api/classes', {
        ...formData,
        capacity: formData.capacity ? parseInt(formData.capacity) : undefined
      });
      if (response.data.success) {
        setShowAddModal(false);
        setFormData({
          name: '',
          section: '',
          teacherId: '',
          room: '',
          capacity: ''
        });
        loadClasses();
        alert('Class added successfully!');
      }
    } catch (error: any) {
      setFormError(error.response?.data?.error || 'Failed to add class');
    } finally {
      setFormLoading(false);
    }
  };

  const handleViewClass = (classItem: any) => {
    console.log('👁️ Viewing class:', classItem);
    setSelectedClass(classItem);
    setShowViewModal(true);
  };

  const handleEditClass = (classItem: any) => {
    console.log('✏️ Editing class:', classItem);
    setSelectedClass(classItem);
    setFormData({
      name: classItem.name,
      section: classItem.section || '',
      teacherId: classItem.classTeacherId || '',
      room: classItem.room || '',
      capacity: classItem.capacity ? classItem.capacity.toString() : ''
    });
    setFormError('');
    setShowEditModal(true);
  };

  const handleUpdateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);

    try {
      console.log('📤 Updating class:', selectedClass.id, formData);
      const response = await axios.put(`/api/classes/${selectedClass.id}`, {
        ...formData,
        capacity: formData.capacity ? parseInt(formData.capacity) : undefined
      });
      
      if (response.data.success) {
        setShowEditModal(false);
        setSelectedClass(null);
        setFormData({
          name: '',
          section: '',
          teacherId: '',
          room: '',
          capacity: ''
        });
        loadClasses();
        alert('Class updated successfully!');
        console.log('✅ Class updated successfully');
      } else {
        setFormError(response.data.error || 'Failed to update class');
      }
    } catch (error: any) {
      console.error('❌ Error updating class:', error);
      setFormError(error.response?.data?.error || 'Failed to update class');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteClass = async (classItem: any) => {
    console.log('🗑️ Attempting to delete class:', classItem);
    
    if (!confirm(`Are you sure you want to delete class ${classItem.name} ${classItem.section}? This action cannot be undone.`)) {
      return;
    }

    setDeleting(classItem.id);
    
    try {
      const response = await axios.delete(`/api/classes/${classItem.id}`);
      
      if (response.data.success) {
        loadClasses();
        alert('Class deleted successfully!');
        console.log('✅ Class deleted successfully');
      } else {
        alert('Failed to delete class: ' + response.data.error);
        console.error('❌ Failed to delete class:', response.data.error);
      }
    } catch (error: any) {
      console.error('❌ Error deleting class:', error);
      alert('Failed to delete class: ' + (error.response?.data?.error || error.message));
    } finally {
      setDeleting(null);
    }
  };

  const filteredClasses = classes.filter(c =>
    searchTerm === '' ||
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.section?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.room?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Classes Management
        </h2>
        {userRole === 'admin' && (
          <button onClick={() => setShowAddModal(true)} className="btn-primary">
            Add Class
          </button>
        )}
      </div>

      {/* Search */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">Search Classes</label>
            <input
              type="text"
              placeholder="Search by name, section, or room..."
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Class</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Section</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Class Teacher</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Room</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Capacity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Students</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredClasses.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                      No classes found
                    </td>
                  </tr>
                ) : (
                  filteredClasses.map(classItem => (
                    <tr key={classItem.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{classItem.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{classItem.section || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {classItem.classTeacher?.name || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{classItem.room || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{classItem.capacity || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {classItem.students?.length || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                        <button 
                          onClick={() => handleViewClass(classItem)}
                          className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                        >
                          👁️ View
                        </button>
                        {userRole === 'admin' && (
                          <>
                            <button 
                              onClick={() => handleEditClass(classItem)}
                              className="text-green-600 hover:text-green-800 hover:bg-green-50 px-2 py-1 rounded transition-colors"
                            >
                              ✏️ Edit
                            </button>
                            <button 
                              onClick={() => handleDeleteClass(classItem)}
                              disabled={deleting === classItem.id}
                              className="text-red-600 hover:text-red-800 hover:bg-red-50 px-2 py-1 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {deleting === classItem.id ? '🗑️ Deleting...' : '🗑️ Delete'}
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

      {/* Add Class Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 rounded-t-2xl sticky top-0">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-white">Add New Class</h3>
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
            <form onSubmit={handleAddClass} className="p-6">
              {formError && (
                <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-400 text-red-700 dark:text-red-400 rounded-lg text-sm">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Class Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Class Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="input-field"
                    placeholder="e.g., 10"
                    required
                  />
                </div>

                {/* Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Section <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.section}
                    onChange={(e) => setFormData({...formData, section: e.target.value})}
                    className="input-field"
                    placeholder="e.g., A"
                    required
                  />
                </div>

                {/* Class Teacher */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Class Teacher
                  </label>
                  <select
                    value={formData.teacherId}
                    onChange={(e) => setFormData({...formData, teacherId: e.target.value})}
                    className="input-field"
                  >
                    <option value="">Select Teacher</option>
                    {teachers.map(teacher => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.name} ({teacher.teacherId})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Room */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Room Number
                  </label>
                  <input
                    type="text"
                    value={formData.room}
                    onChange={(e) => setFormData({...formData, room: e.target.value})}
                    className="input-field"
                    placeholder="e.g., 101"
                  />
                </div>

                {/* Capacity */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Class Capacity
                  </label>
                  <input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                    className="input-field"
                    placeholder="e.g., 40"
                    min="1"
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex gap-4 mt-6">
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {formLoading ? 'Adding...' : 'Add Class'}
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

      {/* View Class Modal */}
      {showViewModal && selectedClass && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-6 rounded-t-2xl sticky top-0">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-white">Class Details</h3>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Class Name</label>
                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{selectedClass.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Section</label>
                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{selectedClass.section || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Room Number</label>
                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{selectedClass.room || 'N/A'}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Class Teacher</label>
                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{selectedClass.classTeacher?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Capacity</label>
                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{selectedClass.capacity || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Current Students</label>
                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{selectedClass.students?.length || 0}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="w-full py-3 px-4 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 font-semibold rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Class Modal */}
      {showEditModal && selectedClass && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-green-500 to-blue-500 p-6 rounded-t-2xl sticky top-0">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-white">Edit Class</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleUpdateClass} className="p-6">
              {formError && (
                <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-400 text-red-700 dark:text-red-400 rounded-lg text-sm">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Class Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Class Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="input-field"
                    placeholder="e.g., 10"
                    required
                  />
                </div>

                {/* Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Section <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.section}
                    onChange={(e) => setFormData({...formData, section: e.target.value})}
                    className="input-field"
                    placeholder="e.g., A"
                    required
                  />
                </div>

                {/* Class Teacher */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Class Teacher
                  </label>
                  <select
                    value={formData.teacherId}
                    onChange={(e) => setFormData({...formData, teacherId: e.target.value})}
                    className="input-field"
                  >
                    <option value="">Select Teacher</option>
                    {teachers.map(teacher => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.name} ({teacher.teacherId})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Room */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Room Number
                  </label>
                  <input
                    type="text"
                    value={formData.room}
                    onChange={(e) => setFormData({...formData, room: e.target.value})}
                    className="input-field"
                    placeholder="e.g., 101"
                  />
                </div>

                {/* Capacity */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Class Capacity
                  </label>
                  <input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                    className="input-field"
                    placeholder="e.g., 40"
                    min="1"
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex gap-4 mt-6">
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-green-500 to-blue-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {formLoading ? 'Updating...' : 'Update Class'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-6 py-3 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 font-semibold rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
