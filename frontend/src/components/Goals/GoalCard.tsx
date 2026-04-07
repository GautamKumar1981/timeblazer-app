import React from 'react';
import { differenceInDays, format, isPast } from 'date-fns';
import { Goal } from '../../store/slices/goalsSlice';
import styles from './GoalCard.module.css';

interface GoalCardProps {
  goal: Goal;
  onEdit: (goal: Goal) => void;
  onDelete: (id: string) => void;
  onProgressUpdate: (id: string, progress: number) => void;
}

const PRIORITY_COLORS: Record<Goal['priority'], string> = {
  low: '#27AE60',
  medium: '#F39C12',
  high: '#E74C3C',
};

function GoalCard({ goal, onEdit, onDelete, onProgressUpdate }: GoalCardProps) {
  const targetDate = new Date(goal.target_date);
  const daysLeft = differenceInDays(targetDate, new Date());
  const isOverdue = isPast(targetDate) && goal.status !== 'completed';

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span
          className={styles.priority}
          style={{ backgroundColor: PRIORITY_COLORS[goal.priority] }}
        >
          {goal.priority.toUpperCase()}
        </span>
        <span className={`${styles.dDay} ${isOverdue ? styles.overdue : ''}`}>
          {goal.status === 'completed' ? '✅ Done' : isOverdue ? `Overdue ${Math.abs(daysLeft)}d` : `D-${daysLeft}`}
        </span>
      </div>
      <h3 className={styles.title}>{goal.title}</h3>
      {goal.description && (
        <p className={styles.description}>{goal.description}</p>
      )}
      <div className={styles.targetDate}>
        🗓 {format(targetDate, 'MMM d, yyyy')}
      </div>
      <div className={styles.progressSection}>
        <div className={styles.progressLabel}>
          <span>Progress</span>
          <span>{goal.progress}%</span>
        </div>
        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{ width: `${goal.progress}%`, backgroundColor: PRIORITY_COLORS[goal.priority] }}
          />
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={goal.progress}
          className={styles.progressSlider}
          onChange={(e) => onProgressUpdate(goal.id, parseInt(e.target.value, 10))}
        />
      </div>
      <div className={styles.actions}>
        <button className={`${styles.btn} ${styles.editBtn}`} onClick={() => onEdit(goal)}>
          ✏️ Edit
        </button>
        <button className={`${styles.btn} ${styles.deleteBtn}`} onClick={() => onDelete(goal.id)}>
          🗑 Delete
        </button>
      </div>
    </div>
  );
}

export default GoalCard;
