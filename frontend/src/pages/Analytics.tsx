import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks } from 'date-fns';
import type { AppDispatch, RootState } from '../store/store';
import {
  fetchWeeklyAnalytics,
  fetchMonthlyAnalytics,
  fetchPatterns,
  fetchStreaks,
} from '../store/slices/analyticsSlice';
import AnalyticsChart from '../components/Analytics/AnalyticsChart';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

type DateMode = 'week' | 'month';

const Analytics: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { weeklyData, monthlyData, patterns, streaks, isLoading } = useSelector(
    (state: RootState) => state.analytics
  );

  const [mode, setMode] = useState<DateMode>('week');
  const [currentDate, setCurrentDate] = useState(new Date());

  const weekStart = format(startOfWeek(currentDate, { weekStartsOn: 1 }), 'yyyy-MM-dd');
  const weekEnd = format(endOfWeek(currentDate, { weekStartsOn: 1 }), 'yyyy-MM-dd');

  useEffect(() => {
    if (mode === 'week') {
      dispatch(fetchWeeklyAnalytics(weekStart));
    } else {
      dispatch(fetchMonthlyAnalytics({ month: currentDate.getMonth() + 1, year: currentDate.getFullYear() }));
    }
    dispatch(fetchPatterns());
    dispatch(fetchStreaks());
  }, [dispatch, mode, weekStart, currentDate]);

  const navigatePrev = () => {
    if (mode === 'week') setCurrentDate((d) => subWeeks(d, 1));
    else setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  };

  const navigateNext = () => {
    if (mode === 'week') setCurrentDate((d) => addWeeks(d, 1));
    else setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  };

  const activeData = mode === 'week' ? weeklyData : monthlyData;
  const completionRate = activeData
    ? activeData.totalTimeboxes > 0
      ? Math.round((activeData.completedCount / activeData.totalTimeboxes) * 100)
      : 0
    : 0;

  const dateLabel =
    mode === 'week'
      ? `${format(startOfWeek(currentDate, { weekStartsOn: 1 }), 'MMM d')} – ${format(endOfWeek(currentDate, { weekStartsOn: 1 }), 'MMM d, yyyy')}`
      : format(currentDate, 'MMMM yyyy');

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">📊 Analytics</h1>

        {/* Mode tabs + date nav */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            {(['week', 'month'] as DateMode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-colors ${
                  mode === m
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={navigatePrev} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <ChevronLeftIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </button>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[160px] text-center">
              {dateLabel}
            </span>
            <button onClick={navigateNext} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <ChevronRightIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      {isLoading && !activeData ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="card text-center">
              <div
                className={`text-4xl font-bold ${
                  completionRate >= 80
                    ? 'text-green-600 dark:text-green-400'
                    : completionRate >= 50
                    ? 'text-yellow-500'
                    : 'text-red-500'
                }`}
              >
                {completionRate}%
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Completion Rate</div>
            </div>
            <div className="card text-center">
              <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                {activeData?.totalProductiveHours.toFixed(1) ?? '—'}h
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Productive Hours</div>
            </div>
            <div className="card text-center">
              <div className="text-4xl font-bold text-purple-600 dark:text-purple-400">
                {activeData?.accuracyPercentage ? `${Math.round(activeData.accuracyPercentage)}%` : '—'}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Accuracy</div>
            </div>
            <div className="card text-center">
              <div className="text-4xl font-bold text-orange-500">
                🔥 {streaks?.streakDays ?? 0}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Day Streak</div>
            </div>
          </div>

          {/* Charts 2x2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
                Completion Rate
              </h3>
              <AnalyticsChart
                weeklyData={patterns?.weeklyData}
                patterns={patterns ?? undefined}
                type="completion"
              />
            </div>
            <div className="card">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
                Category Breakdown
              </h3>
              <AnalyticsChart
                weeklyData={patterns?.weeklyData}
                patterns={patterns ?? undefined}
                type="category"
              />
            </div>
            <div className="card">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
                Productive Hours
              </h3>
              <AnalyticsChart
                weeklyData={patterns?.weeklyData}
                patterns={patterns ?? undefined}
                type="productivity"
              />
            </div>
            <div className="card">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
                Accuracy Trend
              </h3>
              <AnalyticsChart
                weeklyData={patterns?.weeklyData}
                patterns={patterns ?? undefined}
                type="accuracy"
              />
            </div>
          </div>

          {/* Insights */}
          {patterns && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="card">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  🔍 Pattern Insights
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Busiest Day</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {patterns.busiestDay}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Most Productive Hour</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {patterns.mostProductiveHour}:00
                    </span>
                  </div>
                  {activeData && (
                    <div className="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <span className="text-sm text-gray-600 dark:text-gray-300">Interruptions</span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {activeData.interruptions}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="card">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  🔥 Streak Info
                </h3>
                <div className="text-center py-4">
                  <div className="text-5xl font-bold text-orange-500 mb-2">
                    {streaks?.streakDays ?? 0}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Current streak days</p>
                  {streaks && (
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      Longest: {streaks.longestStreak} days
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Analytics;
