// Enhanced MessagesModule with better debugging and user loading
'use client';

import React, { useState, useEffect } from 'react';

interface Message {
  id: string;
  subject: string;
  content: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  receiverId: string;
  receiverName: string;
  receiverRole: string;
  priority: 'LOW' | 'NORMAL' | 'IMPORTANT' | 'HIGH' | 'URGENT';
  category: string;
  isRead: boolean;
  readAt: string | null;
  isStarred: boolean;
  isArchived: boolean;
  isDraft: boolean;
  threadId: string | null;
  replyToId: string | null;
  createdAt: string;
  updatedAt: string;
}

interface User {
  id: string;
  name: string;
  role: string;
}

interface MessagesModuleFixedProps {
  currentUser: {
    id: string;
    name: string;
    role: string;
  };
}

export default function MessagesModuleFixed({ currentUser }: MessagesModuleFixedProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'received' | 'sent' | 'starred' | 'archived' | 'drafts'>('received');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [showCompose, setShowCompose] = useState(false);
  const [showMessageDetail, setShowMessageDetail] = useState(false);
  const [counts, setCounts] = useState({
    received: 0,
    sent: 0,
    starred: 0,
    archived: 0,
    drafts: 0,
    unread: 0,
  });

  // Users for recipient selection
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);

  // Compose form
  const [composeForm, setComposeForm] = useState({
    subject: '',
    content: '',
    receiverId: '',
    receiverName: '',
    receiverRole: '',
    priority: 'NORMAL' as Message['priority'],
    category: 'GENERAL',
    isDraft: false,
    replyToId: null as string | null,
  });

  // Load users for recipient selection - Enhanced with better error handling
  const loadUsers = async () => {
    try {
      setUsersLoading(true);
      console.log('👥 Loading users for messaging...');
      
      const [studentsRes, teachersRes] = await Promise.all([
        fetch('/api/students'),
        fetch('/api/teachers'),
      ]);

      console.log('👥 API responses:', {
        students: { status: studentsRes.status, ok: studentsRes.ok },
        teachers: { status: teachersRes.status, ok: teachersRes.ok }
      });

      const [studentsData, teachersData] = await Promise.all([
        studentsRes.json(),
        teachersRes.json(),
      ]);

      console.log('👥 API data:', { studentsData, teachersData });

      const allUsers: User[] = [];

      // Handle students data - check multiple possible formats
      if (studentsData.success && studentsData.data) {
        console.log(`👨‍🎓 Processing ${studentsData.data.length} students`);
        allUsers.push(
          ...studentsData.data.map((s: any) => ({
            id: s.userId || s.id,
            name: s.name,
            role: 'STUDENT',
          }))
        );
      } else if (studentsData.students) {
        console.log(`👨‍🎓 Processing ${studentsData.students.length} students (alternate format)`);
        allUsers.push(
          ...studentsData.students.map((s: any) => ({
            id: s.userId || s.id,
            name: s.name,
            role: 'STUDENT',
          }))
        );
      } else if (Array.isArray(studentsData)) {
        console.log(`👨‍🎓 Processing ${studentsData.length} students (array format)`);
        allUsers.push(
          ...studentsData.map((s: any) => ({
            id: s.userId || s.id,
            name: s.name,
            role: 'STUDENT',
          }))
        );
      } else {
        console.log('👨‍🎓 No students found in expected format');
      }

      // Handle teachers data - check multiple possible formats
      if (teachersData.success && teachersData.data) {
        console.log(`👨‍🏫 Processing ${teachersData.data.length} teachers`);
        allUsers.push(
          ...teachersData.data.map((t: any) => ({
            id: t.userId || t.id,
            name: t.name,
            role: 'TEACHER',
          }))
        );
      } else if (teachersData.teachers) {
        console.log(`👨‍🏫 Processing ${teachersData.teachers.length} teachers (alternate format)`);
        allUsers.push(
          ...teachersData.teachers.map((t: any) => ({
            id: t.userId || t.id,
            name: t.name,
            role: 'TEACHER',
          }))
        );
      } else if (Array.isArray(teachersData)) {
        console.log(`👨‍🏫 Processing ${teachersData.length} teachers (array format)`);
        allUsers.push(
          ...teachersData.map((t: any) => ({
            id: t.userId || t.id,
            name: t.name,
            role: 'TEACHER',
          }))
        );
      } else {
        console.log('👨‍🏫 No teachers found in expected format');
      }

      setUsers(allUsers);
      console.log(`✅ Loaded ${allUsers.length} total users for messaging`);
    } catch (error: any) {
      console.error('❌ Failed to load users:', error);
      // Add some test users as fallback
      setUsers([
        { id: 'student1', name: 'Test Student 1', role: 'STUDENT' },
        { id: 'student2', name: 'Test Student 2', role: 'STUDENT' },
        { id: 'teacher1', name: 'Test Teacher 1', role: 'TEACHER' },
      ]);
    } finally {
      setUsersLoading(false);
    }
  };

  // Load messages - Enhanced with better error handling
  const loadMessages = async () => {
    try {
      setLoading(true);
      console.log(`📨 Loading messages for user ${currentUser.id} (${currentUser.name}), tab: ${activeTab}`);
      
      const params = new URLSearchParams({
        userId: currentUser.id,
        type: activeTab,
      });

      const response = await fetch(`/api/messages?${params}`);
      const data = await response.json();
      
      console.log('📨 Messages response:', { status: response.status, data });

      if (data.success) {
        setMessages(data.messages || []);
        setCounts(data.counts || {});
        console.log(`✅ Loaded ${data.messages?.length || 0} messages`);
      } else {
        console.error('❌ Failed to load messages:', data.error);
        setMessages([]);
      }
    } catch (error: any) {
      console.error('❌ Error loading messages:', error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  // Send message - Enhanced with validation and debugging
  const handleSendMessage = async (isDraft = false) => {
    try {
      console.log('📤 Sending message...', {
        isDraft,
        composeForm,
        currentUser,
        hasRecipient: !!composeForm.receiverId
      });

      // Enhanced validation
      if (!isDraft) {
        if (!composeForm.subject.trim()) {
          alert('Please enter a subject');
          return;
        }
        if (!composeForm.content.trim()) {
          alert('Please enter message content');
          return;
        }
        if (!composeForm.receiverId) {
          alert('Please select a recipient');
          return;
        }
        if (!composeForm.receiverName) {
          alert('Recipient information is incomplete');
          return;
        }
      }

      const messageData = {
        subject: composeForm.subject.trim(),
        content: composeForm.content.trim(),
        senderId: currentUser.id,
        senderName: currentUser.name,
        senderRole: currentUser.role,
        receiverId: composeForm.receiverId,
        receiverName: composeForm.receiverName,
        receiverRole: composeForm.receiverRole,
        priority: composeForm.priority,
        category: composeForm.category,
        isDraft,
        replyToId: composeForm.replyToId,
      };

      console.log('📤 Message data to send:', messageData);

      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageData),
      });

      const data = await response.json();
      console.log('📤 Send response:', { status: response.status, data });

      if (data.success) {
        alert(isDraft ? 'Draft saved successfully!' : 'Message sent successfully!');
        setShowCompose(false);
        resetComposeForm();
        loadMessages();
      } else {
        console.error('❌ Failed to send message:', data.error);
        alert('Failed to send message: ' + data.error);
      }
    } catch (error: any) {
      console.error('❌ Error sending message:', error);
      alert('Failed to send message: ' + (error.message || 'Unknown error'));
    }
  };

  // Reset compose form
  const resetComposeForm = () => {
    setComposeForm({
      subject: '',
      content: '',
      receiverId: '',
      receiverName: '',
      receiverRole: '',
      priority: 'NORMAL',
      category: 'GENERAL',
      isDraft: false,
      replyToId: null,
    });
  };

  // Handle recipient selection
  const handleRecipientChange = (selectedUserId: string) => {
    const selectedUser = users.find(u => u.id === selectedUserId);
    if (selectedUser) {
      setComposeForm(prev => ({
        ...prev,
        receiverId: selectedUser.id,
        receiverName: selectedUser.name,
        receiverRole: selectedUser.role,
      }));
      console.log('👤 Selected recipient:', selectedUser);
    }
  };

  // Load data on mount and tab change
  useEffect(() => {
    loadMessages();
  }, [activeTab]);

  useEffect(() => {
    loadUsers();
  }, []);

  if (loading && messages.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amrita-orange"></div>
        <p className="mt-4">Loading messages...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          📨 Messages {counts.unread > 0 && `(${counts.unread} unread)`}
        </h2>
        <button 
          onClick={() => setShowCompose(true)} 
          className="btn-primary bg-amrita-orange hover:bg-orange-600"
        >
          ✍️ Compose
        </button>
      </div>

      {/* Debug Info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm">
          🔧 Debug: User: {currentUser.name} ({currentUser.id}), Users loaded: {users.length}, Messages: {messages.length}
        </div>
      )}

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        {[
          { key: 'received', label: 'Inbox', count: counts.received },
          { key: 'sent', label: 'Sent', count: counts.sent },
          { key: 'starred', label: 'Starred', count: counts.starred },
          { key: 'drafts', label: 'Drafts', count: counts.drafts },
          { key: 'archived', label: 'Archive', count: counts.archived },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-white dark:bg-gray-700 text-amrita-orange shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            {tab.label} {tab.count > 0 && `(${tab.count})`}
          </button>
        ))}
      </div>

      {/* Messages List */}
      <div className="space-y-4">
        {messages.length === 0 ? (
          <div className="card text-center py-12">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-bold mb-2">No Messages</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {activeTab === 'received' ? 'Your inbox is empty' : `No ${activeTab} messages`}
            </p>
          </div>
        ) : (
          messages.map(message => (
            <div
              key={message.id}
              className={`card p-4 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${
                !message.isRead && activeTab === 'received' ? 'border-l-4 border-amrita-orange' : ''
              }`}
              onClick={() => {
                setSelectedMessage(message);
                setShowMessageDetail(true);
              }}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className={`font-semibold ${!message.isRead && activeTab === 'received' ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                      {message.subject}
                    </h3>
                    {message.priority !== 'NORMAL' && (
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        message.priority === 'URGENT' ? 'bg-red-100 text-red-700' :
                        message.priority === 'IMPORTANT' ? 'bg-orange-100 text-orange-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {message.priority}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {activeTab === 'sent' ? `To: ${message.receiverName}` : `From: ${message.senderName}`}
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 line-clamp-2">
                    {message.content}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(message.createdAt).toLocaleDateString()}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    {message.isStarred && <span className="text-yellow-400">⭐</span>}
                    {!message.isRead && activeTab === 'received' && <span className="w-2 h-2 bg-amrita-orange rounded-full"></span>}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Compose Modal */}
      {showCompose && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  ✍️ Compose Message
                </h3>
                <button
                  onClick={() => {
                    setShowCompose(false);
                    resetComposeForm();
                  }}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ✕
                </button>
              </div>

              <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleSendMessage(false); }}>
                {/* Recipient Selection */}
                <div>
                  <label className="block text-sm font-medium mb-2">To *</label>
                  {usersLoading ? (
                    <div className="input-field text-gray-500">Loading users...</div>
                  ) : (
                    <select
                      value={composeForm.receiverId}
                      onChange={(e) => handleRecipientChange(e.target.value)}
                      className="input-field"
                      required
                    >
                      <option value="">Select recipient...</option>
                      <optgroup label="Students">
                        {users.filter(u => u.role === 'STUDENT').map(user => (
                          <option key={user.id} value={user.id}>
                            {user.name} ({user.role})
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="Teachers">
                        {users.filter(u => u.role === 'TEACHER').map(user => (
                          <option key={user.id} value={user.id}>
                            {user.name} ({user.role})
                          </option>
                        ))}
                      </optgroup>
                    </select>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Available: {users.length} users ({users.filter(u => u.role === 'STUDENT').length} students, {users.filter(u => u.role === 'TEACHER').length} teachers)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Subject *</label>
                  <input
                    type="text"
                    value={composeForm.subject}
                    onChange={(e) => setComposeForm(prev => ({ ...prev, subject: e.target.value }))}
                    className="input-field"
                    placeholder="Enter subject"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Message *</label>
                  <textarea
                    value={composeForm.content}
                    onChange={(e) => setComposeForm(prev => ({ ...prev, content: e.target.value }))}
                    className="input-field"
                    rows={5}
                    placeholder="Enter your message"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Priority</label>
                    <select
                      value={composeForm.priority}
                      onChange={(e) => setComposeForm(prev => ({ ...prev, priority: e.target.value as any }))}
                      className="input-field"
                    >
                      <option value="NORMAL">Normal</option>
                      <option value="IMPORTANT">Important</option>
                      <option value="URGENT">Urgent</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Category</label>
                    <select
                      value={composeForm.category}
                      onChange={(e) => setComposeForm(prev => ({ ...prev, category: e.target.value }))}
                      className="input-field"
                    >
                      <option value="GENERAL">General</option>
                      <option value="ACADEMIC">Academic</option>
                      <option value="ADMIN">Administrative</option>
                      <option value="EMERGENCY">Emergency</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => handleSendMessage(true)}
                    className="flex-1 btn-secondary"
                  >
                    💾 Save Draft
                  </button>
                  <button
                    type="submit"
                    disabled={!composeForm.receiverId || !composeForm.subject.trim() || !composeForm.content.trim()}
                    className="flex-1 btn-primary bg-amrita-orange hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    📤 Send Message
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