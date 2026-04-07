import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/store';
import { fetchAnalytics } from '../store/slices/analyticsSlice';
import Header from '../components/Common/Header';
import Sidebar from '../components/Common/Sidebar';
import Chart from '../components/Analytics/Chart';

const Analytics: React.FC = () => {
  const dispatch = useAppDispatch();
  const { data, loading } = useAppSelector((state) => state.analytics);
  const [period, setPeriod] = useState<'weekly' | 'monthly'>('weekly');

  useEffect(() => {
    dispatch(fetchAnalytics(period));
  }, [dispatch, period]);

  const categoryColors: Record<string, string> = {
    work: '#4f46e5',
    personal: '#059669',
    health: '#dc2626',
    learning: '#d97706',
    other: '#7c3aed',
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header />
        <main style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 700, color: '#1f2937' }}>📊 Analytics</h2>
            <div style={{ display: 'flex', gap: '8px' }}>
              {(['weekly', 'monthly'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  style={{
                    padding: '7px 16px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 600,
                    backgroundColor: period === p ? '#4f46e5' : '#f3f4f6',
                    color: period === p ? '#fff' : '#374151',
                  }}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <p style={{ color: '#9ca3af' }}>Loading analytics...</p>
          ) : (
            <>
              {/* Summary Cards */}
              <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
                {[
                  { label: 'Total Timeboxes', value: data?.totalTimeboxes ?? 0, color: '#4f46e5', bg: '#ede9fe' },
                  { label: 'Completed', value: data?.completedTimeboxes ?? 0, color: '#059669', bg: '#d1fae5' },
                  { label: 'Focus Hours', value: `${(data?.totalFocusMinutes ?? 0) / 60 | 0}h ${(data?.totalFocusMinutes ?? 0) % 60}m`, color: '#0284c7', bg: '#e0f2fe' },
                  { label: 'Avg Score', value: data?.averageProductivityScore ? `${data.averageProductivityScore}/10` : 'N/A', color: '#d97706', bg: '#fef3c7' },
                ].map((s) => (
                  <div key={s.label} style={{ backgroundColor: s.bg, borderRadius: '10px', padding: '16px 24px', minWidth: '140px', flex: '1' }}>
                    <div style={{ fontSize: '24px', fontWeight: 700, color: s.color }}>{s.value}</div>
                    <div style={{ fontSize: '13px', color: '#374151', marginTop: '2px' }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Productivity Chart */}
              <div style={{ backgroundColor: '#fff', borderRadius: '10px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)', marginBottom: '24px' }}>
                <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 600, color: '#1f2937' }}>Productivity Over Time</h3>
                <Chart data={data?.dailyStats ?? []} />
              </div>

              {/* Category Breakdown */}
              <div style={{ backgroundColor: '#fff', borderRadius: '10px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
                <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 600, color: '#1f2937' }}>Focus Time Breakdown by Category</h3>
                {(data?.categoryBreakdown ?? []).length === 0 ? (
                  <p style={{ color: '#9ca3af', fontSize: '14px' }}>No data available.</p>
                ) : (
                  (data?.categoryBreakdown ?? []).map((cat) => {
                    const total = (data?.categoryBreakdown ?? []).reduce((sum, c) => sum + c.minutes, 0);
                    const pct = total > 0 ? Math.round((cat.minutes / total) * 100) : 0;
                    return (
                      <div key={cat.category} style={{ marginBottom: '14px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '14px' }}>
                          <span style={{ textTransform: 'capitalize', color: '#374151', fontWeight: 500 }}>{cat.category}</span>
                          <span style={{ color: '#6b7280' }}>{Math.floor(cat.minutes / 60)}h {cat.minutes % 60}m ({pct}%)</span>
                        </div>
                        <div style={{ height: '8px', backgroundColor: '#f3f4f6', borderRadius: '4px' }}>
                          <div style={{ height: '100%', width: `${pct}%`, backgroundColor: categoryColors[cat.category] || '#6b7280', borderRadius: '4px', transition: 'width 0.4s ease' }} />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default Analytics;
