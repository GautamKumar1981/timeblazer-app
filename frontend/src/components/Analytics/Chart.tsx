import React from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

export interface DailyStat {
  date: string;
  completed: number;
  total: number;
  productivityScore?: number;
}

interface ChartProps {
  data: DailyStat[];
  type?: 'line' | 'bar';
}

const Chart: React.FC<ChartProps> = ({ data, type = 'line' }) => {
  if (!data || data.length === 0) {
    return (
      <div style={{ height: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: '14px' }}>
        No data available for the selected period.
      </div>
    );
  }

  const formatted = data.map((d) => ({
    ...d,
    date: new Date(d.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }));

  const commonProps = {
    data: formatted,
    margin: { top: 5, right: 20, left: 0, bottom: 5 },
  };

  return (
    <ResponsiveContainer width="100%" height={260}>
      {type === 'bar' ? (
        <BarChart {...commonProps}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#9ca3af' }} />
          <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} />
          <Tooltip contentStyle={{ fontSize: '13px', borderRadius: '8px' }} />
          <Legend wrapperStyle={{ fontSize: '13px' }} />
          <Bar dataKey="completed" name="Completed" fill="#4f46e5" radius={[4, 4, 0, 0]} />
          <Bar dataKey="total" name="Total" fill="#c7d2fe" radius={[4, 4, 0, 0]} />
        </BarChart>
      ) : (
        <LineChart {...commonProps}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#9ca3af' }} />
          <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} />
          <Tooltip contentStyle={{ fontSize: '13px', borderRadius: '8px' }} />
          <Legend wrapperStyle={{ fontSize: '13px' }} />
          <Line type="monotone" dataKey="completed" name="Completed" stroke="#4f46e5" strokeWidth={2} dot={{ r: 4 }} />
          <Line type="monotone" dataKey="total" name="Total" stroke="#c7d2fe" strokeWidth={2} dot={{ r: 4 }} />
          {data[0]?.productivityScore !== undefined && (
            <Line type="monotone" dataKey="productivityScore" name="Score" stroke="#059669" strokeWidth={2} dot={{ r: 4 }} />
          )}
        </LineChart>
      )}
    </ResponsiveContainer>
  );
};

export default Chart;
