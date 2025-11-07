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
  replyTo?: {
    id: string;
    subject: string;
    senderName: string;
  } | null;
  _count?: {
    replies: number;
  };
  attachments?: any[];
}

interface User {
  id: string;
  name: string;
  role: string;
}

interface MessagesModuleProps {
  currentUser: {
    id: string;
    name: string;
    role: string;
  };
}

export default function MessagesModule({ currentUser }: MessagesModuleProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
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

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [filterPriority, setFilterPriority] = useState<string>('');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  // Users for recipient selection
  const [users, setUsers] = useState<User[]>([]);

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

  // Load messages
  const loadMessages = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        userId: currentUser.id,
        type: activeTab,
        ...(searchQuery && { search: searchQuery }),
        ...(filterCategory && { category: filterCategory }),
        ...(filterPriority && { priority: filterPriority }),
        ...(showUnreadOnly && activeTab === 'received' && { unreadOnly: 'true' }),
      });

      const response = await fetch(`/api/messages?${params}`);
      const data = await response.json();

      if (data.success) {
        setMessages(data.messages);
        setCounts(data.counts);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load users for recipient selection
  const loadUsers = async () => {
    try {
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

      console.log('👥 Raw API data:', { studentsData, teachersData });

      const allUsers: User[] = [];

      // Handle multiple possible response formats for students
      let students = [];
      if (studentsData.success && studentsData.data) {
        students = studentsData.data;
      } else if (studentsData.students) {
        students = studentsData.students;
      } else if (Array.isArray(studentsData)) {
        students = studentsData;
      }

      if (students.length > 0) {
        allUsers.push(
          ...students.map((s: any) => ({
            id: s.userId || s.id,
            name: s.name,
            role: 'STUDENT',
          }))
        );
        console.log(`👨‍🎓 Loaded ${students.length} students`);
      }

      // Handle multiple possible response formats for teachers
      let teachers = [];
      if (teachersData.success && teachersData.data) {
        teachers = teachersData.data;
      } else if (teachersData.teachers) {
        teachers = teachersData.teachers;
      } else if (Array.isArray(teachersData)) {
        teachers = teachersData;
      }

      if (teachers.length > 0) {
        allUsers.push(
          ...teachers.map((t: any) => ({
            id: t.userId || t.id,
            name: t.name,
            role: 'TEACHER',
          }))
        );
        console.log(`👨‍🏫 Loaded ${teachers.length} teachers`);
      }

      console.log(`✅ Total users loaded: ${allUsers.length}`);
      setUsers(allUsers);

      // If no users loaded, add fallback test users
      if (allUsers.length === 0) {
        console.log('⚠️ No users loaded, adding fallback test users');
        setUsers([
          { id: 'test-student-1', name: 'Test Student 1', role: 'STUDENT' },
          { id: 'test-student-2', name: 'Test Student 2', role: 'STUDENT' },
          { id: 'test-teacher-1', name: 'Test Teacher 1', role: 'TEACHER' },
        ]);
      }
    } catch (error) {
      console.error('❌ Failed to load users:', error);
      // Add fallback users
      setUsers([
        { id: 'test-student-1', name: 'Test Student 1', role: 'STUDENT' },
        { id: 'test-teacher-1', name: 'Test Teacher 1', role: 'TEACHER' },
      ]);
    }
  };

  useEffect(() => {
    loadMessages();
  }, [activeTab, searchQuery, filterCategory, filterPriority, showUnreadOnly]);

  useEffect(() => {
    loadUsers();
  }, []);

  // Send message
  const handleSendMessage = async (isDraft = false) => {
    if (sending) return; // Prevent double sending
    
    try {
      setSending(true);
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
          setSending(false);
          return;
        }
        if (!composeForm.content.trim()) {
          alert('Please enter message content');
          setSending(false);
          return;
        }
        if (!composeForm.receiverId) {
          alert('Please select a recipient');
          setSending(false);
          return;
        }
        if (!composeForm.receiverName) {
          alert('Recipient information is incomplete');
          setSending(false);
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
        console.log('✅ Message operation completed successfully');
      } else {
        console.error('❌ Failed to send message:', data.error);
        alert('Failed to send message: ' + data.error);
      }
    } catch (error: any) {
      console.error('❌ Error sending message:', error);
      alert('Failed to send message: ' + error.message);
    } finally {
      setSending(false);
    }
  };

  // Mark as read
  const markAsRead = async (messageId: string) => {
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'markAsRead',
          messageId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        loadMessages();
      }
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  // Toggle star
  const toggleStar = async (messageId: string) => {
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'toggleStar',
          messageId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        loadMessages();
        if (selectedMessage?.id === messageId) {
          setSelectedMessage(data.message);
        }
      }
    } catch (error) {
      console.error('Failed to toggle star:', error);
    }
  };

  // Toggle archive
  const toggleArchive = async (messageId: string) => {
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'toggleArchive',
          messageId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        loadMessages();
        if (selectedMessage?.id === messageId) {
          setShowMessageDetail(false);
          setSelectedMessage(null);
        }
      }
    } catch (error) {
      console.error('Failed to toggle archive:', error);
    }
  };

  // Delete message
  const deleteMessage = async (messageId: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;

    try {
      const response = await fetch(`/api/messages?messageId=${messageId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        alert('Message deleted successfully!');
        setShowMessageDetail(false);
        setSelectedMessage(null);
        loadMessages();
      }
    } catch (error) {
      console.error('Failed to delete message:', error);
      alert('Failed to delete message');
    }
  };

  // Open message
  const openMessage = async (message: Message) => {
    setSelectedMessage(message);
    setShowMessageDetail(true);

    // Mark as read if received and unread
    if (activeTab === 'received' && !message.isRead) {
      await markAsRead(message.id);
    }
  };

  // Reply to message
  const replyToMessage = (message: Message) => {
    setComposeForm({
      subject: message.subject.startsWith('RE:') ? message.subject : `RE: ${message.subject}`,
      content: `\n\n--- Original Message ---\nFrom: ${message.senderName}\nDate: ${new Date(message.createdAt).toLocaleString()}\n\n${message.content}`,
      receiverId: message.senderId,
      receiverName: message.senderName,
      receiverRole: message.senderRole,
      priority: 'NORMAL',
      category: message.category,
      isDraft: false,
      replyToId: message.id,
    });
    setShowMessageDetail(false);
    setShowCompose(true);
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
    } else {
      console.log('⚠️ Recipient not found:', selectedUserId);
    }
  };

  // Get priority badge color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-red-100 text-red-800';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800';
      case 'IMPORTANT':
        return 'bg-yellow-100 text-yellow-800';
      case 'NORMAL':
        return 'bg-blue-100 text-blue-800';
      case 'LOW':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get category badge color
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'EMERGENCY':
        return 'bg-red-100 text-red-800';
      case 'ACADEMIC':
        return 'bg-blue-100 text-blue-800';
      case 'ADMINISTRATIVE':
        return 'bg-purple-100 text-purple-800';
      case 'ATTENDANCE':
        return 'bg-green-100 text-green-800';
      case 'FEES':
        return 'bg-yellow-100 text-yellow-800';
      case 'EVENT':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Messages</h2>
        <button
          onClick={() => {
            resetComposeForm();
            setShowCompose(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <span>✉️</span>
          Compose
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 overflow-x-auto">
        {[
          { key: 'received', label: '📥 Inbox', count: counts.received },
          { key: 'sent', label: '📤 Sent', count: counts.sent },
          { key: 'starred', label: '⭐ Starred', count: counts.starred },
          { key: 'drafts', label: '📝 Drafts', count: counts.drafts },
          { key: 'archived', label: '📦 Archived', count: counts.archived },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2 font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.key
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-gray-200 rounded-full">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Unread Badge */}
      {counts.unread > 0 && activeTab === 'received' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-2">
          <span className="text-2xl">📬</span>
          <span className="text-blue-800 font-medium">
            You have {counts.unread} unread message{counts.unread !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <input
              type="text"
              placeholder="🔍 Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            <option value="GENERAL">General</option>
            <option value="ACADEMIC">Academic</option>
            <option value="ADMINISTRATIVE">Administrative</option>
            <option value="ATTENDANCE">Attendance</option>
            <option value="FEES">Fees</option>
            <option value="EVENT">Event</option>
            <option value="EMERGENCY">Emergency</option>
          </select>

          {/* Priority Filter */}
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="NORMAL">Normal</option>
            <option value="IMPORTANT">Important</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
        </div>

        {/* Unread Only Toggle */}
        {activeTab === 'received' && (
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showUnreadOnly}
              onChange={(e) => setShowUnreadOnly(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-gray-700">Show unread only</span>
          </label>
        )}
      </div>

      {/* Messages List */}
      <div className="bg-white rounded-lg shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <div className="text-4xl mb-2">📭</div>
            <p>No messages found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {messages.map((message) => (
              <div
                key={message.id}
                onClick={() => openMessage(message)}
                className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                  !message.isRead && activeTab === 'received' ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Star Icon */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleStar(message.id);
                    }}
                    className="text-xl hover:scale-110 transition-transform"
                  >
                    {message.isStarred ? '⭐' : '☆'}
                  </button>

                  {/* Message Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`font-medium ${!message.isRead && activeTab === 'received' ? 'text-gray-900' : 'text-gray-700'}`}>
                            {activeTab === 'sent' ? `To: ${message.receiverName}` : `From: ${message.senderName}`}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getPriorityColor(message.priority)}`}>
                            {message.priority}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getCategoryColor(message.category)}`}>
                            {message.category}
                          </span>
                          {message.isDraft && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-800">
                              DRAFT
                            </span>
                          )}
                        </div>
                        <div className={`mt-1 ${!message.isRead && activeTab === 'received' ? 'font-semibold' : 'font-normal'}`}>
                          {message.subject}
                        </div>
                        <div className="mt-1 text-sm text-gray-600 truncate">
                          {message.content}
                        </div>
                        <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                          <span>{new Date(message.createdAt).toLocaleString()}</span>
                          {message._count && message._count.replies > 0 && (
                            <span>💬 {message._count.replies} {message._count.replies === 1 ? 'reply' : 'replies'}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Compose Modal */}
      {showCompose && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-800">
                  {composeForm.replyToId ? '↩️ Reply to Message' : '✉️ Compose Message'}
                </h3>
                <button
                  onClick={() => setShowCompose(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              {/* Recipient */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  To: <span className="text-red-500">*</span>
                </label>
                <select
                  value={composeForm.receiverId}
                  onChange={(e) => handleRecipientChange(e.target.value)}
                  disabled={!!composeForm.replyToId}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  required
                >
                  <option value="">Select recipient...</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.role})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Available: {users.length} users ({users.filter(u => u.role === 'STUDENT').length} students, {users.filter(u => u.role === 'TEACHER').length} teachers)
                </p>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject: <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={composeForm.subject}
                  onChange={(e) => setComposeForm({ ...composeForm, subject: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter subject..."
                  required
                />
              </div>

              {/* Priority and Category */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority:
                  </label>
                  <select
                    value={composeForm.priority}
                    onChange={(e) => setComposeForm({ ...composeForm, priority: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="LOW">Low</option>
                    <option value="NORMAL">Normal</option>
                    <option value="IMPORTANT">Important</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category:
                  </label>
                  <select
                    value={composeForm.category}
                    onChange={(e) => setComposeForm({ ...composeForm, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="GENERAL">General</option>
                    <option value="ACADEMIC">Academic</option>
                    <option value="ADMINISTRATIVE">Administrative</option>
                    <option value="ATTENDANCE">Attendance</option>
                    <option value="FEES">Fees</option>
                    <option value="EVENT">Event</option>
                    <option value="EMERGENCY">Emergency</option>
                  </select>
                </div>
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message: <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={composeForm.content}
                  onChange={(e) => setComposeForm({ ...composeForm, content: e.target.value })}
                  rows={8}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Type your message here..."
                  required
                />
              </div>

              {/* Actions */}
              <div className="flex justify-between gap-4">
                <button
                  onClick={() => handleSendMessage(true)}
                  disabled={sending}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sending ? '💾 Saving...' : '💾 Save Draft'}
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowCompose(false)}
                    disabled={sending}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleSendMessage(false)}
                    disabled={sending || !composeForm.receiverId || !composeForm.subject.trim() || !composeForm.content.trim()}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sending ? '📤 Sending...' : '📤 Send'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Message Detail Modal */}
      {showMessageDetail && selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 space-y-4">
              {/* Header */}
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getPriorityColor(selectedMessage.priority)}`}>
                      {selectedMessage.priority}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getCategoryColor(selectedMessage.category)}`}>
                      {selectedMessage.category}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {selectedMessage.subject}
                  </h3>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">From:</span> {selectedMessage.senderName} ({selectedMessage.senderRole})
                    </div>
                    <div>
                      <span className="font-medium">To:</span> {selectedMessage.receiverName} ({selectedMessage.receiverRole})
                    </div>
                    <div>
                      <span className="font-medium">Date:</span> {new Date(selectedMessage.createdAt).toLocaleString()}
                    </div>
                    {selectedMessage.readAt && (
                      <div>
                        <span className="font-medium">Read:</span> {new Date(selectedMessage.readAt).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setShowMessageDetail(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              {/* Reply To Info */}
              {selectedMessage.replyTo && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <div className="text-sm text-gray-600">
                    ↩️ In reply to: <span className="font-medium">{selectedMessage.replyTo.subject}</span> from {selectedMessage.replyTo.senderName}
                  </div>
                </div>
              )}

              {/* Content */}
              <div className="border-t border-gray-200 pt-4">
                <div className="whitespace-pre-wrap text-gray-800">
                  {selectedMessage.content}
                </div>
              </div>

              {/* Actions */}
              <div className="border-t border-gray-200 pt-4 flex flex-wrap gap-2">
                {activeTab === 'received' && !selectedMessage.isDraft && (
                  <button
                    onClick={() => replyToMessage(selectedMessage)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    ↩️ Reply
                  </button>
                )}
                <button
                  onClick={() => toggleStar(selectedMessage.id)}
                  className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition-colors"
                >
                  {selectedMessage.isStarred ? '⭐ Unstar' : '☆ Star'}
                </button>
                <button
                  onClick={() => toggleArchive(selectedMessage.id)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  {selectedMessage.isArchived ? '📥 Unarchive' : '📦 Archive'}
                </button>
                <button
                  onClick={() => deleteMessage(selectedMessage.id)}
                  className="px-4 py-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
