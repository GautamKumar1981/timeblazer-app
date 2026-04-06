import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { PlusIcon, FireIcon } from '@heroicons/react/24/outline';
import type { RootState } from '../../store/store';
import type { DailyPriority } from '../../types';
import { format } from 'date-fns';

interface SidebarProps {
  priorities?: DailyPriority;
  onPriorityChange?: (priorities: Partial<DailyPriority>) => void;
  onAddTimebox?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ priorities, onPriorityChange, onAddTimebox }) => {
  const navigate = useNavigate();
  const { timeboxes } = useSelector((state: RootState) => state.timebox);
  const { weeklyData } = useSelector((state: RootState) => state.analytics);

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const todayTimeboxes = timeboxes.filter((tb) =>
    tb.startTime.startsWith(todayStr)
  );

  const streakDays = weeklyData?.streakDays ?? 0;

  const [localPriorities, setLocalPriorities] = useState({
    p1: priorities?.priority1 ?? '',
    p2: priorities?.priority2 ?? '',
    p3: priorities?.priority3 ?? '',
    c1: priorities?.completionStatus.p1 ?? false,
    c2: priorities?.completionStatus.p2 ?? false,
    c3: priorities?.completionStatus.p3 ?? false,
  });

  const handlePriorityText = (key: 'p1' | 'p2' | 'p3', value: string) => {
    setLocalPriorities((prev) => ({ ...prev, [key]: value }));
    if (onPriorityChange) {
      onPriorityChange({
        priority1: key === 'p1' ? value : localPriorities.p1,
        priority2: key === 'p2' ? value : localPriorities.p2,
        priority3: key === 'p3' ? value : localPriorities.p3,
      });
    }
  };

  const handleCheck = (key: 'c1' | 'c2' | 'c3') => {
    setLocalPriorities((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const priorityItems: { label: string; textKey: 'p1' | 'p2' | 'p3'; checkKey: 'c1' | 'c2' | 'c3' }[] = [
    { label: 'Priority 1', textKey: 'p1', checkKey: 'c1' },
    { label: 'Priority 2', textKey: 'p2', checkKey: 'c2' },
    { label: 'Priority 3', textKey: 'p3', checkKey: 'c3' },
  ];

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-[280px] bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 overflow-y-auto z-30">
      <div className="p-4 space-y-6">
        {/* Quick-add button */}
        <button
          onClick={onAddTimebox ?? (() => navigate('/calendar'))}
          className="w-full flex items-center justify-center gap-2 btn-primary"
        >
          <PlusIcon className="h-4 w-4" />
          Add Timebox
        </button>

        {/* Today's Priorities */}
        <div>
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
            Today's Priorities
          </h3>
          <div className="space-y-2">
            {priorityItems.map(({ label, textKey, checkKey }) => (
              <div key={textKey} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={localPriorities[checkKey]}
                  onChange={() => handleCheck(checkKey)}
                  className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 flex-shrink-0 cursor-pointer"
                />
                <input
                  type="text"
                  placeholder={label}
                  value={localPriorities[textKey]}
                  onChange={(e) => handlePriorityText(textKey, e.target.value)}
                  className={`flex-1 text-sm bg-transparent border-b border-gray-200 dark:border-gray-700 py-1 text-gray-700 dark:text-gray-300 focus:outline-none focus:border-blue-500 transition-colors ${
                    localPriorities[checkKey] ? 'line-through text-gray-400' : ''
                  }`}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Quick stats */}
        <div>
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
            Quick Stats
          </h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <span className="text-sm text-gray-600 dark:text-gray-400">Today's Timeboxes</span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {todayTimeboxes.length}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 px-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <div className="flex items-center gap-1.5 text-sm text-orange-600 dark:text-orange-400">
                <FireIcon className="h-4 w-4" />
                Current Streak
              </div>
              <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                {streakDays} {streakDays === 1 ? 'day' : 'days'}
              </span>
            </div>
          </div>
        </div>

        {/* Today's schedule mini-list */}
        {todayTimeboxes.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              Today's Schedule
            </h3>
            <div className="space-y-1.5">
              {todayTimeboxes.slice(0, 6).map((tb) => (
                <div
                  key={tb.id}
                  className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                  onClick={() => navigate('/calendar')}
                >
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: tb.color || '#2563eb' }}
                  />
                  <span className="text-xs text-gray-700 dark:text-gray-300 truncate flex-1">
                    {tb.title}
                  </span>
                  <span
                    className={`text-xs flex-shrink-0 ${
                      tb.status === 'completed'
                        ? 'text-green-500'
                        : tb.status === 'in_progress'
                        ? 'text-blue-500'
                        : 'text-gray-400'
                    }`}
                  >
                    {tb.status === 'completed' ? '✓' : tb.status === 'in_progress' ? '▶' : '○'}
                  </span>
                </div>
              ))}
              {todayTimeboxes.length > 6 && (
                <p className="text-xs text-gray-400 text-center">
                  +{todayTimeboxes.length - 6} more
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
