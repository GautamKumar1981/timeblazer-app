import React from 'react';
import { format } from 'date-fns';
import { Timebox } from '../../store/slices/timeboxSlice';
import styles from './TimeboxCard.module.css';

interface TimeboxCardProps {
  timebox: Timebox;
  onEdit: (timebox: Timebox) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: Timebox['status']) => void;
  onStart: (timebox: Timebox) => void;
}

const STATUS_LABELS: Record<Timebox['status'], string> = {
  pending: 'Pending',
  in_progress: 'In Progress',
  completed: 'Completed',
  skipped: 'Skipped',
};

const STATUS_COLORS: Record<Timebox['status'], string> = {
  pending: '#95A5A6',
  in_progress: '#F39C12',
  completed: '#27AE60',
  skipped: '#E74C3C',
};

function TimeboxCard({ timebox, onEdit, onDelete, onStatusChange, onStart }: TimeboxCardProps) {
  const start = format(new Date(timebox.start_time), 'h:mm a');
  const end = format(new Date(timebox.end_time), 'h:mm a');

  return (
    <div className={styles.card} style={{ borderLeftColor: timebox.color || 'var(--primary)' }}>
      <div className={styles.top}>
        <div className={styles.meta}>
          <span className={styles.time}>{start} – {end}</span>
          <span
            className={styles.categoryBadge}
            style={{ backgroundColor: timebox.color || 'var(--primary)' }}
          >
            {timebox.category}
          </span>
        </div>
        <span
          className={styles.statusBadge}
          style={{ backgroundColor: STATUS_COLORS[timebox.status] }}
        >
          {STATUS_LABELS[timebox.status]}
        </span>
      </div>
      <h3 className={styles.title}>{timebox.title}</h3>
      {timebox.description && (
        <p className={styles.description}>{timebox.description}</p>
      )}
      <div className={styles.actions}>
        {timebox.status === 'pending' && (
          <button className={`${styles.btn} ${styles.startBtn}`} onClick={() => onStart(timebox)}>
            ▶ Start
          </button>
        )}
        <button className={`${styles.btn} ${styles.editBtn}`} onClick={() => onEdit(timebox)}>
          ✏️ Edit
        </button>
        {timebox.status !== 'completed' && (
          <button
            className={`${styles.btn} ${styles.doneBtn}`}
            onClick={() => onStatusChange(timebox.id, 'completed')}
          >
            ✓ Done
          </button>
        )}
        <button className={`${styles.btn} ${styles.deleteBtn}`} onClick={() => onDelete(timebox.id)}>
          🗑
        </button>
      </div>
    </div>
  );
}

export default TimeboxCard;
