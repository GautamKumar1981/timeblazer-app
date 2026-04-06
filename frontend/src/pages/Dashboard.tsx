import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import type { AppDispatch, RootState } from '../store/store';
import { fetchTimeboxes, updateTimeboxStatus, completeTimebox } from '../store/slices/timeboxSlice';
import { fetchGoals } from '../store/slices/goalsSlice';
import { fetchWeeklyAnalytics } from '../store/slices/analyticsSlice';
import { api } from '../services/api';
import TimeboxCard from '../components/Timebox/TimeboxCard';
import CountdownTimer from '../components/Timer/CountdownTimer';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import type { DailyPriority } from '../types';

const Dashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const { timeboxes, isLoading: tbLoading } = useSelector((state: RootState) => state.timebox);
  const { goals } = useSelector((state: RootState) => state.goals);
  const { weeklyData } = useSelector((state: RootState) => state.analytics);
  const [priorities, setPriorities] = useState<DailyPriority | null>(null);

  const today = format(new Date(), 'yyyy-MM-dd');
  const weekStart = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    dispatch(fetchTimeboxes({ startDate: today, endDate: today }));
    dispatch(fetchGoals());
    dispatch(fetchWeeklyAnalytics(weekStart));

    api.priorities
      .getToday()
      .then(({ data }) => setPriorities(data))
      .catch(() => {});
  }, [dispatch, today, weekStart]);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  const yearProgress = Math.round((dayOfYear / 365) * 100);

  const activeTimebox = timeboxes.find((tb) => tb.status === 'in_progress');
  const recentTimeboxes = [...timeboxes]
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
    .slice(0, 5);

  const upcomingGoals = [...goals]
    .filter((g) => g.status === 'active')
    .sort((a, b) => a.daysRemaining - b.daysRemaining)
    .slice(0, 3);

  const handleStartTimebox = (id: string) => {
    dispatch(updateTimeboxStatus({ id, status: 'in_progress' }))
      .unwrap()
      .then(() => toast.success('Timebox started!'))
      .catch((err: string) => toast.error(err));
  };

  const handleCompleteTimebox = (id: string) => {
    dispatch(updateTimeboxStatus({ id, status: 'completed' }))
      .unwrap()
      .then(() => toast.success('Timebox completed!'))
      .catch((err: string) => toast.error(err));
  };

  const handleTimerComplete = (id: string, actualDuration: number) => {
    dispatch(completeTimebox({ id, actualDuration }))
      .unwrap()
      .then(() => toast.success('Great work! Timebox completed.'))
      .catch((err: string) => toast.error(err));
  };

  const handleExtend = (id: string) => {
    const tb = timeboxes.find((t) => t.id === id);
    if (!tb) return;
    const newEnd = new Date(new Date(tb.endTime).getTime() + 5 * 60000).toISOString();
    dispatch(updateTimeboxStatus({ id, status: 'in_progress' }));
    toast.success('Added 5 minutes');
    // In a real implementation, we'd update the endTime
  };

  return (
    <div className="p-6 space-y-6">
      {tbLoading && (
        <div className="flex justify-center py-4">
          <LoadingSpinner size="md" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT COLUMN */}
        <div className="space-y-6">
          {/* Welcome header */}
          <div className="card">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {greeting}, {user?.name?.split(' ')[0]}! 👋
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {format(new Date(), 'EEEE, MMMM d, yyyy')}
            </p>
            {/* Year progress */}
            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                <span>Year Progress</span>
                <span>{yearProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${yearProgress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Today's priorities */}
          {priorities && (
            <div className="card">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                📌 Today's Top Priorities
              </h2>
              <div className="space-y-2">
                {[priorities.priority1, priorities.priority2, priorities.priority3]
                  .filter(Boolean)
                  .map((p, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-sm font-bold text-blue-600 dark:text-blue-400 w-5">
                        {i + 1}.
                      </span>
                      <span className="text-sm text-gray-700 dark:text-gray-300">{p}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Active timebox / countdown */}
          {activeTimebox && (
            <div className="card bg-gray-900 dark:bg-gray-950 border-gray-700">
              <h2 className="text-sm font-semibold text-gray-400 mb-4">⏱ Focus Timer</h2>
              <CountdownTimer
                timebox={activeTimebox}
                onComplete={(dur) => handleTimerComplete(activeTimebox.id, dur)}
                onExtend={() => handleExtend(activeTimebox.id)}
              />
              <button
                onClick={() => navigate('/focus')}
                className="w-full mt-4 text-sm text-center text-blue-400 hover:text-blue-300 underline"
              >
                Enter Focus Mode →
              </button>
            </div>
          )}

          {/* Recent timeboxes */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                Recent Timeboxes
              </h2>
              <button
                onClick={() => navigate('/calendar')}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                View all →
              </button>
            </div>
            {recentTimeboxes.length === 0 ? (
              <div className="card text-center py-8 text-gray-400">
                <p>No timeboxes today.</p>
                <button
                  onClick={() => navigate('/calendar')}
                  className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Schedule your first timebox
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentTimeboxes.map((tb) => (
                  <TimeboxCard
                    key={tb.id}
                    timebox={tb}
                    onEdit={() => navigate('/calendar')}
                    onDelete={() => {}}
                    onStart={handleStartTimebox}
                    onComplete={handleCompleteTimebox}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">
          {/* Quick stats */}
          {weeklyData && (
            <div className="grid grid-cols-2 gap-3">
              <div className="card text-center">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {Math.round(weeklyData.accuracyPercentage)}%
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Accuracy</div>
              </div>
              <div className="card text-center">
                <div className="text-3xl font-bold text-orange-500">
                  🔥 {weeklyData.streakDays}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Day Streak</div>
              </div>
              <div className="card text-center">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {weeklyData.totalProductiveHours.toFixed(1)}h
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Productive Hrs</div>
              </div>
              <div className="card text-center">
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {weeklyData.completedCount}/{weeklyData.totalTimeboxes}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Completed</div>
              </div>
            </div>
          )}

          {/* Upcoming goals */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                🎯 Upcoming Goals
              </h2>
              <button
                onClick={() => navigate('/goals')}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                View all →
              </button>
            </div>
            {upcomingGoals.length === 0 ? (
              <div className="card text-center py-6 text-gray-400 text-sm">
                <p>No active goals.</p>
                <button
                  onClick={() => navigate('/goals')}
                  className="mt-1 text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Create a goal
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {upcomingGoals.map((goal) => (
                  <div key={goal.id} className="card flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{goal.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {goal.daysRemaining <= 0
                          ? 'Overdue'
                          : `${goal.daysRemaining} days remaining`}
                      </p>
                    </div>
                    <span
                      className={`text-lg font-bold ${
                        goal.daysRemaining <= 7
                          ? 'text-red-500'
                          : 'text-blue-600 dark:text-blue-400'
                      }`}
                    >
                      {goal.daysRemaining <= 0 ? `D+${Math.abs(goal.daysRemaining)}` : `D-${goal.daysRemaining}`}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Today's full schedule */}
          <div>
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              📅 Today's Schedule
            </h2>
            {timeboxes.length === 0 ? (
              <div className="card text-center py-6 text-gray-400 text-sm">
                Nothing scheduled today
              </div>
            ) : (
              <div className="card divide-y divide-gray-100 dark:divide-gray-700 p-0 overflow-hidden">
                {[...timeboxes]
                  .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
                  .map((tb) => (
                    <div
                      key={tb.id}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <div
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: tb.color || '#2563eb' }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {tb.title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {format(new Date(tb.startTime), 'h:mm a')} –{' '}
                          {format(new Date(tb.endTime), 'h:mm a')}
                        </p>
                      </div>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          tb.status === 'completed'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                            : tb.status === 'in_progress'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                        }`}
                      >
                        {tb.status.replace('_', ' ')}
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
