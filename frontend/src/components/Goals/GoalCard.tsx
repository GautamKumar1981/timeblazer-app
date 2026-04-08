import React from 'react';
import { Goal } from '../../store/slices/goalsSlice';

interface GoalCardProps {
  goal: Goal;
  onEdit: (goal: Goal) => void;
  onDelete: (id: string) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  personal: '#4f46e5',
  work: '#0284c7',
  health: '#dc2626',
  learning: '#d97706',
  financial: '#059669',
};

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  active: { bg: '#d1fae5', color: '#065f46' },
  completed: { bg: '#ede9fe', color: '#4f46e5' },
  paused: { bg: '#fef3c7', color: '#92400e' },
};

const GoalCard: React.FC<GoalCardProps> = ({ goal, onEdit, onDelete }) => {
  const progress = goal.targetValue > 0 ? Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100)) : 0;
  const catColor = CATEGORY_COLORS[goal.category] || '#6b7280';
  const statusStyle = STATUS_STYLES[goal.status] || STATUS_STYLES.active;

  const getDaysLeft = (): string => {
    if (!goal.deadline) return '';
    const diff = Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return 'Overdue';
    if (diff === 0) return 'Due today';
    return `D-${diff}`;
  };

  const daysLabel = getDaysLeft();

  return (
    <div style={{ backgroundColor: '#fff', borderRadius: '10px', padding: '18px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)', borderTop: `3px solid ${catColor}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
        <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#1f2937', flex: 1, marginRight: '8px' }}>{goal.title}</h4>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexShrink: 0 }}>
          {daysLabel && (
            <span style={{
              fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '20px',
              backgroundColor: daysLabel === 'Overdue' ? '#fee2e2' : '#f0fdf4',
              color: daysLabel === 'Overdue' ? '#dc2626' : '#15803d',
            }}>
              {daysLabel}
            </span>
          )}
          <span style={{ fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '20px', backgroundColor: statusStyle.bg, color: statusStyle.color, textTransform: 'capitalize' }}>
            {goal.status}
          </span>
        </div>
      </div>

      {goal.description && (
        <p style={{ margin: '0 0 10px', fontSize: '13px', color: '#6b7280', lineHeight: 1.4 }}>{goal.description}</p>
      )}

      {/* Progress bar */}
      <div style={{ marginBottom: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
          <span style={{ fontSize: '12px', color: '#6b7280' }}>Progress</span>
          <span style={{ fontSize: '12px', fontWeight: 700, color: catColor }}>{progress}%</span>
        </div>
        <div style={{ height: '8px', backgroundColor: '#f3f4f6', borderRadius: '4px' }}>
          <div style={{ height: '100%', width: `${progress}%`, backgroundColor: catColor, borderRadius: '4px', transition: 'width 0.4s ease' }} />
        </div>
        <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>
          {goal.currentValue} / {goal.targetValue}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '12px', backgroundColor: '#f3f4f6', color: '#6b7280', padding: '2px 10px', borderRadius: '20px', textTransform: 'capitalize' }}>
          {goal.category}
        </span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => onEdit(goal)} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: '14px', padding: '2px 4px' }} title="Edit">✏️</button>
          <button onClick={() => onDelete(goal._id)} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '14px', padding: '2px 4px' }} title="Delete">🗑️</button>
        </div>
      </div>
    </div>
  );
};

export default GoalCard;
