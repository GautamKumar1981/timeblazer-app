import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import type { SlotInfo } from 'react-big-calendar';
import type { AppDispatch, RootState } from '../store/store';
import {
  fetchTimeboxes,
  createTimebox,
  updateTimebox,
  deleteTimebox,
} from '../store/slices/timeboxSlice';
import TimeboxCalendar from '../components/Calendar/TimeboxCalendar';
import Modal from '../components/Common/Modal';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import type { Timebox, TimeboxCategory, TimeboxStatus } from '../types';

const CATEGORIES: TimeboxCategory[] = ['Work', 'Meetings', 'Breaks', 'Learning', 'Personal'];
const CATEGORY_FILTERS = ['All', ...CATEGORIES] as const;

type CategoryFilter = (typeof CATEGORY_FILTERS)[number];

interface TimeboxForm {
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  category: TimeboxCategory;
  color: string;
  estimatedDuration: number;
  notes: string;
}

const CATEGORY_COLORS: Record<TimeboxCategory, string> = {
  Work: '#2563eb',
  Meetings: '#ef4444',
  Breaks: '#facc15',
  Learning: '#22c55e',
  Personal: '#a855f7',
};

const defaultForm = (): TimeboxForm => ({
  title: '',
  description: '',
  startTime: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
  endTime: format(new Date(Date.now() + 3600000), "yyyy-MM-dd'T'HH:mm"),
  category: 'Work',
  color: CATEGORY_COLORS['Work'],
  estimatedDuration: 60,
  notes: '',
});

const CalendarPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { timeboxes, isLoading } = useSelector((state: RootState) => state.timebox);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<TimeboxForm>(defaultForm());
  const [selectedTimebox, setSelectedTimebox] = useState<Timebox | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('All');

  useEffect(() => {
    dispatch(fetchTimeboxes());
  }, [dispatch]);

  const filteredTimeboxes =
    categoryFilter === 'All'
      ? timeboxes
      : timeboxes.filter((tb) => tb.category === categoryFilter);

  const handleSlotClick = (slotInfo: SlotInfo) => {
    const start = slotInfo.start as Date;
    const end = slotInfo.end as Date;
    setFormData({
      ...defaultForm(),
      startTime: format(start, "yyyy-MM-dd'T'HH:mm"),
      endTime: format(end, "yyyy-MM-dd'T'HH:mm"),
      estimatedDuration: Math.round((end.getTime() - start.getTime()) / 60000),
    });
    setEditingId(null);
    setIsModalOpen(true);
  };

  const handleEventClick = (tb: Timebox) => {
    setSelectedTimebox(tb);
    setFormData({
      title: tb.title,
      description: tb.description ?? '',
      startTime: format(new Date(tb.startTime), "yyyy-MM-dd'T'HH:mm"),
      endTime: format(new Date(tb.endTime), "yyyy-MM-dd'T'HH:mm"),
      category: tb.category,
      color: tb.color,
      estimatedDuration: tb.estimatedDuration,
      notes: tb.notes ?? '',
    });
    setEditingId(tb.id);
    setIsModalOpen(true);
  };

  const handleEventDrop = ({
    event,
    start,
    end,
  }: {
    event: { resource: Timebox };
    start: Date;
    end: Date;
  }) => {
    dispatch(
      updateTimebox({
        id: event.resource.id,
        data: {
          startTime: start.toISOString(),
          endTime: end.toISOString(),
          estimatedDuration: Math.round((end.getTime() - start.getTime()) / 60000),
        },
      })
    )
      .unwrap()
      .then(() => toast.success('Timebox rescheduled'))
      .catch((err: string) => toast.error(err));
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'estimatedDuration' ? parseInt(value) || 0 : value,
      ...(name === 'category' ? { color: CATEGORY_COLORS[value as TimeboxCategory] } : {}),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }

    const payload: Partial<Timebox> = {
      title: formData.title,
      description: formData.description,
      startTime: new Date(formData.startTime).toISOString(),
      endTime: new Date(formData.endTime).toISOString(),
      category: formData.category,
      color: formData.color,
      estimatedDuration: formData.estimatedDuration,
      notes: formData.notes,
    };

    try {
      if (editingId) {
        await dispatch(updateTimebox({ id: editingId, data: payload })).unwrap();
        toast.success('Timebox updated!');
      } else {
        await dispatch(createTimebox({ ...payload, status: 'not_started' })).unwrap();
        toast.success('Timebox created!');
      }
      setIsModalOpen(false);
      setFormData(defaultForm());
      setEditingId(null);
    } catch (err) {
      toast.error(err as string);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this timebox?')) return;
    try {
      await dispatch(deleteTimebox(id)).unwrap();
      toast.success('Timebox deleted');
      setIsModalOpen(false);
    } catch (err) {
      toast.error(err as string);
    }
  };

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      {/* Filter bar */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm text-gray-500 dark:text-gray-400 mr-1">Filter:</span>
        {CATEGORY_FILTERS.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`text-sm py-1.5 px-3 rounded-full font-medium transition-colors ${
              categoryFilter === cat
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {cat}
          </button>
        ))}
        <button
          onClick={() => {
            setFormData(defaultForm());
            setEditingId(null);
            setIsModalOpen(true);
          }}
          className="ml-auto btn-primary text-sm"
        >
          + New Timebox
        </button>
      </div>

      {/* Calendar */}
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div className="flex-1 min-h-0" style={{ height: 'calc(100vh - 180px)' }}>
          <TimeboxCalendar
            timeboxes={filteredTimeboxes}
            onEventClick={handleEventClick}
            onSlotClick={handleSlotClick}
            onEventDrop={handleEventDrop}
          />
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingId(null);
          setSelectedTimebox(null);
        }}
        title={editingId ? 'Edit Timebox' : 'New Timebox'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleFormChange}
              placeholder="Timebox title"
              required
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleFormChange}
              placeholder="Optional description..."
              rows={2}
              className="input-field resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Start Time *
              </label>
              <input
                type="datetime-local"
                name="startTime"
                value={formData.startTime}
                onChange={handleFormChange}
                required
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                End Time *
              </label>
              <input
                type="datetime-local"
                name="endTime"
                value={formData.endTime}
                onChange={handleFormChange}
                required
                className="input-field"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleFormChange}
                className="input-field"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Est. Duration (min)
              </label>
              <input
                type="number"
                name="estimatedDuration"
                value={formData.estimatedDuration}
                onChange={handleFormChange}
                min={5}
                max={480}
                className="input-field"
              />
            </div>
          </div>

          {/* Color swatches */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Color
            </label>
            <div className="flex gap-2">
              {Object.values(CATEGORY_COLORS).map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, color }))}
                  className="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110"
                  style={{
                    backgroundColor: color,
                    borderColor: formData.color === color ? '#111' : 'transparent',
                  }}
                />
              ))}
              <input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData((prev) => ({ ...prev, color: e.target.value }))}
                className="w-7 h-7 rounded-full border-2 border-gray-300 cursor-pointer"
                title="Custom color"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleFormChange}
              placeholder="Any notes..."
              rows={2}
              className="input-field resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary flex-1">
              {editingId ? 'Update Timebox' : 'Create Timebox'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => handleDelete(editingId)}
                className="btn-danger"
              >
                Delete
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                setEditingId(null);
              }}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CalendarPage;
