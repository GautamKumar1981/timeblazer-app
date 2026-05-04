import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/store';
import { fetchAnalytics } from '../store/slices/analyticsSlice';
import Header from '../components/Common/Header';
import Sidebar from '../components/Common/Sidebar';
import Chart from '../components/Analytics/Chart';

const card: React.CSSProperties = {
  backgroundColor: '#16152e', borderRadius: 12, padding: 20,
  border: '1px solid rgba(139,92,246,0.2)', marginBottom: 20,
};

const Analytics: React.FC = () => {
  const dispatch = useAppDispatch();
  const { data, loading } = useAppSelector((state) => state.analytics);
  const [period, setPeriod] = useState<'weekly' | 'monthly'>('weekly');

  useEffect(() => { dispatch(fetchAnalytics(period)); }, [dispatch, period]);

  const catColors: Record<string, string> = {
    work: '#7c3aed', personal: '#22c55e', health: '#ef4444', learning: '#f59e0b', other: '#3b82f6',
  };

  const stats = [
    { label: 'Total Timeboxes',  value: data?.totalTimeboxes ?? 0,      color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)' },
    { label: 'Completed',        value: data?.completedTimeboxes ?? 0,  color: '#22c55e', bg: 'rgba(34,197,94,0.12)'  },
    { label: 'Focus Hours',      value: `${((data?.totalFocusMinutes ?? 0) / 60) | 0}h ${(data?.totalFocusMinutes ?? 0) % 60}m`, color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
    { label: 'Avg Score',        value: data?.averageProductivityScore ? `${data.averageProductivityScore}/10` : 'N/A', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0f0e1a' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header />
        <main style={{ flex: 1, padding: 24, overflowY: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#e9d5ff' }}>📊 Analytics</h2>
              <p style={{ color: '#6b7280', fontSize: 13, margin: '4px 0 0' }}>Your productivity patterns and energy alignment.</p>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {(['weekly', 'monthly'] as const).map((p) => (
                <button key={p} onClick={() => setPeriod(p)} style={{
                  padding: '7px 16px', border: 'none', borderRadius: 7, cursor: 'pointer', fontSize: 13, fontWeight: 600,
                  backgroundColor: period === p ? '#7c3aed' : 'rgba(255,255,255,0.07)',
                  color: period === p ? '#fff' : '#9ca3af',
                }}>
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <p style={{ color: '#6b7280' }}>Loading analytics…</p>
          ) : (
            <>
              <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
                {stats.map((s) => (
                  <div key={s.label} style={{ backgroundColor: s.bg, border: `1px solid ${s.color}33`, borderRadius: 12, padding: '16px 22px', minWidth: 130, flex: 1 }}>
                    <div style={{ fontSize: 24, fontWeight: 700, color: s.color }}>{s.value}</div>
                    <div style={{ fontSize: 13, color: '#9ca3af', marginTop: 2 }}>{s.label}</div>
                  </div>
                ))}
              </div>

              <div style={card}>
                <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 600, color: '#c4b5fd' }}>Productivity Over Time</h3>
                <Chart data={data?.dailyStats ?? []} />
              </div>

              <div style={card}>
                <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 600, color: '#c4b5fd' }}>Focus Time by Category</h3>
                {(data?.categoryBreakdown ?? []).length === 0 ? (
                  <p style={{ color: '#6b7280', fontSize: 14 }}>No data yet.</p>
                ) : (
                  (data?.categoryBreakdown ?? []).map((cat) => {
                    const total = (data?.categoryBreakdown ?? []).reduce((sum, c) => sum + c.minutes, 0);
                    const pct = total > 0 ? Math.round((cat.minutes / total) * 100) : 0;
                    return (
                      <div key={cat.category} style={{ marginBottom: 14 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 13 }}>
                          <span style={{ textTransform: 'capitalize', color: '#e5e7eb', fontWeight: 500 }}>{cat.category}</span>
                          <span style={{ color: '#9ca3af' }}>{Math.floor(cat.minutes / 60)}h {cat.minutes % 60}m ({pct}%)</span>
                        </div>
                        <div style={{ height: 7, backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 4 }}>
                          <div style={{ height: '100%', width: `${pct}%`, backgroundColor: catColors[cat.category] || '#6b7280', borderRadius: 4, transition: 'width 0.4s ease' }} />
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
