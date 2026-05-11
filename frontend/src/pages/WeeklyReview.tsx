import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/store';
import { fetchReviews, submitReview } from '../store/slices/analyticsSlice';
import Header from '../components/Common/Header';
import Sidebar from '../components/Common/Sidebar';
import { useIsMobile } from '../hooks/useIsMobile';

const ELEM_COLOR: Record<string, string> = {
  Wood: '#16a34a', Fire: '#dc2626', Earth: '#d97706', Metal: '#6b7280', Water: '#2563eb',
};
const ELEM_ICON: Record<string, string> = {
  Wood: '🌱', Fire: '🔥', Earth: '⛰️', Metal: '⚙️', Water: '💧',
};
const ELEM_WEEK_FOCUS: Record<string, { theme: string; do: string[]; review_q: string }> = {
  Wood: {
    theme: 'Growth & Learning week',
    do: ['Review what new skills or knowledge you gained', 'Did you start anything new? How is it progressing?', 'Where did you grow beyond your comfort zone?'],
    review_q: 'What seed did you plant this week that will grow into something meaningful?',
  },
  Fire: {
    theme: 'Visibility & Connection week',
    do: ['Review key conversations and collaborations', 'Did you communicate your ideas boldly enough?', 'Which relationships moved forward this week?'],
    review_q: 'Where did you shine this week — and where did you hold back your light?',
  },
  Earth: {
    theme: 'Stability & Structure week',
    do: ['Review progress on long-term goals and systems', 'Did you stay grounded under pressure?', 'What did you build or consolidate that will last?'],
    review_q: 'What foundation did you strengthen this week that will support you for months?',
  },
  Metal: {
    theme: 'Precision & Completion week',
    do: ['Review decisions made — were they clear and decisive?', 'What did you finish or close out?', 'Where did quality standards hold firm?'],
    review_q: 'What did you cut away this week to make room for what truly matters?',
  },
  Water: {
    theme: 'Wisdom & Reflection week',
    do: ['Review creative and intuitive work', 'Did you trust your instincts this week?', 'What patterns or insights emerged from reflection?'],
    review_q: 'What wisdom surfaced this week that you would have missed if you had been too busy?',
  },
};

const RATINGS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const ratingColor = (r: number) => r >= 8 ? '#16a34a' : r >= 5 ? '#d97706' : '#dc2626';
const ratingLabel = (r: number) => r >= 9 ? 'Outstanding' : r >= 7 ? 'Strong' : r >= 5 ? 'Steady' : r >= 3 ? 'Challenging' : 'Difficult';

const WeeklyReview: React.FC = () => {
  const dispatch  = useAppDispatch();
  const isMobile  = useIsMobile();
  const { reviews, loading } = useAppSelector((s) => s.analytics);
  const { today, chart }     = useAppSelector((s) => s.bazi);

  const dmElem   = today?.day_master?.element ?? (chart as any)?.day_master?.element ?? 'Water';
  const dmColor  = ELEM_COLOR[dmElem] ?? '#7c3aed';
  const weekFocus = ELEM_WEEK_FOCUS[dmElem] ?? ELEM_WEEK_FOCUS['Water'];
  const favElems: string[] = today?.favorable_elements ?? (chart as any)?.favorable_elements ?? [];

  const [form, setForm] = useState({
    accomplishments: '', challenges: '', nextWeekGoals: '',
    productivityRating: 7, weekStartDate: '',
  });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    dispatch(fetchReviews());
    const now  = new Date();
    const day  = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(new Date(now).setDate(diff));
    setForm(f => ({ ...f, weekStartDate: monday.toISOString().split('T')[0] }));
  }, [dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await dispatch(submitReview(form));
    setSubmitted(true);
    setForm({ accomplishments: '', challenges: '', nextWeekGoals: '', productivityRating: 7, weekStartDate: '' });
    setTimeout(() => setSubmitted(false), 4000);
  };

  const taStyle: React.CSSProperties = {
    width: '100%', padding: '10px 12px', backgroundColor: '#fff',
    border: '1px solid #e2d9f3', borderRadius: 8, fontSize: 14,
    color: '#1f2937', boxSizing: 'border-box', marginBottom: 14,
    resize: 'vertical', minHeight: 80, outline: 'none',
  };
  const labelStyle: React.CSSProperties = { fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 5, fontWeight: 600 };
  const card: React.CSSProperties = { backgroundColor: '#fff', borderRadius: 14, padding: isMobile ? 18 : 24, border: '1px solid #e8e3f8', boxShadow: '0 2px 8px rgba(124,58,237,0.06)' };

  // Average score from past reviews
  const avgScore = reviews && reviews.length > 0
    ? Math.round(reviews.reduce((s, r) => s + (r.productivityRating ?? 0), 0) / reviews.length * 10) / 10
    : null;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8f6ff' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Header />
        <main style={{ flex: 1, padding: isMobile ? 16 : '28px 32px', overflowY: 'auto' }}>

          <h2 style={{ margin: '0 0 4px', fontSize: isMobile ? 18 : 22, fontWeight: 800, color: '#2e1065' }}>📝 Weekly Review</h2>
          <p style={{ color: '#9ca3af', fontSize: 13, margin: '0 0 20px' }}>Reflect, consolidate, and align your next week with your Bazi energy.</p>

          {/* Bazi energy banner */}
          <div style={{ backgroundColor: dmColor + '10', border: `1px solid ${dmColor}30`, borderRadius: 12, padding: '14px 18px', marginBottom: 20, display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div style={{ fontSize: 32, flexShrink: 0 }}>{ELEM_ICON[dmElem]}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: dmColor, marginBottom: 4 }}>
                {ELEM_ICON[dmElem]} {weekFocus.theme}
              </div>
              <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.6, marginBottom: 8 }}>
                Your Day Master is <strong>{dmElem}</strong>. This week's review energy is shaped by that.
                {favElems.length > 0 && <> Favorable elements: {favElems.map(e => `${ELEM_ICON[e]} ${e}`).join(', ')}.</>}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {weekFocus.do.map((q, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, fontSize: 13, color: '#374151' }}>
                    <span style={{ color: dmColor, fontWeight: 700, flexShrink: 0 }}>→</span>
                    <span>{q}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 10, backgroundColor: '#fff', borderRadius: 8, padding: '8px 12px', border: `1px solid ${dmColor}30`, fontSize: 13, color: dmColor, fontStyle: 'italic' }}>
                ✦ Reflection prompt: "{weekFocus.review_q}"
              </div>
            </div>
          </div>

          {/* Stats row */}
          {(reviews?.length ?? 0) > 0 && (
            <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
              {[
                { label: 'Reviews Submitted', value: String(reviews!.length), color: '#7c3aed' },
                { label: 'Avg Productivity', value: avgScore ? `${avgScore}/10` : '—', color: ratingColor(avgScore ?? 0) },
                { label: 'Latest Score', value: reviews![0] ? `${reviews![0].productivityRating}/10` : '—', color: ratingColor(reviews![0]?.productivityRating ?? 0) },
              ].map(s => (
                <div key={s.label} style={{ flex: 1, minWidth: 120, backgroundColor: '#fff', borderRadius: 12, padding: '14px 16px', border: `1px solid ${s.color}22` }}>
                  <div style={{ fontSize: 10, color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 6 }}>{s.label}</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
                </div>
              ))}
            </div>
          )}

          {submitted && (
            <div style={{ backgroundColor: '#d1fae5', color: '#065f46', padding: '12px 16px', borderRadius: 10, marginBottom: 16, fontSize: 14, border: '1px solid #6ee7b7', fontWeight: 600 }}>
              ✓ Weekly review submitted! Well done reflecting.
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 20 }}>

            {/* Review form */}
            <div style={card}>
              <h3 style={{ margin: '0 0 18px', fontSize: 15, fontWeight: 700, color: '#2e1065' }}>New Review</h3>
              <form onSubmit={handleSubmit}>
                <label style={labelStyle}>Week Starting</label>
                <input
                  style={{ ...taStyle, minHeight: 'auto', resize: 'none', marginBottom: 14 } as React.CSSProperties}
                  type="date" value={form.weekStartDate}
                  onChange={e => setForm({ ...form, weekStartDate: e.target.value })} required
                />

                <label style={labelStyle}>✅ Wins & Accomplishments</label>
                <textarea style={taStyle} placeholder="What did you accomplish this week? What are you proud of?" value={form.accomplishments} onChange={e => setForm({ ...form, accomplishments: e.target.value })} required />

                <label style={labelStyle}>⚠️ Challenges & Friction</label>
                <textarea style={taStyle} placeholder="What got in the way? What drained your energy?" value={form.challenges} onChange={e => setForm({ ...form, challenges: e.target.value })} />

                <label style={labelStyle}>🎯 Intentions for Next Week</label>
                <textarea style={taStyle} placeholder={`What will you focus on next week? (${weekFocus.theme})`} value={form.nextWeekGoals} onChange={e => setForm({ ...form, nextWeekGoals: e.target.value })} />

                <label style={labelStyle}>⭐ Productivity Rating: <strong style={{ color: '#7c3aed' }}>{form.productivityRating}/10</strong> — <span style={{ color: ratingColor(form.productivityRating) }}>{ratingLabel(form.productivityRating)}</span></label>
                <div style={{ display: 'flex', gap: 6, marginBottom: 18, flexWrap: 'wrap' }}>
                  {RATINGS.map(r => (
                    <button key={r} type="button" onClick={() => setForm({ ...form, productivityRating: r })} style={{
                      width: 34, height: 34, borderRadius: 8, border: '2px solid',
                      borderColor: form.productivityRating === r ? ratingColor(r) : '#e8e3f8',
                      backgroundColor: form.productivityRating === r ? ratingColor(r) : '#f5f3ff',
                      color: form.productivityRating === r ? '#fff' : '#6b7280',
                      cursor: 'pointer', fontWeight: 700, fontSize: 13,
                    }}>{r}</button>
                  ))}
                </div>

                <button type="submit" style={{ width: '100%', padding: 11, backgroundColor: '#7c3aed', color: '#fff', border: 'none', borderRadius: 9, cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>
                  Submit Review →
                </button>
              </form>
            </div>

            {/* Past reviews */}
            <div style={card}>
              <h3 style={{ margin: '0 0 18px', fontSize: 15, fontWeight: 700, color: '#2e1065' }}>Past Reviews</h3>
              {loading ? (
                <p style={{ color: '#9ca3af' }}>Loading…</p>
              ) : (reviews ?? []).length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px 16px' }}>
                  <div style={{ fontSize: 36, marginBottom: 12 }}>📝</div>
                  <p style={{ color: '#9ca3af', fontSize: 14, margin: 0 }}>No reviews yet. Submit your first one →</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {(reviews ?? []).map((review, idx) => (
                    <div key={idx} style={{ borderBottom: '1px solid #e8e3f8', paddingBottom: 14 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#2e1065' }}>
                          Week of {new Date(review.weekStartDate + 'T00:00:00').toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 11, backgroundColor: ratingColor(review.productivityRating) + '18', color: ratingColor(review.productivityRating), borderRadius: 6, padding: '2px 8px', fontWeight: 700 }}>
                            {ratingLabel(review.productivityRating)}
                          </span>
                          <span style={{ fontSize: 13, color: ratingColor(review.productivityRating), fontWeight: 800 }}>{review.productivityRating}/10</span>
                        </div>
                      </div>
                      {/* Score bar */}
                      <div style={{ width: '100%', height: 4, backgroundColor: '#e8e3f8', borderRadius: 2, marginBottom: 10 }}>
                        <div style={{ width: `${review.productivityRating * 10}%`, height: '100%', backgroundColor: ratingColor(review.productivityRating), borderRadius: 2, transition: 'width 0.4s ease' }} />
                      </div>
                      <p style={{ fontSize: 13, color: '#374151', margin: '0 0 4px', lineHeight: 1.5 }}>
                        <strong style={{ color: '#4c1d95' }}>Wins:</strong> {review.accomplishments}
                      </p>
                      {review.challenges && (
                        <p style={{ fontSize: 12, color: '#9ca3af', margin: 0, lineHeight: 1.5 }}>
                          <strong style={{ color: '#6d28d9' }}>Challenges:</strong> {review.challenges}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default WeeklyReview;
