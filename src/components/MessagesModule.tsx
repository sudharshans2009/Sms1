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
  isRead: boolean;
  readAt?: string;
  priority: 'NORMAL' | 'IMPORTANT' | 'URGENT';
  createdAt: string;
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
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
  const [showCompose, setShowCompose] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  
  // Form state
  const [formData, setFormData] = useState({
    receiverId: '',
    receiverName: '',
    receiverRole: '',
    subject: '',
    content: '',
    priority: 'NORMAL' as 'NORMAL' | 'IMPORTANT' | 'URGENT',
  });

  // Fetch messages
  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/messages?userId=${currentUser.id}&type=${activeTab}`
      );
      const data = await response.json();
      
      if (data.messages) {
        setMessages(data.messages);
        if (activeTab === 'received') {
          setUnreadCount(data.unreadCount || 0);
        }
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch users for recipient selection
  const fetchUsers = async () => {
    try {
      const [studentsRes, teachersRes] = await Promise.all([
        fetch('/api/students'),
        fetch('/api/teachers'),
      ]);
      
      const studentsData = await studentsRes.json();
      const teachersData = await teachersRes.json();
      
      const allUsers: User[] = [
        ...(studentsData.students || []).map((s: any) => ({
          id: s.userId || s.id,
          name: s.name,
          role: 'STUDENT',
        })),
        ...(teachersData.teachers || []).map((t: any) => ({
          id: t.userId || t.id,
          name: t.name,
          role: 'TEACHER',
        })),
      ];
      
      setUsers(allUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [activeTab]);

  useEffect(() => {
    fetchUsers();
  }, []);

  // Send message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          senderId: currentUser.id,
          senderName: currentUser.name,
          senderRole: currentUser.role,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Message sent successfully!');
        setShowCompose(false);
        setFormData({
          receiverId: '',
          receiverName: '',
          receiverRole: '',
          subject: '',
          content: '',
          priority: 'NORMAL',
        });
        fetchMessages();
      } else {
        alert('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Error sending message');
    }
  };

  // Mark message as read
  const markAsRead = async (messageId: string) => {
    try {
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'markAsRead',
          messageId,
        }),
      });
      
      fetchMessages();
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  // Delete message
  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;
    
    try {
      const response = await fetch(`/api/messages?messageId=${messageId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Message deleted successfully!');
        setSelectedMessage(null);
        fetchMessages();
      } else {
        alert('Failed to delete message');
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      alert('Error deleting message');
    }
  };

  // Handle recipient selection
  const handleRecipientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const userId = e.target.value;
    const user = users.find(u => u.id === userId);
    
    if (user) {
      setFormData({
        ...formData,
        receiverId: user.id,
        receiverName: user.name,
        receiverRole: user.role,
      });
    }
  };

  // Priority badge color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-red-100 text-red-800';
      case 'IMPORTANT':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Messages</h2>
          {unreadCount > 0 && activeTab === 'received' && (
            <span className="text-sm text-red-600 dark:text-red-400 font-semibold">
              {unreadCount} unread message{unreadCount > 1 ? 's' : ''}
            </span>
          )}
        </div>
        <button
          onClick={() => setShowCompose(true)}
          className="bg-blue-600 dark:bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
        >
          ✉️ Compose Message
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('received')}
          className={`pb-2 px-4 font-semibold transition-colors ${
            activeTab === 'received'
              ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
          }`}
        >
          📥 Inbox
        </button>
        <button
          onClick={() => setActiveTab('sent')}
          className={`pb-2 px-4 font-semibold transition-colors ${
            activeTab === 'sent'
              ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
          }`}
        >
          📤 Sent
        </button>
      </div>

      {/* Compose Modal */}
      {showCompose && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Compose Message</h3>
              <button
                onClick={() => setShowCompose(false)}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-2xl"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleSendMessage} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  To:
                </label>
                <select
                  value={formData.receiverId}
                  onChange={handleRecipientChange}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                >
                  <option value="">Select recipient...</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Priority:
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="NORMAL">Normal</option>
                  <option value="IMPORTANT">Important</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Subject:
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter subject..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Message:
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows={8}
                  placeholder="Enter your message..."
                  required
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 dark:bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
                >
                  Send Message
                </button>
                <button
                  type="button"
                  onClick={() => setShowCompose(false)}
                  className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Message Detail Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{selectedMessage.subject}</h3>
                <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(selectedMessage.priority)}`}>
                  {selectedMessage.priority}
                </span>
              </div>
              <button
                onClick={() => setSelectedMessage(null)}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-3 mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>From:</strong> {selectedMessage.senderName} ({selectedMessage.senderRole})
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>To:</strong> {selectedMessage.receiverName} ({selectedMessage.receiverRole})
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>Date:</strong> {new Date(selectedMessage.createdAt).toLocaleString()}
              </p>
              {selectedMessage.isRead && selectedMessage.readAt && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>Read:</strong> {new Date(selectedMessage.readAt).toLocaleString()}
                </p>
              )}
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-4">
              <p className="whitespace-pre-wrap text-gray-900 dark:text-gray-100">{selectedMessage.content}</p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => handleDeleteMessage(selectedMessage.id)}
                className="flex-1 bg-red-600 dark:bg-red-700 text-white px-4 py-2 rounded-lg hover:bg-red-700 dark:hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
              <button
                onClick={() => setSelectedMessage(null)}
                className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Messages List */}
      <div className="space-y-2">
        {loading ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No messages found
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              onClick={() => {
                if (!message.isRead && activeTab === 'received') {
                  markAsRead(message.id);
                }
                setSelectedMessage(message);
              }}
              className={`p-4 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                !message.isRead && activeTab === 'received' ? 'bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20 border-blue-300 dark:border-blue-700' : ''
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {!message.isRead && activeTab === 'received' && (
                      <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                    )}
                    <h4 className="font-semibold text-gray-800 dark:text-white">{message.subject}</h4>
                    <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(message.priority)}`}>
                      {message.priority}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {activeTab === 'received' ? (
                      <>From: {message.senderName} ({message.senderRole})</>
                    ) : (
                      <>To: {message.receiverName} ({message.receiverRole})</>
                    )}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-1 line-clamp-1">
                    {message.content}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    {new Date(message.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    {new Date(message.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
