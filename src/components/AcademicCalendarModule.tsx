import React, { useState, useEffect } from 'react';
import { 
  Calendar,
  CalendarDays,
  Clock,
  BookOpen,
  GraduationCap,
  Plus,
  Edit,
  Trash2,
  Users,
  AlertCircle,
  FileText
} from 'lucide-react';

interface AcademicCalendarProps {
  userRole: string;
  userId: string;
}

interface CalendarItem {
  id: string;
  title: string;
  description: string;
  date?: string;
  startDate?: string;
  endDate?: string;
  type: 'event' | 'holiday' | 'exam' | 'academic-year' | 'term';
  status?: string;
  isActive?: boolean;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  eventType?: string;
  holidayType?: string;
  examType?: string;
}

interface AcademicYear {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

const AcademicCalendar: React.FC<AcademicCalendarProps> = ({ userRole, userId }) => {
  const [calendarItems, setCalendarItems] = useState<CalendarItem[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedView, setSelectedView] = useState<'month' | 'week' | 'list'>('month');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalType, setModalType] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedItem, setSelectedItem] = useState<CalendarItem | null>(null);

  // Form state for creating/editing items
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'event',
    startDate: '',
    endDate: '',
    date: '',
    eventType: 'MEETING',
    holidayType: 'PUBLIC',
    examType: 'MIDTERM',
    priority: 'MEDIUM',
    academicYearId: '',
    termId: '',
  });

  useEffect(() => {
    fetchAcademicYears();
    fetchCalendarData();
  }, [selectedYear, selectedType]);

  const fetchAcademicYears = async () => {
    try {
      const response = await fetch('/api/academic-calendar?type=academic-year');
      const result = await response.json();
      
      if (result.success) {
        setAcademicYears(result.data);
        if (!selectedYear && result.data.length > 0) {
          const activeYear = result.data.find((year: AcademicYear) => year.isActive);
          setSelectedYear(activeYear?.id || result.data[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching academic years:', error);
    }
  };

  const fetchCalendarData = async () => {
    setLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams();
      if (selectedYear) queryParams.append('academicYearId', selectedYear);
      if (selectedType !== 'all') queryParams.append('type', selectedType);
      queryParams.append('month', (selectedMonth + 1).toString());

      const response = await fetch(`/api/academic-calendar?${queryParams}`);
      const result = await response.json();

      if (result.success) {
        setCalendarItems(result.data);
      } else {
        setError(result.error || 'Failed to fetch calendar data');
      }
    } catch (error) {
      setError('Failed to load calendar data');
      console.error('Error fetching calendar data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateItem = async () => {
    try {
      const response = await fetch('/api/academic-calendar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          academicYearId: selectedYear,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setShowModal(false);
        resetForm();
        fetchCalendarData();
      } else {
        setError(result.error || 'Failed to create item');
      }
    } catch (error) {
      setError('Failed to create item');
      console.error('Error creating item:', error);
    }
  };

  const handleUpdateItem = async () => {
    if (!selectedItem) return;

    try {
      const response = await fetch(`/api/academic-calendar/${selectedItem.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          type: selectedItem.type,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setShowModal(false);
        resetForm();
        fetchCalendarData();
      } else {
        setError(result.error || 'Failed to update item');
      }
    } catch (error) {
      setError('Failed to update item');
      console.error('Error updating item:', error);
    }
  };

  const handleDeleteItem = async (item: CalendarItem) => {
    if (!confirm(`Are you sure you want to delete "${item.title}"?`)) return;

    try {
      const response = await fetch(`/api/academic-calendar/${item.id}?type=${item.type}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        fetchCalendarData();
      } else {
        setError(result.error || 'Failed to delete item');
      }
    } catch (error) {
      setError('Failed to delete item');
      console.error('Error deleting item:', error);
    }
  };

  const openModal = (type: 'create' | 'edit' | 'view', item?: CalendarItem) => {
    setModalType(type);
    if (item) {
      setSelectedItem(item);
      setFormData({
        title: item.title,
        description: item.description,
        type: item.type,
        startDate: item.startDate || '',
        endDate: item.endDate || '',
        date: item.date || '',
        eventType: item.eventType || 'MEETING',
        holidayType: item.holidayType || 'PUBLIC',
        examType: item.examType || 'MIDTERM',
        priority: item.priority || 'MEDIUM',
        academicYearId: selectedYear,
        termId: '',
      });
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: 'event',
      startDate: '',
      endDate: '',
      date: '',
      eventType: 'MEETING',
      holidayType: 'PUBLIC',
      examType: 'MIDTERM',
      priority: 'MEDIUM',
      academicYearId: selectedYear,
      termId: '',
    });
    setSelectedItem(null);
  };

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'event':
        return <Calendar className="w-4 h-4" />;
      case 'holiday':
        return <CalendarDays className="w-4 h-4" />;
      case 'exam':
        return <GraduationCap className="w-4 h-4" />;
      case 'academic-year':
        return <BookOpen className="w-4 h-4" />;
      case 'term':
        return <Clock className="w-4 h-4" />;
      default:
        return <Calendar className="w-4 h-4" />;
    }
  };

  const getItemColor = (type: string, priority?: string) => {
    if (priority === 'HIGH') return 'bg-red-100 border-red-300 text-red-800';
    if (priority === 'MEDIUM') return 'bg-yellow-100 border-yellow-300 text-yellow-800';
    if (priority === 'LOW') return 'bg-green-100 border-green-300 text-green-800';

    switch (type) {
      case 'event':
        return 'bg-blue-100 border-blue-300 text-blue-800';
      case 'holiday':
        return 'bg-purple-100 border-purple-300 text-purple-800';
      case 'exam':
        return 'bg-red-100 border-red-300 text-red-800';
      case 'academic-year':
        return 'bg-indigo-100 border-indigo-300 text-indigo-800';
      case 'term':
        return 'bg-teal-100 border-teal-300 text-teal-800';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const canModify = userRole === 'ADMIN' || userRole === 'TEACHER';

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="w-6 h-6" />
            Academic Calendar
          </h1>
          <p className="text-gray-600">Manage academic events, holidays, and examinations</p>
        </div>
        {canModify && (
          <button
            onClick={() => openModal('create')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Event
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-800 hover:text-red-900"
          >
            ×
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Academic Year
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2"
            >
              {academicYears.map(year => (
                <option key={year.id} value={year.id}>
                  {year.name} {year.isActive && '(Active)'}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Month
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="border border-gray-300 rounded-md px-3 py-2"
            >
              {months.map((month, index) => (
                <option key={index} value={index}>
                  {month}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="all">All Types</option>
              <option value="event">Events</option>
              <option value="holiday">Holidays</option>
              <option value="exam">Exams</option>
              <option value="term">Terms</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              View
            </label>
            <div className="flex border border-gray-300 rounded-md">
              {(['month', 'week', 'list'] as const).map((view) => (
                <button
                  key={view}
                  onClick={() => setSelectedView(view)}
                  className={`px-3 py-2 text-sm ${
                    selectedView === view
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {view.charAt(0).toUpperCase() + view.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Items */}
      <div className="grid gap-4">
        {calendarItems.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No calendar items</h3>
            <p className="text-gray-500">No events, holidays, or exams found for the selected period.</p>
          </div>
        ) : (
          calendarItems.map((item) => (
            <div
              key={item.id}
              className={`bg-white rounded-lg shadow-sm border p-4 ${getItemColor(item.type, item.priority)}`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getItemIcon(item.type)}
                    <h3 className="font-medium text-lg">{item.title}</h3>
                    <span className="text-xs px-2 py-1 bg-white bg-opacity-50 rounded-full">
                      {item.type.replace('-', ' ').toUpperCase()}
                    </span>
                    {item.priority && (
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        item.priority === 'HIGH' ? 'bg-red-200 text-red-800' :
                        item.priority === 'MEDIUM' ? 'bg-yellow-200 text-yellow-800' :
                        'bg-green-200 text-green-800'
                      }`}>
                        {item.priority}
                      </span>
                    )}
                  </div>
                  <p className="text-sm mb-2">{item.description}</p>
                  <div className="flex items-center gap-4 text-sm">
                    {item.date && (
                      <span className="flex items-center gap-1">
                        <CalendarDays className="w-4 h-4" />
                        {formatDate(item.date)}
                      </span>
                    )}
                    {item.startDate && item.endDate && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {formatDate(item.startDate)} - {formatDate(item.endDate)}
                      </span>
                    )}
                    {item.status && (
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {item.status}
                      </span>
                    )}
                  </div>
                </div>
                {canModify && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => openModal('edit', item)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal for Create/Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">
              {modalType === 'create' ? 'Create' : modalType === 'edit' ? 'Edit' : 'View'} Calendar Item
            </h2>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              modalType === 'create' ? handleCreateItem() : handleUpdateItem();
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    disabled={modalType === 'edit'}
                  >
                    <option value="event">Event</option>
                    <option value="holiday">Holiday</option>
                    <option value="exam">Exam</option>
                    <option value="term">Term</option>
                    <option value="academic-year">Academic Year</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    rows={3}
                  />
                </div>

                {formData.type === 'holiday' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      required
                    />
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                      />
                    </div>
                  </>
                )}

                {formData.type === 'event' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Event Type
                      </label>
                      <select
                        value={formData.eventType}
                        onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                      >
                        <option value="MEETING">Meeting</option>
                        <option value="WORKSHOP">Workshop</option>
                        <option value="CEREMONY">Ceremony</option>
                        <option value="SPORTS">Sports</option>
                        <option value="CULTURAL">Cultural</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Priority
                      </label>
                      <select
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                      >
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                      </select>
                    </div>
                  </>
                )}

                {formData.type === 'holiday' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Holiday Type
                    </label>
                    <select
                      value={formData.holidayType}
                      onChange={(e) => setFormData({ ...formData, holidayType: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="PUBLIC">Public Holiday</option>
                      <option value="RELIGIOUS">Religious Holiday</option>
                      <option value="SCHOOL">School Holiday</option>
                      <option value="VACATION">Vacation</option>
                    </select>
                  </div>
                )}

                {formData.type === 'exam' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Exam Type
                    </label>
                    <select
                      value={formData.examType}
                      onChange={(e) => setFormData({ ...formData, examType: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="MIDTERM">Midterm</option>
                      <option value="FINAL">Final</option>
                      <option value="QUIZ">Quiz</option>
                      <option value="ASSIGNMENT">Assignment</option>
                      <option value="PROJECT">Project</option>
                      <option value="PRACTICAL">Practical</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                {modalType !== 'view' && (
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    {modalType === 'create' ? 'Create' : 'Update'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AcademicCalendar;