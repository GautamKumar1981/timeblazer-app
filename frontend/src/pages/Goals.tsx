import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/store';
import { fetchGoals, createGoal, updateGoal, deleteGoal } from '../store/slices/goalsSlice';
import Header from '../components/Common/Header';
import Sidebar from '../components/Common/Sidebar';
import GoalCard from '../components/Goals/GoalCard';
import { Goal } from '../store/slices/goalsSlice';

const card: React.CSSProperties = {
  backgroundColor: '#16152e', borderRadius: 12, padding: 22,
  border: '1px solid rgba(139,92,246,0.2)',
};
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '9px 12px', backgroundColor: '#1a1830',
  border: '1px solid rgba(139,92,246,0.25)', borderRadius: 7,
  fontSize: 14, color: '#e5e7eb', boxSizing: 'border-box', marginBottom: 10,
};
const label: React.CSSProperties = { fontSize: 12, color: '#9ca3af', display: 'block', marginBottom: 4 };

const Goals: React.FC = () => {
  const dispatch = useAppDispatch();
  const { goals, loading } = useAppSelector((state) => state.goals);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<Goal | null>(null);
  const [form, setForm] = useState({ title: '', description: '', deadline: '', targetValue: 100, currentValue: 0, category: 'personal' });

  useEffect(() => { dispatch(fetchGoals()); }, [dispatch]);

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

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0f0e1a' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header />
        <main style={{ flex: 1, padding: 24, overflowY: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#e9d5ff' }}>🎯 Goals</h2>
              <p style={{ color: '#6b7280', fontSize: 13, margin: '4px 0 0' }}>Set and track your intentions aligned with your Bazi energy.</p>
            </div>
            <button
              onClick={() => { setShowForm(!showForm); setEditTarget(null); setForm({ title: '', description: '', deadline: '', targetValue: 100, currentValue: 0, category: 'personal' }); }}
              style={{ backgroundColor: '#7c3aed', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 18px', cursor: 'pointer', fontWeight: 600, fontSize: 14 }}
            >
              + New Goal
            </button>
          </div>

          {showForm && (
            <div style={{ ...card, marginBottom: 20 }}>
              <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 600, color: '#c4b5fd' }}>{editTarget ? 'Edit Goal' : 'New Goal'}</h3>
              <form onSubmit={handleSubmit}>
                <input style={inputStyle} placeholder="Goal title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
                <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: 70 } as React.CSSProperties} placeholder="Description (optional)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {[
                    { key: 'deadline', label: 'Deadline', type: 'date', flex: 2 },
                  ].map(f => (
                    <div key={f.key} style={{ flex: f.flex, minWidth: 140 }}>
                      <label style={label}>{f.label}</label>
                      <input style={inputStyle} type={f.type} value={(form as any)[f.key]} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} />
                    </div>
                  ))}
                  <div style={{ flex: 2, minWidth: 140 }}>
                    <label style={label}>Category</label>
                    <select style={inputStyle} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                      {['personal', 'work', 'health', 'learning', 'financial'].map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div style={{ flex: 1, minWidth: 110 }}>
                    <label style={label}>Target</label>
                    <input style={inputStyle} type="number" min={1} value={form.targetValue} onChange={(e) => setForm({ ...form, targetValue: Number(e.target.value) })} />
                  </div>
                  <div style={{ flex: 1, minWidth: 110 }}>
                    <label style={label}>Progress</label>
                    <input style={inputStyle} type="number" min={0} value={form.currentValue} onChange={(e) => setForm({ ...form, currentValue: Number(e.target.value) })} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
                  <button type="submit" style={{ padding: '9px 20px', backgroundColor: '#7c3aed', color: '#fff', border: 'none', borderRadius: 7, cursor: 'pointer', fontWeight: 600 }}>
                    {editTarget ? 'Update' : 'Create'}
                  </button>
                  <button type="button" onClick={() => { setShowForm(false); setEditTarget(null); }} style={{ padding: '9px 20px', backgroundColor: 'rgba(255,255,255,0.07)', color: '#9ca3af', border: 'none', borderRadius: 7, cursor: 'pointer' }}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {loading ? (
            <p style={{ color: '#6b7280' }}>Loading goals…</p>
          ) : goals.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#4b5563' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🎯</div>
              <p style={{ color: '#6b7280' }}>No goals yet. Set your first intention.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
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
