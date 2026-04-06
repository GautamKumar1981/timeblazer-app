import React, { useEffect, useRef } from 'react';
import { useTimer } from '../../hooks/useTimer';
import type { Timebox } from '../../types';

interface CountdownTimerProps {
  timebox: Timebox;
  onComplete: (actualDuration: number) => void;
  onExtend: () => void;
}

const RADIUS = 80;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const CountdownTimer: React.FC<CountdownTimerProps> = ({ timebox, onComplete, onExtend }) => {
  const { timeRemaining, isRunning, percentage, formattedTime } = useTimer(
    timebox.startTime,
    timebox.endTime
  );
  const startRef = useRef(new Date(timebox.startTime).getTime());

  const strokeDashoffset = CIRCUMFERENCE * (percentage / 100);

  let ringColor = '#22c55e';
  if (percentage >= 90) ringColor = '#ef4444';
  else if (percentage >= 50) ringColor = '#facc15';

  const handleCompleteEarly = () => {
    const elapsedMs = Date.now() - startRef.current;
    const actualDuration = Math.round(elapsedMs / 60000);
    onComplete(actualDuration);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative flex items-center justify-center">
        <svg width="200" height="200" className="-rotate-90">
          {/* Background ring */}
          <circle
            cx="100"
            cy="100"
            r={RADIUS}
            fill="none"
            stroke="#374151"
            strokeWidth="8"
          />
          {/* Progress ring */}
          <circle
            cx="100"
            cy="100"
            r={RADIUS}
            fill="none"
            stroke={ringColor}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={CIRCUMFERENCE - strokeDashoffset}
            style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.5s ease' }}
          />
        </svg>

        {/* Center text */}
        <div className="absolute flex flex-col items-center">
          <span className="text-3xl font-bold font-mono text-white dark:text-white">
            {formattedTime}
          </span>
          <span className="text-xs text-gray-400 mt-1">
            {isRunning ? 'remaining' : 'ended'}
          </span>
        </div>
      </div>

      {/* Title */}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate max-w-xs">
          {timebox.title}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {timebox.estimatedDuration} min estimated &bull;{' '}
          {Math.round((Date.now() - startRef.current) / 60000)} min elapsed
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleCompleteEarly}
          className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors"
        >
          ✓ Complete Early
        </button>
        <button
          onClick={onExtend}
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors"
        >
          +5 min
        </button>
      </div>

      {/* Progress percentage label */}
      <div className="text-xs text-gray-500 dark:text-gray-400">
        {Math.round(percentage)}% elapsed
      </div>
    </div>
  );
};

export default CountdownTimer;
