import React from 'react';
import { format, differenceInDays } from 'date-fns';
import type { Goal, GoalPriority } from '../../types';

interface GoalCardProps {
  goal: Goal;
  onEdit: (goal: Goal) => void;
  onDelete: (id: string) => void;
}

const PRIORITY_BADGE: Record<GoalPriority, string> = {
  high: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  low: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
};

const GoalCard: React.FC<GoalCardProps> = ({ goal, onEdit, onDelete }) => {
  const daysRemaining = differenceInDays(new Date(goal.targetDate), new Date());
  const isUrgent = daysRemaining <= 7 && daysRemaining >= 0;
  const isOverdue = daysRemaining < 0;

  const completedMilestones = goal.milestones?.filter((m) => m.completed).length ?? 0;
  const totalMilestones = goal.milestones?.length ?? 0;
  const milestoneProgress = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;

  const dDayLabel = isOverdue
    ? `D+${Math.abs(daysRemaining)}`
    : daysRemaining === 0
    ? 'D-Day!'
    : `D-${daysRemaining}`;

  return (
    <div className="card hover:shadow-md transition-shadow duration-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide ${
              PRIORITY_BADGE[goal.priority]
            }`}
          >
            {goal.priority}
          </span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full ${
              goal.status === 'active'
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                : goal.status === 'completed'
                ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            {goal.status}
          </span>
        </div>
        {/* D-Day countdown */}
        <div
          className={`text-lg font-bold tabular-nums ${
            isOverdue ? 'text-red-500' : isUrgent ? 'text-orange-500' : 'text-blue-600 dark:text-blue-400'
          }`}
        >
          {dDayLabel}
        </div>
      </div>

      {/* Title & Description */}
      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{goal.title}</h3>
      {goal.description && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">
          {goal.description}
        </p>
      )}

      {/* Target date */}
      <p
        className={`text-sm mb-3 ${
          isUrgent || isOverdue
            ? 'text-red-600 dark:text-red-400 font-medium'
            : 'text-gray-500 dark:text-gray-400'
        }`}
      >
        📅 {format(new Date(goal.targetDate), 'MMM d, yyyy')}
        {isOverdue
          ? ` · ${Math.abs(daysRemaining)} days overdue`
          : daysRemaining === 0
          ? ' · Today!'
          : ` · ${daysRemaining} days remaining`}
      </p>

      {/* Milestone progress */}
      {totalMilestones > 0 && (
        <div className="mb-3">
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
            <span>Milestones</span>
            <span>
              {completedMilestones}/{totalMilestones}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
            <div
              className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${milestoneProgress}%` }}
            />
          </div>
          {/* Milestone list */}
          <ul className="mt-2 space-y-1">
            {goal.milestones!.slice(0, 3).map((milestone) => (
              <li key={milestone.id} className="flex items-center gap-2 text-xs">
                <span
                  className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                    milestone.completed
                      ? 'bg-green-500 border-green-500 text-white'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                >
                  {milestone.completed && '✓'}
                </span>
                <span
                  className={`${
                    milestone.completed
                      ? 'line-through text-gray-400'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {milestone.title}
                </span>
              </li>
            ))}
            {goal.milestones!.length > 3 && (
              <li className="text-xs text-gray-400 pl-6">
                +{goal.milestones!.length - 3} more
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={() => onEdit(goal)}
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(goal.id)}
          className="text-sm text-red-500 hover:underline font-medium"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default GoalCard;
