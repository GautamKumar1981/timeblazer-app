import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchTimeboxes } from '../store/timeboxSlice';
import { fetchGoals } from '../store/goalSlice';
import { fetchCurrentUser } from '../store/authSlice';
import { ClockIcon, FlagIcon, CheckCircleIcon, FireIcon } from '@heroicons/react/24/outline';

const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const { timeboxes } = useAppSelector((state) => state.timeboxes);
  const { goals } = useAppSelector((state) => state.goals);

  useEffect(() => {
    dispatch(fetchTimeboxes());
    dispatch(fetchGoals());
    if (!user) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, user]);

  const completedTimeboxes = timeboxes.filter((t) => t.status === 'completed').length;
  const activeGoals = goals.filter((g) => g.status === 'active').length;
  const recentTimeboxes = [...timeboxes]
    .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime())
    .slice(0, 5);

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    in_progress: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  const stats = [
    { label: 'Total Timeboxes', value: timeboxes.length, icon: ClockIcon, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Goals', value: goals.length, icon: FlagIcon, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Completed Timeboxes', value: completedTimeboxes, icon: CheckCircleIcon, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Active Goals', value: activeGoals, icon: FireIcon, color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.username ?? 'there'} 👋
        </h2>
        <p className="text-gray-500 mt-1">Here's your productivity overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl shadow-sm p-6 flex items-center gap-4">
            <div className={`p-3 rounded-xl ${bg}`}>
              <Icon className={`h-6 w-6 ${color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-sm text-gray-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Timeboxes */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Timeboxes</h3>
          {recentTimeboxes.length === 0 ? (
            <p className="text-gray-400 text-sm">No timeboxes yet. Create one to get started!</p>
          ) : (
            <ul className="space-y-3">
              {recentTimeboxes.map((tb) => (
                <li key={tb.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="font-medium text-gray-800">{tb.title}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(tb.start_time).toLocaleString()}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[tb.status]}`}>
                    {tb.status.replace('_', ' ')}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Goal Progress */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Goal Progress</h3>
          {goals.length === 0 ? (
            <p className="text-gray-400 text-sm">No goals yet. Add a goal to track progress!</p>
          ) : (
            <ul className="space-y-4">
              {goals.slice(0, 5).map((goal) => (
                <li key={goal.id}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{goal.title}</span>
                    <span className="text-sm text-gray-500">{goal.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-indigo-500 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(goal.progress, 100)}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
