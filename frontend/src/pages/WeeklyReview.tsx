import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/store';
import { fetchReviews, submitReview } from '../store/slices/analyticsSlice';
import Header from '../components/Common/Header';
import Sidebar from '../components/Common/Sidebar';

const RATINGS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const card: React.CSSProperties = {
  backgroundColor: '#16152e', borderRadius: 12, padding: 22,
  border: '1px solid rgba(139,92,246,0.2)',
};
const taStyle: React.CSSProperties = {
  width: '100%', padding: '10px 12px', backgroundColor: '#1a1830',
  border: '1px solid rgba(139,92,246,0.25)', borderRadius: 7,
  fontSize: 14, color: '#e5e7eb', boxSizing: 'border-box',
  marginBottom: 14, resize: 'vertical', minHeight: 90,
};
const labelStyle: React.CSSProperties = { fontSize: 13, color: '#9ca3af', display: 'block', marginBottom: 4 };

const WeeklyReview: React.FC = () => {
  const dispatch = useAppDispatch();
  const { reviews, loading } = useAppSelector((state) => state.analytics);
  const [form, setForm] = useState({ accomplishments: '', challenges: '', nextWeekGoals: '', productivityRating: 7, weekStartDate: '' });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    dispatch(fetchReviews());
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(new Date(now).setDate(diff));
    setForm((f) => ({ ...f, weekStartDate: monday.toISOString().split('T')[0] }));
  }, [dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await dispatch(submitReview(form));
    setSubmitted(true);
    setForm({ accomplishments: '', challenges: '', nextWeekGoals: '', productivityRating: 7, weekStartDate: '' });
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0f0e1a' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header />
        <main style={{ flex: 1, padding: 24, overflowY: 'auto' }}>
          <h2 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 700, color: '#e9d5ff' }}>📝 Weekly Review</h2>
          <p style={{ color: '#6b7280', fontSize: 13, margin: '0 0 20px' }}>Reflect, consolidate, and align your next week with your Bazi energy.</p>

          {submitted && (
            <div style={{ backgroundColor: 'rgba(34,197,94,0.12)', color: '#4ade80', padding: '12px 16px', borderRadius: 8, marginBottom: 16, fontSize: 14, border: '1px solid rgba(34,197,94,0.3)' }}>
              ✓ Weekly review submitted!
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            <div style={card}>
              <h3 style={{ margin: '0 0 18px', fontSize: 15, fontWeight: 600, color: '#c4b5fd' }}>New Review</h3>
              <form onSubmit={handleSubmit}>
                <label style={labelStyle}>Week Starting</label>
                <input
                  style={{ ...taStyle, minHeight: 'auto', resize: 'none' } as React.CSSProperties}
                  type="date"
                  value={form.weekStartDate}
                  onChange={(e) => setForm({ ...form, weekStartDate: e.target.value })}
                  required
                />

                <label style={labelStyle}>✅ Accomplishments</label>
                <textarea style={taStyle} placeholder="What did you accomplish this week?" value={form.accomplishments} onChange={(e) => setForm({ ...form, accomplishments: e.target.value })} required />

                <label style={labelStyle}>⚠️ Challenges</label>
                <textarea style={taStyle} placeholder="What challenges did you face?" value={form.challenges} onChange={(e) => setForm({ ...form, challenges: e.target.value })} />

                <label style={labelStyle}>🎯 Goals for Next Week</label>
                <textarea style={taStyle} placeholder="What are your goals for next week?" value={form.nextWeekGoals} onChange={(e) => setForm({ ...form, nextWeekGoals: e.target.value })} />

                <label style={labelStyle}>⭐ Productivity Rating: <strong style={{ color: '#c4b5fd' }}>{form.productivityRating}/10</strong></label>
                <div style={{ display: 'flex', gap: 6, marginBottom: 18, flexWrap: 'wrap' }}>
                  {RATINGS.map((r) => (
                    <button key={r} type="button" onClick={() => setForm({ ...form, productivityRating: r })} style={{
                      width: 34, height: 34, borderRadius: 7, border: '2px solid',
                      borderColor: form.productivityRating === r ? '#7c3aed' : 'rgba(255,255,255,0.1)',
                      backgroundColor: form.productivityRating === r ? '#7c3aed' : 'transparent',
                      color: form.productivityRating === r ? '#fff' : '#9ca3af',
                      cursor: 'pointer', fontWeight: 600, fontSize: 13,
                    }}>{r}</button>
                  ))}
                </div>

                <button type="submit" style={{ width: '100%', padding: 10, backgroundColor: '#7c3aed', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>
                  Submit Review
                </button>
              </form>
            </div>

            <div style={card}>
              <h3 style={{ margin: '0 0 18px', fontSize: 15, fontWeight: 600, color: '#c4b5fd' }}>Past Reviews</h3>
              {loading ? (
                <p style={{ color: '#6b7280' }}>Loading…</p>
              ) : (reviews ?? []).length === 0 ? (
                <p style={{ color: '#6b7280', fontSize: 14 }}>No reviews yet.</p>
              ) : (
                (reviews ?? []).map((review, idx) => (
                  <div key={idx} style={{ borderBottom: '1px solid rgba(139,92,246,0.15)', paddingBottom: 14, marginBottom: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#e5e7eb' }}>
                        Week of {new Date(review.weekStartDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                      <span style={{ fontSize: 13, color: '#a78bfa', fontWeight: 700 }}>{review.productivityRating}/10 ⭐</span>
                    </div>
                    <p style={{ fontSize: 13, color: '#9ca3af', margin: '0 0 4px' }}><strong style={{ color: '#c4b5fd' }}>Wins:</strong> {review.accomplishments}</p>
                    {review.challenges && <p style={{ fontSize: 13, color: '#9ca3af', margin: 0 }}><strong style={{ color: '#c4b5fd' }}>Challenges:</strong> {review.challenges}</p>}
                  </div>
                ))
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default WeeklyReview;
