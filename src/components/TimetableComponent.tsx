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
  const periods = ['1', '2', '3', '4', '5', '6', '7'];

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
                  <th className="timetable-cell timetable-header">Day/Period</th>
                  {periods.map((period) => (
                    <th key={period} className="timetable-cell timetable-header">
                      Period {period}
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
                      const subject = isEditing
                        ? editedSchedule?.[day]?.[period] || ''
                        : timetable.schedule?.[day]?.[period] || '';

                      return (
                        <td
                          key={`${day}-${period}`}
                          className={`timetable-cell ${
                            isEditing ? 'timetable-cell-editable p-0' : ''
                          }`}
                        >
                          {isEditing ? (
                            <input
                              type="text"
                              value={subject}
                              onChange={(e) => handleCellChange(day, period, e.target.value)}
                              className="w-full h-full px-3 py-3 text-center border-0 focus:ring-2 focus:ring-amrita-blue dark:bg-gray-800"
                              placeholder="Subject"
                            />
                          ) : (
                            <div className="font-medium">{subject}</div>
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
