// Enhanced AnnouncementsModule with better error handling and debugging
'use client';

import { useState, useEffect } from 'react';

interface AnnouncementsModuleProps {
  userRole: string;
  announcements?: any[];
}

export default function AnnouncementsModuleFixed({ userRole, announcements: initialAnnouncements }: AnnouncementsModuleProps) {
  const [announcements, setAnnouncements] = useState<any[]>(initialAnnouncements || []);
  const [loading, setLoading] = useState(!initialAnnouncements);
  const [showModal, setShowModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    priority: 'normal',
    target: 'all',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (!initialAnnouncements) {
      loadAnnouncements();
    }
  }, []);

  const loadAnnouncements = async () => {
    try {
      setLoading(true);
      console.log('📋 Loading announcements...');
      
      const response = await fetch('/api/announcements');
      const data = await response.json();
      
      console.log('📋 Announcements response:', { status: response.status, data });
      
      if (data.success) {
        setAnnouncements(data.data);
        console.log(`✅ Loaded ${data.data.length} announcements`);
      } else {
        console.error('❌ Failed to load announcements:', data.error);
        alert('Failed to load announcements: ' + data.error);
      }
    } catch (error: any) {
      console.error('❌ Error loading announcements:', error);
      alert('Failed to load announcements: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      console.log('💾 Saving announcement...', { editing: !!editingAnnouncement, formData });
      
      let response;
      
      if (editingAnnouncement) {
        // Update existing
        response = await fetch('/api/announcements', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingAnnouncement.id,
            title: formData.title,
            content: formData.content,
            priority: formData.priority.toUpperCase(),
            target: formData.target.toUpperCase(),
          }),
        });
      } else {
        // Create new
        response = await fetch('/api/announcements', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: formData.title,
            content: formData.content,
            priority: formData.priority.toUpperCase(),
            target: formData.target.toUpperCase(),
          }),
        });
      }
      
      const data = await response.json();
      console.log('💾 Save response:', { status: response.status, data });
      
      if (data.success) {
        if (editingAnnouncement) {
          setAnnouncements(announcements.map(a => 
            a.id === editingAnnouncement.id ? data.data : a
          ));
        } else {
          setAnnouncements([data.data, ...announcements]);
        }
        
        setShowModal(false);
        setEditingAnnouncement(null);
        setFormData({
          title: '',
          content: '',
          priority: 'normal',
          target: 'all',
          date: new Date().toISOString().split('T')[0]
        });
        
        alert(editingAnnouncement ? 'Announcement updated successfully!' : 'Announcement created successfully!');
      } else {
        console.error('❌ Failed to save announcement:', data.error);
        alert('Failed to save announcement: ' + data.error);
      }
    } catch (error: any) {
      console.error('❌ Error saving announcement:', error);
      alert('Failed to save announcement: ' + (error.message || 'Unknown error'));
    }
  };

  const handleEdit = (announcement: any) => {
    console.log('✏️ Editing announcement:', announcement);
    setEditingAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      content: announcement.content,
      priority: (announcement.priority || 'NORMAL').toLowerCase(),
      target: (announcement.target || 'ALL').toLowerCase(),
      date: announcement.createdAt ? new Date(announcement.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;
    
    try {
      console.log('🗑️ Deleting announcement:', id);
      
      const response = await fetch(`/api/announcements?id=${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      
      const data = await response.json();
      console.log('🗑️ Delete response:', { status: response.status, data });
      
      if (data.success) {
        setAnnouncements(announcements.filter(a => a.id !== id));
        alert('Announcement deleted successfully!');
        console.log('✅ Announcement deleted successfully');
      } else {
        console.error('❌ Failed to delete announcement:', data.error);
        alert('Failed to delete announcement: ' + data.error);
      }
    } catch (error: any) {
      console.error('❌ Error deleting announcement:', error);
      alert('Failed to delete announcement: ' + (error.message || 'Unknown error'));
    }
  };

  // Rest of the component remains the same...
  const getPriorityColor = (priority: string) => {
    const p = (priority || 'NORMAL').toLowerCase();
    switch(p) {
      case 'urgent': return 'bg-red-500';
      case 'important': return 'bg-amrita-orange';
      default: return 'bg-amrita-blue';
    }
  };

  const getPriorityBadge = (priority: string) => {
    const p = (priority || 'NORMAL').toLowerCase();
    switch(p) {
      case 'urgent': return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200';
      case 'important': return 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-200';
      default: return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200';
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amrita-orange"></div>
        <p className="mt-4">Loading announcements...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          📢 Announcements {announcements.length > 0 && `(${announcements.length})`}
        </h2>
        {userRole === 'admin' && (
          <button onClick={() => setShowModal(true)} className="btn-primary bg-amrita-orange hover:bg-orange-600">
            ➕ New Announcement
          </button>
        )}
      </div>

      {/* Debug Info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm">
          🔧 Debug: User Role: {userRole}, Announcements: {announcements.length}
        </div>
      )}

      {/* Announcements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {announcements.map((announcement) => (
          <div
            key={announcement.id}
            className={`relative overflow-hidden rounded-xl shadow-lg transition-transform hover:scale-105`}
          >
            {/* Colored header */}
            <div className={`${getPriorityColor(announcement.priority)} p-4 text-white`}>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold mb-1">{announcement.title}</h3>
                  <p className="text-sm opacity-90">
                    📅 {new Date(announcement.createdAt || announcement.date || Date.now()).toLocaleDateString()}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${getPriorityBadge(announcement.priority)}`}>
                  {(announcement.priority || 'NORMAL').toUpperCase()}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="bg-white dark:bg-gray-800 p-4">
              <p className="text-gray-700 dark:text-gray-300 mb-3">{announcement.content}</p>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">
                  🎯 Target: <span className="font-semibold">{(announcement.target || 'ALL').toUpperCase()}</span>
                </span>
                
                {userRole === 'admin' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(announcement)}
                      className="text-amrita-blue hover:text-blue-700 dark:hover:text-blue-400 font-medium"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDelete(announcement.id)}
                      className="text-red-500 hover:text-red-700 dark:hover:text-red-400 font-medium"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {announcements.length === 0 && (
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">📢</div>
          <h3 className="text-xl font-bold mb-2">No Announcements</h3>
          <p className="text-gray-600 dark:text-gray-400">
            {userRole === 'admin' ? 'Create your first announcement using the button above' : 'No announcements at this time'}
          </p>
        </div>
      )}

      {/* Modal - Same as original */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {editingAnnouncement ? '✏️ Edit Announcement' : '➕ New Announcement'}
                </h3>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setEditingAnnouncement(null);
                    setFormData({
                      title: '',
                      content: '',
                      priority: 'normal',
                      target: 'all',
                      date: new Date().toISOString().split('T')[0]
                    });
                  }}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="input-field"
                    placeholder="Enter announcement title"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Content *</label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="input-field"
                    rows={4}
                    placeholder="Enter announcement content"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Priority</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      className="input-field"
                    >
                      <option value="normal">Normal</option>
                      <option value="important">Important</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Target Audience</label>
                    <select
                      value={formData.target}
                      onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                      className="input-field"
                    >
                      <option value="all">All</option>
                      <option value="students">Students</option>
                      <option value="teachers">Teachers</option>
                      <option value="parents">Parents</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Date</label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="submit" className="flex-1 btn-primary bg-amrita-orange hover:bg-orange-600">
                    {editingAnnouncement ? '💾 Update Announcement' : '➕ Create Announcement'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingAnnouncement(null);
                    }}
                    className="flex-1 btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}