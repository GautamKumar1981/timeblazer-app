import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import type { AppDispatch, RootState } from '../store/store';
import { fetchGoals, createGoal, updateGoal, deleteGoal } from '../store/slices/goalsSlice';
import GoalCard from '../components/Goals/GoalCard';
import Modal from '../components/Common/Modal';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import type { Goal, GoalPriority, GoalStatus, Milestone } from '../types';
import { PlusIcon } from '@heroicons/react/24/outline';

type PriorityFilter = 'all' | GoalPriority;
type StatusFilter = GoalStatus | 'all';

interface GoalForm {
  title: string;
  description: string;
  targetDate: string;
  priority: GoalPriority;
  status: GoalStatus;
  milestones: Array<{ id: string; title: string; completed: boolean }>;
}

const defaultForm = (): GoalForm => ({
  title: '',
  description: '',
  targetDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
  priority: 'medium',
  status: 'active',
  milestones: [],
});

const Goals: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { goals, isLoading } = useSelector((state: RootState) => state.goals);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<GoalForm>(defaultForm());
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('active');
  const [newMilestone, setNewMilestone] = useState('');

  useEffect(() => {
    dispatch(fetchGoals());
  }, [dispatch]);

  const filteredGoals = goals
    .filter((g) => (priorityFilter === 'all' ? true : g.priority === priorityFilter))
    .filter((g) => (statusFilter === 'all' ? true : g.status === statusFilter))
    .sort((a, b) => a.daysRemaining - b.daysRemaining);

  const handleEdit = (goal: Goal) => {
    setFormData({
      title: goal.title,
      description: goal.description ?? '',
      targetDate: goal.targetDate.split('T')[0],
      priority: goal.priority,
      status: goal.status,
      milestones: goal.milestones ?? [],
    });
    setEditingId(goal.id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this goal?')) return;
    try {
      await dispatch(deleteGoal(id)).unwrap();
      toast.success('Goal deleted');
    } catch (err) {
      toast.error(err as string);
    }
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const addMilestone = () => {
    const trimmed = newMilestone.trim();
    if (!trimmed) return;
    setFormData((prev) => ({
      ...prev,
      milestones: [
        ...prev.milestones,
        { id: `ms-${Date.now()}`, title: trimmed, completed: false },
      ],
    }));
    setNewMilestone('');
  };

  const removeMilestone = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      milestones: prev.milestones.filter((m) => m.id !== id),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }

    const daysRemaining = Math.ceil(
      (new Date(formData.targetDate).getTime() - Date.now()) / 86400000
    );

    const payload: Partial<Goal> = {
      title: formData.title,
      description: formData.description,
      targetDate: formData.targetDate,
      priority: formData.priority,
      status: formData.status,
      milestones: formData.milestones,
      daysRemaining,
    };

    try {
      if (editingId) {
        await dispatch(updateGoal({ id: editingId, data: payload })).unwrap();
        toast.success('Goal updated!');
      } else {
        await dispatch(createGoal(payload)).unwrap();
        toast.success('Goal created!');
      }
      setIsModalOpen(false);
      setFormData(defaultForm());
      setEditingId(null);
    } catch (err) {
      toast.error(err as string);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">🎯 Goals</h1>
        <button
          onClick={() => {
            setFormData(defaultForm());
            setEditingId(null);
            setIsModalOpen(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <PlusIcon className="h-4 w-4" />
          Add Goal
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        {/* Priority filter */}
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          {(['all', 'high', 'medium', 'low'] as PriorityFilter[]).map((p) => (
            <button
              key={p}
              onClick={() => setPriorityFilter(p)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium capitalize transition-colors ${
                priorityFilter === p
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
        {/* Status filter */}
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          {(['all', 'active', 'completed', 'cancelled'] as StatusFilter[]).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium capitalize transition-colors ${
                statusFilter === s
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : filteredGoals.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-4">🎯</div>
          <p className="text-lg font-medium mb-2">No goals yet</p>
          <p className="text-sm mb-4">Create your first goal to get started!</p>
          <button
            onClick={() => {
              setFormData(defaultForm());
              setEditingId(null);
              setIsModalOpen(true);
            }}
            className="btn-primary"
          >
            Create your first goal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredGoals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} onEdit={handleEdit} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingId(null);
        }}
        title={editingId ? 'Edit Goal' : 'New Goal'}
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
              placeholder="Goal title"
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
              placeholder="Describe your goal..."
              rows={2}
              className="input-field resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Target Date *
              </label>
              <input
                type="date"
                name="targetDate"
                value={formData.targetDate}
                onChange={handleFormChange}
                required
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Priority
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleFormChange}
                className="input-field"
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleFormChange}
              className="input-field"
            >
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Milestones */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Milestones
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newMilestone}
                onChange={(e) => setNewMilestone(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addMilestone())}
                placeholder="Add milestone..."
                className="input-field text-sm"
              />
              <button type="button" onClick={addMilestone} className="btn-secondary text-sm py-1.5 px-3">
                Add
              </button>
            </div>
            {formData.milestones.length > 0 && (
              <ul className="space-y-1">
                {formData.milestones.map((ms) => (
                  <li key={ms.id} className="flex items-center gap-2 text-sm">
                    <span className="flex-1 text-gray-700 dark:text-gray-300">{ms.title}</span>
                    <button
                      type="button"
                      onClick={() => removeMilestone(ms.id)}
                      className="text-red-400 hover:text-red-600 text-xs"
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary flex-1">
              {editingId ? 'Update Goal' : 'Create Goal'}
            </button>
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

export default Goals;
