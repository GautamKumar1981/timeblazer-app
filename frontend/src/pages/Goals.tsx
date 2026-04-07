import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getDayOfYear, getDaysInYear } from 'date-fns';
import { RootState } from '../store/store';
import { setGoals, addGoal, updateGoal, removeGoal, Goal } from '../store/slices/goalsSlice';
import { api } from '../services/api';
import GoalCard from '../components/Goals/GoalCard';
import styles from './Goals.module.css';

const emptyForm = {
  title: '',
  description: '',
  target_date: '',
  priority: 'medium' as Goal['priority'],
};

type FilterType = 'all' | 'active' | 'completed';

function Goals() {
  const dispatch = useDispatch();
  const { goals, isLoading } = useSelector((state: RootState) => state.goals);
  const [filter, setFilter] = useState<FilterType>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.goals.getGoals();
        dispatch(setGoals(res.data.goals || res.data));
      } catch {}
    };
    fetch();
  }, [dispatch]);

  const yearProgress = Math.round((getDayOfYear(new Date()) / getDaysInYear(new Date())) * 100);

  const filtered = goals.filter((g) => {
    if (filter === 'active') return g.status === 'active';
    if (filter === 'completed') return g.status === 'completed';
    return true;
  });

  const openCreate = () => {
    setForm(emptyForm);
    setEditingGoal(null);
    setError(null);
    setShowModal(true);
  };

  const openEdit = (goal: Goal) => {
    setForm({
      title: goal.title,
      description: goal.description,
      target_date: goal.target_date.slice(0, 10),
      priority: goal.priority,
    });
    setEditingGoal(goal);
    setError(null);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    try {
      if (editingGoal) {
        const res = await api.goals.updateGoal(editingGoal.id, form);
        dispatch(updateGoal(res.data));
      } else {
        const res = await api.goals.createGoal(form);
        dispatch(addGoal(res.data));
      }
      setShowModal(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save goal.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.goals.deleteGoal(id);
      dispatch(removeGoal(id));
    } catch {}
  };

  const handleProgressUpdate = async (id: string, progress: number) => {
    try {
      const res = await api.goals.updateProgress(id, progress);
      dispatch(updateGoal(res.data));
    } catch {}
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>🎯 Goals</h1>
        <button className="btn btn-primary" onClick={openCreate}>+ Add Goal</button>
      </div>

      <div className={styles.yearProgress}>
        <div className={styles.yearLabel}>
          <span>Year Progress</span>
          <span>{yearProgress}%</span>
        </div>
        <div className={styles.yearBar}>
          <div className={styles.yearFill} style={{ width: `${yearProgress}%` }} />
        </div>
        <p className={styles.yearHint}>Day {getDayOfYear(new Date())} of {getDaysInYear(new Date())}</p>
      </div>

      <div className={styles.filters}>
        {(['all', 'active', 'completed'] as FilterType[]).map((f) => (
          <button
            key={f}
            className={`${styles.filterBtn} ${filter === f ? styles.filterActive : ''}`}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="loading-spinner">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className={styles.empty}>
          {filter === 'all' ? 'No goals yet. Add your first goal!' : `No ${filter} goals.`}
        </div>
      ) : (
        <div className={styles.grid}>
          {filtered.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onEdit={openEdit}
              onDelete={handleDelete}
              onProgressUpdate={handleProgressUpdate}
            />
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingGoal ? 'Edit Goal' : 'New Goal'}</h2>
              <button onClick={() => setShowModal(false)}>✕</button>
            </div>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                  placeholder="Goal title"
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  placeholder="Describe your goal"
                />
              </div>
              <div className="form-group">
                <label>Target Date</label>
                <input
                  type="date"
                  value={form.target_date}
                  onChange={(e) => setForm({ ...form, target_date: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Priority</label>
                <select
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value as Goal['priority'] })}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div className={styles.modalActions}>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Goals;
