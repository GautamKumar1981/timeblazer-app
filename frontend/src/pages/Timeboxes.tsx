import React, { useEffect, useState } from 'react';
import { Dialog } from '@headlessui/react';
import { PlusIcon, PencilIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchTimeboxes, createTimebox, updateTimebox, deleteTimebox } from '../store/timeboxSlice';
import { Timebox } from '../types';
import toast from 'react-hot-toast';

type StatusFilter = 'all' | Timebox['status'];

interface TimeboxFormData {
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  status: Timebox['status'];
  priority: Timebox['priority'];
}

const defaultForm: TimeboxFormData = {
  title: '',
  description: '',
  start_time: '',
  end_time: '',
  status: 'pending',
  priority: 'medium',
};

const statusColors: Record<Timebox['status'], string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const priorityColors: Record<Timebox['priority'], string> = {
  low: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-red-100 text-red-700',
};

const Timeboxes: React.FC = () => {
  const dispatch = useAppDispatch();
  const { timeboxes, isLoading } = useAppSelector((state) => state.timeboxes);

  const [filter, setFilter] = useState<StatusFilter>('all');
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<TimeboxFormData>(defaultForm);

  useEffect(() => {
    dispatch(fetchTimeboxes());
  }, [dispatch]);

  const filtered = timeboxes
    .filter((t) => filter === 'all' || t.status === filter)
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

  const openCreate = () => {
    setEditingId(null);
    setForm(defaultForm);
    setIsOpen(true);
  };

  const openEdit = (tb: Timebox) => {
    setEditingId(tb.id);
    setForm({
      title: tb.title,
      description: tb.description ?? '',
      start_time: tb.start_time.slice(0, 16),
      end_time: tb.end_time.slice(0, 16),
      status: tb.status,
      priority: tb.priority,
    });
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      description: form.description || undefined,
    };
    if (editingId !== null) {
      const result = await dispatch(updateTimebox({ id: editingId, data: payload }));
      if (updateTimebox.fulfilled.match(result)) {
        toast.success('Timebox updated!');
        setIsOpen(false);
      } else {
        toast.error('Failed to update timebox');
      }
    } else {
      const result = await dispatch(createTimebox(payload));
      if (createTimebox.fulfilled.match(result)) {
        toast.success('Timebox created!');
        setIsOpen(false);
      } else {
        toast.error('Failed to create timebox');
      }
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this timebox?')) return;
    const result = await dispatch(deleteTimebox(id));
    if (deleteTimebox.fulfilled.match(result)) {
      toast.success('Timebox deleted');
    } else {
      toast.error('Failed to delete timebox');
    }
  };

  const filterButtons: { label: string; value: StatusFilter }[] = [
    { label: 'All', value: 'all' },
    { label: 'Pending', value: 'pending' },
    { label: 'In Progress', value: 'in_progress' },
    { label: 'Completed', value: 'completed' },
    { label: 'Cancelled', value: 'cancelled' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-900">Timeboxes</h2>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
          New Timebox
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {filterButtons.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === value
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-400">Loading timeboxes...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400">No timeboxes found.</div>
      ) : (
        <div className="grid gap-4">
          {filtered.map((tb) => (
            <div key={tb.id} className="bg-white rounded-2xl shadow-sm p-6 flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="text-lg font-semibold text-gray-900">{tb.title}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[tb.status]}`}>
                    {tb.status.replace('_', ' ')}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityColors[tb.priority]}`}>
                    {tb.priority}
                  </span>
                </div>
                {tb.description && (
                  <p className="text-sm text-gray-500">{tb.description}</p>
                )}
                <div className="text-xs text-gray-400 flex gap-4">
                  <span>Start: {new Date(tb.start_time).toLocaleString()}</span>
                  <span>End: {new Date(tb.end_time).toLocaleString()}</span>
                </div>
              </div>
              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => openEdit(tb)}
                  className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  title="Edit"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(tb.id)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <Dialog.Title className="text-xl font-semibold text-gray-900">
                {editingId ? 'Edit Timebox' : 'New Timebox'}
              </Dialog.Title>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={form.start_time}
                    onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={form.end_time}
                    onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as Timebox['status'] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value as Timebox['priority'] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                >
                  {editingId ? 'Save Changes' : 'Create'}
                </button>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
};

export default Timeboxes;
