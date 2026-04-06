import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import toast from 'react-hot-toast';
import type { AppDispatch, RootState } from '../store/store';
import { fetchWeeklyAnalytics, fetchPatterns } from '../store/slices/analyticsSlice';
import { api } from '../services/api';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import type { WeeklyReview as WeeklyReviewType } from '../types';

const WeeklyReview: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { weeklyData, patterns, isLoading } = useSelector((state: RootState) => state.analytics);

  const [reviews, setReviews] = useState<WeeklyReviewType[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [nextWeekFocus, setNextWeekFocus] = useState('');
  const [expandedReview, setExpandedReview] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  const today = new Date();
  const weekStart = format(startOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd');
  const weekEnd = format(endOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd');

  useEffect(() => {
    dispatch(fetchWeeklyAnalytics(weekStart));
    dispatch(fetchPatterns());
    setReviewsLoading(true);
    api.reviews
      .getWeekly()
      .then(({ data }) => setReviews(data))
      .catch(() => {})
      .finally(() => setReviewsLoading(false));
  }, [dispatch, weekStart]);

  const completionRate = weeklyData
    ? weeklyData.totalTimeboxes > 0
      ? Math.round((weeklyData.completedCount / weeklyData.totalTimeboxes) * 100)
      : 0
    : 0;

  const completionColor =
    completionRate >= 80
      ? 'text-green-600 dark:text-green-400'
      : completionRate >= 50
      ? 'text-yellow-500'
      : 'text-red-500';

  const handleGenerateReview = async () => {
    setGenerating(true);
    try {
      const { data } = await api.reviews.generateWeekly({
        weekStartDate: weekStart,
        weekEndDate: weekEnd,
        completionRate,
        nextWeekFocus,
      });
      setReviews((prev) => [data, ...prev]);
      toast.success('Weekly review generated!');
    } catch {
      toast.error('Failed to generate review');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">📋 Weekly Review</h1>

      {/* Current week summary */}
      <div className="card space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {format(startOfWeek(today, { weekStartsOn: 1 }), 'MMM d')} –{' '}
            {format(endOfWeek(today, { weekStartsOn: 1 }), 'MMM d, yyyy')}
          </h2>
          <span className="text-xs text-gray-400 dark:text-gray-500">Current week</span>
        </div>

        {isLoading ? (
          <LoadingSpinner size="md" />
        ) : weeklyData ? (
          <>
            {/* Completion rate */}
            <div className="text-center py-4">
              <div className={`text-6xl font-bold ${completionColor}`}>{completionRate}%</div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Completion Rate</p>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-xl font-bold text-gray-900 dark:text-white">
                  {weeklyData.totalProductiveHours.toFixed(1)}h
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Productive Hrs</div>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-xl font-bold text-gray-900 dark:text-white">
                  {weeklyData.completedCount}/{weeklyData.totalTimeboxes}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Completed</div>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-xl font-bold text-gray-900 dark:text-white">
                  🔥 {weeklyData.streakDays}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Streak Days</div>
              </div>
            </div>

            {/* Patterns */}
            {patterns && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                  💡 Key Insights
                </h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <span className="text-blue-500 mt-0.5">•</span>
                    Busiest day was <strong>{patterns.busiestDay}</strong>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <span className="text-blue-500 mt-0.5">•</span>
                    Most productive hour: <strong>{patterns.mostProductiveHour}:00</strong>
                  </li>
                  {completionRate >= 80 && (
                    <li className="flex items-start gap-2 text-sm text-green-600 dark:text-green-400">
                      <span className="mt-0.5">✅</span>
                      Excellent week! You exceeded 80% completion.
                    </li>
                  )}
                  {weeklyData.interruptions > 5 && (
                    <li className="flex items-start gap-2 text-sm text-orange-500">
                      <span className="mt-0.5">⚠️</span>
                      High interruption count ({weeklyData.interruptions}). Consider blocking
                      focus time.
                    </li>
                  )}
                </ul>
              </div>
            )}
          </>
        ) : (
          <p className="text-sm text-gray-400 text-center py-4">No data available for this week.</p>
        )}

        {/* Next week focus */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Next Week Focus
          </label>
          <textarea
            value={nextWeekFocus}
            onChange={(e) => setNextWeekFocus(e.target.value)}
            placeholder="What do you want to focus on next week?"
            rows={3}
            className="input-field resize-none"
          />
        </div>

        <button
          onClick={handleGenerateReview}
          disabled={generating}
          className="btn-primary w-full"
        >
          {generating ? (
            <span className="flex items-center justify-center gap-2">
              <LoadingSpinner size="sm" /> Generating...
            </span>
          ) : (
            '✨ Generate Review'
          )}
        </button>
      </div>

      {/* Historical reviews */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Past Reviews
        </h2>
        {reviewsLoading ? (
          <LoadingSpinner size="md" />
        ) : reviews.length === 0 ? (
          <div className="card text-center py-8 text-gray-400">
            <p>No past reviews yet. Generate your first review above!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reviews.map((review) => (
              <div key={review.id} className="card">
                <button
                  className="w-full flex items-center justify-between"
                  onClick={() =>
                    setExpandedReview(expandedReview === review.id ? null : review.id)
                  }
                >
                  <div className="text-left">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {format(new Date(review.weekStartDate), 'MMM d')} –{' '}
                      {format(new Date(review.weekEndDate), 'MMM d, yyyy')}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {review.completionRate}% completion
                    </p>
                  </div>
                  <span className="text-gray-400 text-sm">
                    {expandedReview === review.id ? '▲' : '▼'}
                  </span>
                </button>

                {expandedReview === review.id && (
                  <div className="mt-4 space-y-3 border-t border-gray-200 dark:border-gray-700 pt-4">
                    {review.wins && review.wins.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-green-600 dark:text-green-400 mb-1">
                          ✅ Wins
                        </h4>
                        <ul className="space-y-1">
                          {review.wins.map((win, i) => (
                            <li key={i} className="text-sm text-gray-700 dark:text-gray-300 flex gap-2">
                              <span className="text-green-500">•</span> {win}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {review.improvements && review.improvements.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-orange-500 mb-1">
                          🔧 Improvements
                        </h4>
                        <ul className="space-y-1">
                          {review.improvements.map((imp, i) => (
                            <li key={i} className="text-sm text-gray-700 dark:text-gray-300 flex gap-2">
                              <span className="text-orange-400">→</span> {imp}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {review.nextWeekFocus && (
                      <div>
                        <h4 className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">
                          🎯 Next Week Focus
                        </h4>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {review.nextWeekFocus}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WeeklyReview;
