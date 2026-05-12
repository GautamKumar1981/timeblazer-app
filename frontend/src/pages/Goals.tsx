import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/store';
import { fetchGoals, createGoal, updateGoal, deleteGoal } from '../store/slices/goalsSlice';
import { Goal } from '../store/slices/goalsSlice';
import Header from '../components/Common/Header';
import Sidebar from '../components/Common/Sidebar';
import { useIsMobile } from '../hooks/useIsMobile';

const ELEM_COLOR: Record<string, string> = {
  Wood: '#16a34a', Fire: '#dc2626', Earth: '#d97706', Metal: '#6b7280', Water: '#2563eb',
};
const ELEM_ICON: Record<string, string> = {
  Wood: '🌱', Fire: '🔥', Earth: '⛰️', Metal: '⚙️', Water: '💧',
};

// Which categories align with each element
const ELEM_CATEGORIES: Record<string, string[]> = {
  Wood:  ['learning', 'personal'],
  Fire:  ['work', 'personal'],
  Earth: ['health', 'financial'],
  Metal: ['work', 'financial'],
  Water: ['personal', 'learning'],
};

const CATEGORY_ELEM: Record<string, string> = {
  personal: 'Wood', work: 'Fire', health: 'Earth', learning: 'Water', financial: 'Metal',
};

const CATEGORIES = ['personal', 'work', 'health', 'learning', 'financial'] as const;
const CAT_ICON: Record<string, string> = {
  personal: '🧘', work: '💼', health: '💚', learning: '📚', financial: '💰',
};

const getDaysLeft = (deadline?: string): { label: string; overdue: boolean } | null => {
  if (!deadline) return null;
  const diff = Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return { label: 'Overdue', overdue: true };
  if (diff === 0) return { label: 'Due today', overdue: false };
  return { label: `${diff}d left`, overdue: false };
};

interface GoalCardInlineProps {
  goal: Goal;
  dmElem: string;
  onEdit: (g: Goal) => void;
  onDelete: (id: string) => void;
}

const GoalCardInline: React.FC<GoalCardInlineProps> = ({ goal, dmElem, onEdit, onDelete }) => {
  const catElem  = CATEGORY_ELEM[goal.category] ?? 'Metal';
  const catColor = ELEM_COLOR[catElem] ?? '#6b7280';
  const aligned  = (ELEM_CATEGORIES[dmElem] ?? []).includes(goal.category);
  const progress = goal.targetValue > 0 ? Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100)) : 0;
  const days     = getDaysLeft(goal.deadline);
  const done     = progress >= 100 || goal.status === 'completed';

  return (
    <div style={{
      backgroundColor: '#fff', borderRadius: 12,
      border: `1px solid ${aligned ? catColor + '44' : '#e8e3f8'}`,
      boxShadow: aligned ? `0 2px 10px ${catColor}18` : '0 1px 4px rgba(0,0,0,0.05)',
      overflow: 'hidden',
    }}>
      {/* Top colour stripe */}
      <div style={{ height: 4, backgroundColor: catColor, opacity: done ? 0.4 : 1 }} />

      <div style={{ padding: '14px 16px' }}>
        {/* Header row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <div style={{ flex: 1, minWidth: 0, marginRight: 8 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: done ? '#9ca3af' : '#1f2937', textDecoration: done ? 'line-through' : 'none', wordBreak: 'break-word' }}>
              {goal.title}
            </div>
            {goal.description && (
              <div style={{ fontSize: 12, color: '#6b7280', marginTop: 3, lineHeight: 1.4 }}>{goal.description}</div>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
            {aligned && (
              <span title={`Aligned with your ${dmElem} energy`} style={{ fontSize: 13 }}>{ELEM_ICON[dmElem]}</span>
            )}
            {days && (
              <span style={{
                fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 10,
                backgroundColor: days.overdue ? '#fee2e2' : '#f0fdf4',
                color: days.overdue ? '#dc2626' : '#15803d',
              }}>{days.label}</span>
            )}
          </div>
        </div>

        {/* Progress */}
        <div style={{ marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: 11, color: '#6b7280' }}>{goal.currentValue} / {goal.targetValue}</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: catColor }}>{progress}%</span>
          </div>
          <div style={{ height: 6, backgroundColor: '#f3f4f6', borderRadius: 3 }}>
            <div style={{ height: '100%', width: `${progress}%`, backgroundColor: catColor, borderRadius: 3, transition: 'width 0.4s ease' }} />
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ fontSize: 13 }}>{CAT_ICON[goal.category]}</span>
            <span style={{ fontSize: 11, color: catColor, fontWeight: 600, textTransform: 'capitalize' }}>{goal.category}</span>
            <span style={{ fontSize: 10, color: '#9ca3af' }}>· {ELEM_ICON[catElem]} {catElem}</span>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            <button onClick={() => onEdit(goal)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, padding: '2px 5px', color: '#6b7280' }} title="Edit">✏️</button>
            <button onClick={() => onDelete(goal._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, padding: '2px 5px', color: '#9ca3af' }} title="Delete">🗑️</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Goals: React.FC = () => {
  const dispatch  = useAppDispatch();
  const isMobile  = useIsMobile();
  const { goals, loading } = useAppSelector((state) => state.goals);
  const { today, chart }   = useAppSelector((s) => s.bazi);
  const dmElem  = today?.day_master?.element ?? (chart as any)?.day_master?.element ?? 'Water';
  const dmColor = ELEM_COLOR[dmElem] ?? '#7c3aed';
  const alignedCats = ELEM_CATEGORIES[dmElem] ?? [];

  const [showForm,   setShowForm]   = useState(false);
  const [editTarget, setEditTarget] = useState<Goal | null>(null);
  const [filter,     setFilter]     = useState<string>('all');
  const [form, setForm] = useState({
    title: '', description: '', deadline: '',
    targetValue: 100, currentValue: 0, category: 'personal',
  });

  useEffect(() => { dispatch(fetchGoals()); }, [dispatch]);

  const handleEdit = (goal: Goal) => {
    setEditTarget(goal);
    setForm({
      title: goal.title, description: goal.description || '',
      deadline: goal.deadline ? goal.deadline.split('T')[0] : '',
      targetValue: goal.targetValue, currentValue: goal.currentValue, category: goal.category,
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    setShowForm(false); setEditTarget(null);
    setForm({ title: '', description: '', deadline: '', targetValue: 100, currentValue: 0, category: 'personal' });
  };

  const filtered = filter === 'all' ? goals : goals.filter(g => g.category === filter);
  const active   = goals.filter(g => g.status !== 'completed' && (g.targetValue === 0 || g.currentValue < g.targetValue));
  const done     = goals.filter(g => g.status === 'completed' || g.currentValue >= g.targetValue);

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '9px 12px', backgroundColor: '#fff',
    border: '1px solid #e2d9f3', borderRadius: 7, fontSize: 14,
    color: '#1f2937', boxSizing: 'border-box', marginBottom: 10, outline: 'none',
  };
  const labelStyle: React.CSSProperties = { fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 4, fontWeight: 600 };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8f6ff' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Header />
        <main style={{ flex: 1, padding: isMobile ? 16 : '28px 32px', overflowY: 'auto' }}>

          {/* Page title */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
            <div>
              <h2 style={{ margin: 0, fontSize: isMobile ? 18 : 22, fontWeight: 800, color: '#2e1065' }}>🎯 Goals</h2>
              <p style={{ color: '#9ca3af', fontSize: 13, margin: '4px 0 0' }}>Track intentions aligned with your Bazi energy.</p>
            </div>
            <button
              onClick={() => { setShowForm(!showForm); setEditTarget(null); setForm({ title: '', description: '', deadline: '', targetValue: 100, currentValue: 0, category: alignedCats[0] ?? 'personal' }); }}
              style={{ backgroundColor: '#7c3aed', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 18px', cursor: 'pointer', fontWeight: 700, fontSize: 14, flexShrink: 0 }}
            >
              + New Goal
            </button>
          </div>

          {/* Bazi energy banner */}
          <div style={{ backgroundColor: dmColor + '10', border: `1px solid ${dmColor}30`, borderRadius: 12, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 24 }}>{ELEM_ICON[dmElem]}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: dmColor }}>
                Today's energy: <strong>{dmElem}</strong> — focus on{' '}
                {alignedCats.map(c => `${CAT_ICON[c]} ${c}`).join(' & ')} goals
              </div>
              <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                Goals marked with {ELEM_ICON[dmElem]} are aligned with your Day Master element today.
              </div>
            </div>
          </div>

          {/* Stats row */}
          {goals.length > 0 && (
            <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
              {[
                { label: 'Total Goals', value: goals.length, color: '#7c3aed' },
                { label: 'In Progress', value: active.length, color: '#d97706' },
                { label: 'Completed', value: done.length, color: '#16a34a' },
              ].map(s => (
                <div key={s.label} style={{ flex: 1, minWidth: 90, backgroundColor: '#fff', borderRadius: 10, padding: '12px 14px', border: `1px solid ${s.color}22` }}>
                  <div style={{ fontSize: 9, color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 4 }}>{s.label}</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.value}</div>
                </div>
              ))}
            </div>
          )}

          {/* Create / Edit Form */}
          {showForm && (
            <div style={{ backgroundColor: '#fff', borderRadius: 14, padding: isMobile ? 16 : 22, border: '1px solid #e8e3f8', marginBottom: 20, boxShadow: '0 2px 8px rgba(124,58,237,0.06)' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: '#2e1065' }}>
                {editTarget ? '✏️ Edit Goal' : '✨ New Goal'}
              </h3>
              <form onSubmit={handleSubmit}>
                <label style={labelStyle}>Goal title *</label>
                <input style={inputStyle} placeholder="What do you want to achieve?" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />

                <label style={labelStyle}>Description</label>
                <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: 60 } as React.CSSProperties} placeholder="Why does this matter? (optional)" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />

                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 10 }}>
                  <div>
                    <label style={labelStyle}>Deadline</label>
                    <input style={inputStyle} type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} />
                  </div>
                  <div>
                    <label style={labelStyle}>Category</label>
                    <select style={inputStyle} value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                      {CATEGORIES.map(c => (
                        <option key={c} value={c}>
                          {CAT_ICON[c]} {c}{alignedCats.includes(c) ? ' ★ aligned' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Target value</label>
                    <input style={inputStyle} type="number" min={1} value={form.targetValue} onChange={e => setForm({ ...form, targetValue: Number(e.target.value) })} />
                  </div>
                  <div>
                    <label style={labelStyle}>Current progress</label>
                    <input style={inputStyle} type="number" min={0} value={form.currentValue} onChange={e => setForm({ ...form, currentValue: Number(e.target.value) })} />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
                  <button type="submit" style={{ padding: '9px 20px', backgroundColor: '#7c3aed', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700 }}>
                    {editTarget ? 'Update' : 'Create Goal'}
                  </button>
                  <button type="button" onClick={() => { setShowForm(false); setEditTarget(null); }} style={{ padding: '9px 20px', backgroundColor: '#f5f3ff', color: '#6b7280', border: '1px solid #e8e3f8', borderRadius: 8, cursor: 'pointer' }}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Filter tabs */}
          {goals.length > 0 && (
            <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
              <button onClick={() => setFilter('all')} style={{
                padding: '6px 14px', borderRadius: 20, border: '1px solid',
                borderColor: filter === 'all' ? '#7c3aed' : '#e8e3f8',
                backgroundColor: filter === 'all' ? '#7c3aed' : '#fff',
                color: filter === 'all' ? '#fff' : '#6b7280',
                cursor: 'pointer', fontSize: 12, fontWeight: 600,
              }}>All ({goals.length})</button>
              {CATEGORIES.filter(c => goals.some(g => g.category === c)).map(c => {
                const cElem = CATEGORY_ELEM[c];
                const cColor = ELEM_COLOR[cElem];
                const isActive = filter === c;
                const count = goals.filter(g => g.category === c).length;
                return (
                  <button key={c} onClick={() => setFilter(c)} style={{
                    padding: '6px 14px', borderRadius: 20, border: `1px solid ${isActive ? cColor : '#e8e3f8'}`,
                    backgroundColor: isActive ? cColor : '#fff',
                    color: isActive ? '#fff' : '#6b7280',
                    cursor: 'pointer', fontSize: 12, fontWeight: 600,
                  }}>{CAT_ICON[c]} {c} ({count})</button>
                );
              })}
            </div>
          )}

          {/* Goals grid */}
          {loading ? (
            <p style={{ color: '#9ca3af' }}>Loading goals…</p>
          ) : goals.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🎯</div>
              <p style={{ color: '#6b7280', fontSize: 14, margin: '0 0 6px' }}>No goals yet. Set your first intention.</p>
              <p style={{ color: '#9ca3af', fontSize: 13, margin: 0 }}>
                Your {dmElem} energy today aligns well with {alignedCats.join(' and ')} goals.
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <p style={{ color: '#9ca3af', textAlign: 'center', padding: '32px 0' }}>No {filter} goals yet.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
              {filtered.map(goal => (
                <GoalCardInline key={goal._id} goal={goal} dmElem={dmElem} onEdit={handleEdit} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Goals;
