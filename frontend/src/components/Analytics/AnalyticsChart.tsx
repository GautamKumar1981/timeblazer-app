import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { WeeklyDataPoint, PatternData, TimeboxCategory } from '../../types';
import { format } from 'date-fns';

interface AnalyticsChartProps {
  weeklyData?: WeeklyDataPoint[];
  patterns?: PatternData;
  type: 'completion' | 'category' | 'productivity' | 'accuracy';
}

const CATEGORY_COLORS: Record<TimeboxCategory, string> = {
  Work: '#2563eb',
  Meetings: '#ef4444',
  Breaks: '#facc15',
  Learning: '#22c55e',
  Personal: '#a855f7',
};

const formatDate = (dateStr: string) => {
  try {
    return format(new Date(dateStr), 'MMM d');
  } catch {
    return dateStr;
  }
};

const AnalyticsChart: React.FC<AnalyticsChartProps> = ({ weeklyData, patterns, type }) => {
  if (type === 'completion' && weeklyData) {
    const chartData = weeklyData.map((d) => ({
      date: formatDate(d.date),
      'Completion Rate': Math.round(d.completionRate),
    }));

    return (
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
          <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#6b7280' }} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#6b7280' }} unit="%" />
          <Tooltip
            formatter={(value: number) => [`${value}%`, 'Completion Rate']}
            contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#f9fafb' }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="Completion Rate"
            stroke="#2563eb"
            strokeWidth={2}
            dot={{ fill: '#2563eb', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  if (type === 'category' && patterns?.categoryBreakdown) {
    const chartData = patterns.categoryBreakdown.map((item) => ({
      name: item.category,
      value: item.hours,
      color: CATEGORY_COLORS[item.category],
    }));

    return (
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            outerRadius={90}
            dataKey="value"
            label={({ name, percent }) => `${name} ${Math.round((percent ?? 0) * 100)}%`}
            labelLine={false}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => [`${value.toFixed(1)}h`, 'Hours']}
            contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#f9fafb' }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    );
  }

  if (type === 'productivity' && weeklyData) {
    const chartData = weeklyData.map((d) => ({
      date: formatDate(d.date),
      'Productive Hours': parseFloat(d.productiveHours.toFixed(1)),
    }));

    return (
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
          <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#6b7280' }} />
          <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} unit="h" />
          <Tooltip
            formatter={(value: number) => [`${value}h`, 'Productive Hours']}
            contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#f9fafb' }}
          />
          <Legend />
          <Bar dataKey="Productive Hours" fill="#22c55e" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    );
  }

  if (type === 'accuracy' && weeklyData) {
    const chartData = weeklyData.map((d) => ({
      date: formatDate(d.date),
      Accuracy: Math.round(d.accuracy),
    }));

    return (
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
          <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#6b7280' }} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#6b7280' }} unit="%" />
          <Tooltip
            formatter={(value: number) => [`${value}%`, 'Accuracy']}
            contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#f9fafb' }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="Accuracy"
            stroke="#f59e0b"
            strokeWidth={2}
            dot={{ fill: '#f59e0b', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  return (
    <div className="flex items-center justify-center h-48 text-gray-400 dark:text-gray-600">
      No data available
    </div>
  );
};

export default AnalyticsChart;
