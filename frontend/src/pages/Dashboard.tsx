import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/store';
import { fetchTimeboxes } from '../store/slices/timeboxSlice';
import Header from '../components/Common/Header';
import Sidebar from '../components/Common/Sidebar';
import TimeboxCard from '../components/Timebox/TimeboxCard';

const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { timeboxes, loading } = useAppSelector((state) => state.timebox);
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchTimeboxes(undefined));
  }, [dispatch]);

  const today = new Date().toISOString().split('T')[0];
  const todayBoxes = timeboxes.filter((tb) => tb.date === today);
  const completed = todayBoxes.filter((tb) => tb.completed).length;
  const priorities = todayBoxes.slice(0, 3);

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header />
        <main style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
          <h2 style={{ margin: '0 0 4px', fontSize: '22px', fontWeight: 700, color: '#1f2937' }}>
            Welcome back, {user?.name || 'User'} 👋
          </h2>
          <p style={{ color: '#6b7280', marginBottom: '24px', fontSize: '14px' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          {/* Quick Stats */}
          <div style={{ display: 'flex', gap: '16px', marginBottom: '28px', flexWrap: 'wrap' }}>
            {[
              { label: 'Total Today', value: todayBoxes.length, color: '#4f46e5', bg: '#ede9fe' },
              { label: 'Completed', value: completed, color: '#059669', bg: '#d1fae5' },
              { label: 'Remaining', value: todayBoxes.length - completed, color: '#d97706', bg: '#fef3c7' },
              { label: 'Completion Rate', value: todayBoxes.length ? `${Math.round((completed / todayBoxes.length) * 100)}%` : '0%', color: '#0284c7', bg: '#e0f2fe' },
            ].map((stat) => (
              <div key={stat.label} style={{ backgroundColor: stat.bg, borderRadius: '10px', padding: '16px 24px', minWidth: '140px', flex: '1' }}>
                <div style={{ fontSize: '26px', fontWeight: 700, color: stat.color }}>{stat.value}</div>
                <div style={{ fontSize: '13px', color: '#374151', marginTop: '2px' }}>{stat.label}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            {/* Today's Timeboxes */}
            <div style={{ backgroundColor: '#fff', borderRadius: '10px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 600, color: '#1f2937' }}>
                📦 Today's Timeboxes
              </h3>
              {loading ? (
                <p style={{ color: '#9ca3af' }}>Loading...</p>
              ) : todayBoxes.length === 0 ? (
                <p style={{ color: '#9ca3af', fontSize: '14px' }}>No timeboxes for today. Start planning!</p>
              ) : (
                todayBoxes.map((tb) => <TimeboxCard key={tb._id} timebox={tb} />)
              )}
            </div>

            {/* Daily Priorities */}
            <div style={{ backgroundColor: '#fff', borderRadius: '10px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 600, color: '#1f2937' }}>
                🎯 Daily Priorities
              </h3>
              {priorities.length === 0 ? (
                <p style={{ color: '#9ca3af', fontSize: '14px' }}>Set your top 3 priorities for today.</p>
              ) : (
                priorities.map((p, idx) => (
                  <div key={p._id} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', padding: '10px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: ['#4f46e5', '#059669', '#d97706'][idx], color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, flexShrink: 0 }}>
                      {idx + 1}
                    </div>
                    <span style={{ fontSize: '14px', color: '#374151', fontWeight: 500 }}>{p.title}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div style={{ backgroundColor: '#fff', borderRadius: '10px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)', marginTop: '24px' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 600, color: '#1f2937' }}>🕐 Recent Activity</h3>
            {timeboxes.slice(0, 5).length === 0 ? (
              <p style={{ color: '#9ca3af', fontSize: '14px' }}>No recent activity.</p>
            ) : (
              timeboxes.slice(0, 5).map((tb) => (
                <div key={tb._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f3f4f6', fontSize: '14px' }}>
                  <span style={{ color: '#374151' }}>{tb.title}</span>
                  <span style={{ color: '#9ca3af' }}>{tb.date}</span>
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
