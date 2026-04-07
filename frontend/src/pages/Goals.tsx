import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/store';
import { fetchGoals, createGoal, updateGoal, deleteGoal } from '../store/slices/goalsSlice';
import Header from '../components/Common/Header';
import Sidebar from '../components/Common/Sidebar';
import GoalCard from '../components/Goals/GoalCard';
import { Goal } from '../store/slices/goalsSlice';

const Goals: React.FC = () => {
  const dispatch = useAppDispatch();
  const { goals, loading } = useAppSelector((state) => state.goals);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<Goal | null>(null);
  const [form, setForm] = useState({ title: '', description: '', deadline: '', targetValue: 100, currentValue: 0, category: 'personal' });

  useEffect(() => {
    dispatch(fetchGoals());
  }, [dispatch]);

  const handleEdit = (goal: Goal) => {
    setEditTarget(goal);
    setForm({
      title: goal.title,
      description: goal.description || '',
      deadline: goal.deadline ? goal.deadline.split('T')[0] : '',
      targetValue: goal.targetValue,
      currentValue: goal.currentValue,
      category: goal.category,
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this goal?')) dispatch(deleteGoal(id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editTarget) {
      await dispatch(updateGoal({ id: editTarget._id, data: form }));
    } else {
      await dispatch(createGoal(form));
    }
    setShowForm(false);
    setEditTarget(null);
    setForm({ title: '', description: '', deadline: '', targetValue: 100, currentValue: 0, category: 'personal' });
  };

  const inputStyle: React.CSSProperties = { width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box', marginBottom: '10px' };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header />
        <main style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 700, color: '#1f2937' }}>🎯 Goals</h2>
            <button
              onClick={() => { setShowForm(!showForm); setEditTarget(null); setForm({ title: '', description: '', deadline: '', targetValue: 100, currentValue: 0, category: 'personal' }); }}
              style={{ backgroundColor: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', padding: '9px 18px', cursor: 'pointer', fontWeight: 600, fontSize: '14px' }}
            >
              + New Goal
            </button>
          </div>

          {showForm && (
            <div style={{ backgroundColor: '#fff', borderRadius: '10px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)', marginBottom: '20px' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 600 }}>{editTarget ? 'Edit Goal' : 'New Goal'}</h3>
              <form onSubmit={handleSubmit}>
                <input style={inputStyle} placeholder="Goal title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
                <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: '70px' } as React.CSSProperties} placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: '140px' }}>
                    <label style={{ fontSize: '12px', color: '#6b7280', display: 'block', marginBottom: '4px' }}>Deadline</label>
                    <input style={inputStyle} type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
                  </div>
                  <div style={{ flex: 1, minWidth: '140px' }}>
                    <label style={{ fontSize: '12px', color: '#6b7280', display: 'block', marginBottom: '4px' }}>Category</label>
                    <select style={inputStyle} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                      {['personal', 'work', 'health', 'learning', 'financial'].map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div style={{ flex: 1, minWidth: '120px' }}>
                    <label style={{ fontSize: '12px', color: '#6b7280', display: 'block', marginBottom: '4px' }}>Target</label>
                    <input style={inputStyle} type="number" min={1} value={form.targetValue} onChange={(e) => setForm({ ...form, targetValue: Number(e.target.value) })} />
                  </div>
                  <div style={{ flex: 1, minWidth: '120px' }}>
                    <label style={{ fontSize: '12px', color: '#6b7280', display: 'block', marginBottom: '4px' }}>Current Progress</label>
                    <input style={inputStyle} type="number" min={0} value={form.currentValue} onChange={(e) => setForm({ ...form, currentValue: Number(e.target.value) })} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                  <button type="submit" style={{ padding: '9px 20px', backgroundColor: '#4f46e5', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>
                    {editTarget ? 'Update' : 'Create'}
                  </button>
                  <button type="button" onClick={() => { setShowForm(false); setEditTarget(null); }} style={{ padding: '9px 20px', backgroundColor: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {loading ? (
            <p style={{ color: '#9ca3af' }}>Loading goals...</p>
          ) : goals.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#9ca3af' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>🎯</div>
              <p>No goals yet. Set your first goal!</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
              {goals.map((goal) => (
                <GoalCard key={goal._id} goal={goal} onEdit={handleEdit} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Goals;
