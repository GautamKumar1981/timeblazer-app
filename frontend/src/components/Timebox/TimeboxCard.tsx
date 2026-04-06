import React from 'react';
import { format } from 'date-fns';
import type { Timebox, TimeboxCategory, TimeboxStatus } from '../../types';

interface TimeboxCardProps {
  timebox: Timebox;
  onEdit: (tb: Timebox) => void;
  onDelete: (id: string) => void;
  onStart: (id: string) => void;
  onComplete: (id: string) => void;
}

const CATEGORY_COLORS: Record<TimeboxCategory, string> = {
  Work: 'border-blue-600 bg-blue-50 dark:bg-blue-900/20',
  Meetings: 'border-red-500 bg-red-50 dark:bg-red-900/20',
  Breaks: 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20',
  Learning: 'border-green-500 bg-green-50 dark:bg-green-900/20',
  Personal: 'border-purple-500 bg-purple-50 dark:bg-purple-900/20',
};

const CATEGORY_BADGE: Record<TimeboxCategory, string> = {
  Work: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  Meetings: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  Breaks: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  Learning: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  Personal: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
};

const STATUS_BADGE: Record<TimeboxStatus, string> = {
  not_started: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
  in_progress: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200',
  completed: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200',
  overrun: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200',
};

const STATUS_LABEL: Record<TimeboxStatus, string> = {
  not_started: 'Not Started',
  in_progress: 'In Progress',
  completed: 'Completed',
  overrun: 'Overrun',
};

const TimeboxCard: React.FC<TimeboxCardProps> = ({
  timebox,
  onEdit,
  onDelete,
  onStart,
  onComplete,
}) => {
  const startFormatted = format(new Date(timebox.startTime), 'h:mm a');
  const endFormatted = format(new Date(timebox.endTime), 'h:mm a');

  const canStart = timebox.status === 'not_started' || timebox.status === 'overrun';
  const canComplete = timebox.status === 'in_progress';

  return (
    <div
      className={`card border-l-4 hover:shadow-md transition-shadow duration-200 ${
        CATEGORY_COLORS[timebox.category]
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-snug flex-1 mr-2">
          {timebox.title}
        </h3>
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${
            STATUS_BADGE[timebox.status]
          }`}
        >
          {STATUS_LABEL[timebox.status]}
        </span>
      </div>

      {/* Time */}
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
        🕐 {startFormatted} – {endFormatted}
      </p>

      {/* Category & Duration */}
      <div className="flex items-center gap-2 mb-3">
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            CATEGORY_BADGE[timebox.category]
          }`}
        >
          {timebox.category}
        </span>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {timebox.estimatedDuration} min estimated
          {timebox.actualDuration !== undefined && ` · ${timebox.actualDuration} min actual`}
        </span>
      </div>

      {/* Description */}
      {timebox.description && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">
          {timebox.description}
        </p>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={() => onEdit(timebox)}
          className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(timebox.id)}
          className="text-xs text-red-500 hover:underline font-medium"
        >
          Delete
        </button>
        <div className="ml-auto">
          {canStart && (
            <button
              onClick={() => onStart(timebox.id)}
              className="text-xs bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded-md font-medium transition-colors"
            >
              Start
            </button>
          )}
          {canComplete && (
            <button
              onClick={() => onComplete(timebox.id)}
              className="text-xs bg-green-600 hover:bg-green-700 text-white py-1 px-3 rounded-md font-medium transition-colors"
            >
              Complete
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TimeboxCard;
