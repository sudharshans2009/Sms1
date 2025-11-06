'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

interface TimetableProps {
  userRole: 'admin' | 'teacher' | 'student' | 'driver';
}

export default function TimetableComponent({ userRole }: TimetableProps) {
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [timetable, setTimetable] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedSchedule, setEditedSchedule] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const classes = ['LKG', 'UKG', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
  const sections = ['A', 'B', 'C', 'D'];
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const periods = [
    { id: '1', label: 'Period 1', time: '8:45 - 9:25' },
    { id: '2', label: 'Period 2', time: '9:25 - 10:05' },
    { id: 'break1', label: 'Break', time: '10:05 - 10:15', isBreak: true },
    { id: '3', label: 'Period 3', time: '10:15 - 10:55' },
    { id: '4', label: 'Period 4', time: '10:55 - 11:35' },
    { id: '5', label: 'Period 5', time: '11:35 - 12:15' },
    { id: 'lunch', label: 'Lunch', time: '12:15 - 12:55', isBreak: true },
    { id: '6', label: 'Period 6', time: '12:55 - 1:35' },
    { id: '7', label: 'Period 7', time: '1:35 - 2:15' },
    { id: 'break2', label: 'Break', time: '2:15 - 2:25', isBreak: true },
    { id: '8', label: 'Period 8', time: '2:25 - 3:05' },
    { id: '9', label: 'Period 9', time: '3:05 - 3:45' },
  ];

  useEffect(() => {
    if (selectedClass && selectedSection) {
      loadTimetable();
    }
  }, [selectedClass, selectedSection]);

  const loadTimetable = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/timetable?class=${selectedClass}&section=${selectedSection}`);
      if (response.data.success) {
        setTimetable(response.data.data);
        setEditedSchedule(response.data.data?.schedule || {});
      }
    } catch (error) {
      console.error('Error loading timetable:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditedSchedule({ ...timetable.schedule });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedSchedule(timetable.schedule);
  };

  const handleCellChange = (day: string, period: string, value: string) => {
    setEditedSchedule((prev: any) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [period]: value
      }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const response = await axios.put('/api/timetable', {
        class: selectedClass,
        section: selectedSection,
        schedule: editedSchedule,
        updatedBy: user.name || 'admin'
      });

      if (response.data.success) {
        setTimetable(response.data.data);
        setIsEditing(false);
        alert('Timetable updated successfully!');
      }
    } catch (error) {
      console.error('Error saving timetable:', error);
      alert('Failed to save timetable');
    } finally {
      setSaving(false);
    }
  };

  const canEdit = userRole === 'admin';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Timetable Management
        </h2>
        {canEdit && timetable && !isEditing && (
          <button onClick={handleEdit} className="btn-primary">
            Edit Timetable
          </button>
        )}
        {isEditing && (
          <div className="space-x-2">
            <button onClick={handleSave} disabled={saving} className="btn-primary">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button onClick={handleCancelEdit} className="btn-secondary">
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Class and Section Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Select Class
          </label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="input-field"
            disabled={isEditing}
          >
            <option value="">Select Class</option>
            {classes.map((cls) => (
              <option key={cls} value={cls}>
                {cls === 'LKG' || cls === 'UKG' ? cls : `Class ${cls}`}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Select Section
          </label>
          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="input-field"
            disabled={isEditing}
          >
            <option value="">Select Section</option>
            {sections.map((sec) => (
              <option key={sec} value={sec}>
                Section {sec}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Timetable Display */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amrita-blue"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading timetable...</p>
        </div>
      ) : timetable ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <div className="p-4 bg-amrita-blue text-white">
            <h3 className="text-xl font-semibold">
              Timetable for Class {selectedClass} - Section {selectedSection}
            </h3>
            {timetable.lastUpdated && (
              <p className="text-sm mt-1 opacity-90">
                Last updated: {new Date(timetable.lastUpdated).toLocaleString()} by {timetable.updatedBy}
              </p>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-700">
                  <th className="timetable-cell timetable-header">Day</th>
                  {periods.map((period) => (
                    <th 
                      key={period.id} 
                      className={`timetable-cell timetable-header ${period.isBreak ? 'bg-amber-100 dark:bg-amber-900/30' : ''}`}
                    >
                      <div className="font-bold">{period.label}</div>
                      <div className="text-xs font-normal opacity-75">{period.time}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {days.map((day) => (
                  <tr key={day}>
                    <td className="timetable-cell font-semibold bg-gray-50 dark:bg-gray-700">
                      {day}
                    </td>
                    {periods.map((period) => {
                      if (period.isBreak) {
                        return (
                          <td
                            key={`${day}-${period.id}`}
                            className="timetable-cell bg-amber-50 dark:bg-amber-900/20 text-center text-amber-700 dark:text-amber-300 font-medium"
                          >
                            {period.label}
                          </td>
                        );
                      }

                      const subject = isEditing
                        ? editedSchedule?.[day]?.[period.id] || ''
                        : timetable.schedule?.[day]?.[period.id] || '';

                      return (
                        <td
                          key={`${day}-${period.id}`}
                          className={`timetable-cell ${
                            isEditing ? 'timetable-cell-editable p-0' : ''
                          }`}
                        >
                          {isEditing ? (
                            <input
                              type="text"
                              value={subject}
                              onChange={(e) => handleCellChange(day, period.id, e.target.value)}
                              className="w-full h-full px-3 py-3 text-center border-0 focus:ring-2 focus:ring-amrita-blue dark:bg-gray-800"
                              placeholder="Subject"
                            />
                          ) : (
                            <div className="font-medium">{subject || '-'}</div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : selectedClass && selectedSection ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
          <p className="text-gray-600 dark:text-gray-400">
            No timetable found for this class-section combination.
          </p>
          {canEdit && (
            <button
              onClick={() => {
                setIsEditing(true);
                setEditedSchedule({});
              }}
              className="mt-4 btn-primary"
            >
              Create New Timetable
            </button>
          )}
        </div>
      ) : (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
          <p className="text-gray-600 dark:text-gray-400">
            Please select a class and section to view the timetable.
          </p>
        </div>
      )}
    </div>
  );
}
