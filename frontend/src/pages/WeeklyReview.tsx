import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/store';
import { fetchReviews, submitReview } from '../store/slices/analyticsSlice';
import Header from '../components/Common/Header';
import Sidebar from '../components/Common/Sidebar';

const RATINGS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const card: React.CSSProperties = {
  backgroundColor: '#fff', borderRadius: 14, padding: 24,
  border: '1px solid #e8e3f8', boxShadow: '0 2px 8px rgba(124,58,237,0.06)',
};
const taStyle: React.CSSProperties = {
  width: '100%', padding: '10px 12px', backgroundColor: '#fff',
  border: '1px solid #e2d9f3', borderRadius: 8,
  fontSize: 14, color: '#1f2937', boxSizing: 'border-box',
  marginBottom: 14, resize: 'vertical', minHeight: 90, outline: 'none',
};
const labelStyle: React.CSSProperties = { fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 4, fontWeight: 600 };

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
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8f6ff' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header />
        <main style={{ flex: 1, padding: '28px 32px', overflowY: 'auto' }}>
          <h2 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 800, color: '#2e1065' }}>📝 Weekly Review</h2>
          <p style={{ color: '#9ca3af', fontSize: 13, margin: '0 0 20px' }}>Reflect, consolidate, and align your next week with your Bazi energy.</p>

          {submitted && (
            <div style={{ backgroundColor: '#d1fae5', color: '#065f46', padding: '12px 16px', borderRadius: 10, marginBottom: 16, fontSize: 14, border: '1px solid #6ee7b7' }}>
              ✓ Weekly review submitted!
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            <div style={card}>
              <h3 style={{ margin: '0 0 18px', fontSize: 15, fontWeight: 700, color: '#2e1065' }}>New Review</h3>
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

                <label style={labelStyle}>⭐ Productivity Rating: <strong style={{ color: '#7c3aed' }}>{form.productivityRating}/10</strong></label>
                <div style={{ display: 'flex', gap: 6, marginBottom: 18, flexWrap: 'wrap' }}>
                  {RATINGS.map((r) => (
                    <button key={r} type="button" onClick={() => setForm({ ...form, productivityRating: r })} style={{
                      width: 34, height: 34, borderRadius: 8, border: '2px solid',
                      borderColor: form.productivityRating === r ? '#7c3aed' : '#e8e3f8',
                      backgroundColor: form.productivityRating === r ? '#7c3aed' : '#f5f3ff',
                      color: form.productivityRating === r ? '#fff' : '#6b7280',
                      cursor: 'pointer', fontWeight: 700, fontSize: 13,
                    }}>{r}</button>
                  ))}
                </div>

                <button type="submit" style={{ width: '100%', padding: 11, backgroundColor: '#7c3aed', color: '#fff', border: 'none', borderRadius: 9, cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>
                  Submit Review
                </button>
              </form>
            </div>

            <div style={card}>
              <h3 style={{ margin: '0 0 18px', fontSize: 15, fontWeight: 700, color: '#2e1065' }}>Past Reviews</h3>
              {loading ? (
                <p style={{ color: '#9ca3af' }}>Loading…</p>
              ) : (reviews ?? []).length === 0 ? (
                <p style={{ color: '#9ca3af', fontSize: 14 }}>No reviews yet.</p>
              ) : (
                (reviews ?? []).map((review, idx) => (
                  <div key={idx} style={{ borderBottom: '1px solid #e8e3f8', paddingBottom: 14, marginBottom: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#2e1065' }}>
                        Week of {new Date(review.weekStartDate + 'T00:00:00').toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })}
                      </span>
                      <span style={{ fontSize: 13, color: '#7c3aed', fontWeight: 700 }}>{review.productivityRating}/10 ⭐</span>
                    </div>
                    <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 4px' }}><strong style={{ color: '#4c1d95' }}>Wins:</strong> {review.accomplishments}</p>
                    {review.challenges && <p style={{ fontSize: 13, color: '#9ca3af', margin: 0 }}><strong style={{ color: '#6d28d9' }}>Challenges:</strong> {review.challenges}</p>}
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
