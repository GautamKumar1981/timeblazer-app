import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/store';
import { fetchReviews, submitReview } from '../store/slices/analyticsSlice';
import Header from '../components/Common/Header';
import Sidebar from '../components/Common/Sidebar';

const RATINGS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

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
    const monday = new Date(now.setDate(diff));
    setForm((f) => ({ ...f, weekStartDate: monday.toISOString().split('T')[0] }));
  }, [dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await dispatch(submitReview(form));
    setSubmitted(true);
    setForm({ accomplishments: '', challenges: '', nextWeekGoals: '', productivityRating: 7, weekStartDate: '' });
    setTimeout(() => setSubmitted(false), 3000);
  };

  const taStyle: React.CSSProperties = { width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box', marginBottom: '14px', resize: 'vertical', minHeight: '90px' };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header />
        <main style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
          <h2 style={{ margin: '0 0 20px', fontSize: '22px', fontWeight: 700, color: '#1f2937' }}>📝 Weekly Review</h2>

          {submitted && (
            <div style={{ backgroundColor: '#d1fae5', color: '#065f46', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>
              ✓ Weekly review submitted!
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            {/* Review Form */}
            <div style={{ backgroundColor: '#fff', borderRadius: '10px', padding: '22px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
              <h3 style={{ margin: '0 0 18px', fontSize: '16px', fontWeight: 600 }}>New Review</h3>
              <form onSubmit={handleSubmit}>
                <label style={{ fontSize: '13px', color: '#6b7280', display: 'block', marginBottom: '4px' }}>Week Starting</label>
                <input
                  style={{ ...taStyle, minHeight: 'auto', resize: 'none' } as React.CSSProperties}
                  type="date"
                  value={form.weekStartDate}
                  onChange={(e) => setForm({ ...form, weekStartDate: e.target.value })}
                  required
                />

                <label style={{ fontSize: '13px', color: '#6b7280', display: 'block', marginBottom: '4px' }}>✅ Accomplishments</label>
                <textarea
                  style={taStyle}
                  placeholder="What did you accomplish this week?"
                  value={form.accomplishments}
                  onChange={(e) => setForm({ ...form, accomplishments: e.target.value })}
                  required
                />

                <label style={{ fontSize: '13px', color: '#6b7280', display: 'block', marginBottom: '4px' }}>⚠️ Challenges</label>
                <textarea
                  style={taStyle}
                  placeholder="What challenges did you face?"
                  value={form.challenges}
                  onChange={(e) => setForm({ ...form, challenges: e.target.value })}
                />

                <label style={{ fontSize: '13px', color: '#6b7280', display: 'block', marginBottom: '4px' }}>🎯 Goals for Next Week</label>
                <textarea
                  style={taStyle}
                  placeholder="What are your goals for next week?"
                  value={form.nextWeekGoals}
                  onChange={(e) => setForm({ ...form, nextWeekGoals: e.target.value })}
                />

                <label style={{ fontSize: '13px', color: '#6b7280', display: 'block', marginBottom: '8px' }}>
                  ⭐ Productivity Rating: <strong style={{ color: '#4f46e5' }}>{form.productivityRating}/10</strong>
                </label>
                <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap' }}>
                  {RATINGS.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setForm({ ...form, productivityRating: r })}
                      style={{
                        width: '34px', height: '34px', borderRadius: '6px', border: '2px solid',
                        borderColor: form.productivityRating === r ? '#4f46e5' : '#e5e7eb',
                        backgroundColor: form.productivityRating === r ? '#4f46e5' : '#fff',
                        color: form.productivityRating === r ? '#fff' : '#374151',
                        cursor: 'pointer', fontWeight: 600, fontSize: '13px',
                      }}
                    >
                      {r}
                    </button>
                  ))}
                </div>

                <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '14px' }}>
                  Submit Review
                </button>
              </form>
            </div>

            {/* Past Reviews */}
            <div style={{ backgroundColor: '#fff', borderRadius: '10px', padding: '22px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
              <h3 style={{ margin: '0 0 18px', fontSize: '16px', fontWeight: 600 }}>Past Reviews</h3>
              {loading ? (
                <p style={{ color: '#9ca3af' }}>Loading...</p>
              ) : (reviews ?? []).length === 0 ? (
                <p style={{ color: '#9ca3af', fontSize: '14px' }}>No reviews yet.</p>
              ) : (
                (reviews ?? []).map((review, idx) => (
                  <div key={idx} style={{ borderBottom: '1px solid #f3f4f6', paddingBottom: '14px', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>
                        Week of {new Date(review.weekStartDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                      <span style={{ fontSize: '13px', color: '#4f46e5', fontWeight: 700 }}>{review.productivityRating}/10 ⭐</span>
                    </div>
                    <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 4px' }}><strong>Wins:</strong> {review.accomplishments}</p>
                    {review.challenges && <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}><strong>Challenges:</strong> {review.challenges}</p>}
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
