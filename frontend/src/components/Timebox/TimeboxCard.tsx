import React from 'react';
import { useAppDispatch } from '../../store/store';
import { deleteTimebox, updateTimebox, Timebox } from '../../store/slices/timeboxSlice';

interface TimeboxCardProps {
  timebox: Timebox;
  onEdit?: (tb: Timebox) => void;
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  work: { bg: '#ede9fe', text: '#4f46e5' },
  personal: { bg: '#d1fae5', text: '#059669' },
  health: { bg: '#fee2e2', text: '#dc2626' },
  learning: { bg: '#fef3c7', text: '#d97706' },
  other: { bg: '#f3f4f6', text: '#6b7280' },
};

const TimeboxCard: React.FC<TimeboxCardProps> = ({ timebox, onEdit }) => {
  const dispatch = useAppDispatch();
  const colors = CATEGORY_COLORS[timebox.category] || CATEGORY_COLORS.other;

  const handleToggleComplete = () => {
    dispatch(updateTimebox({ id: timebox._id, data: { completed: !timebox.completed } }));
  };

  const handleDelete = () => {
    if (window.confirm(`Delete "${timebox.title}"?`)) {
      dispatch(deleteTimebox(timebox._id));
    }
  };

  return (
    <div
      style={{
        display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px',
        borderRadius: '8px', marginBottom: '8px',
        backgroundColor: timebox.completed ? '#f9fafb' : '#fff',
        border: '1px solid #f3f4f6',
        opacity: timebox.completed ? 0.75 : 1,
        transition: 'opacity 0.2s',
      }}
    >
      {/* Completion checkbox */}
      <div
        onClick={handleToggleComplete}
        style={{
          width: '20px', height: '20px', borderRadius: '50%', border: '2px solid',
          borderColor: timebox.completed ? '#059669' : '#d1d5db',
          backgroundColor: timebox.completed ? '#059669' : 'transparent',
          cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginTop: '1px',
        }}
      >
        {timebox.completed && <span style={{ color: '#fff', fontSize: '11px', fontWeight: 700 }}>✓</span>}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
          <span style={{
            fontSize: '14px', fontWeight: 600, color: '#1f2937',
            textDecoration: timebox.completed ? 'line-through' : 'none',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {timebox.title}
          </span>
          <span style={{ backgroundColor: colors.bg, color: colors.text, padding: '1px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, flexShrink: 0, textTransform: 'capitalize' }}>
            {timebox.category}
          </span>
        </div>
        <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '3px' }}>
          {timebox.startTime} – {timebox.endTime}
        </div>
        {timebox.description && (
          <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {timebox.description}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
        {onEdit && (
          <button
            onClick={() => onEdit(timebox)}
            style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: '14px', padding: '2px 4px' }}
            title="Edit"
          >
            ✏️
          </button>
        )}
        <button
          onClick={handleDelete}
          style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '14px', padding: '2px 4px' }}
          title="Delete"
        >
          🗑️
        </button>
      </div>
    </div>
  );
};

export default TimeboxCard;
