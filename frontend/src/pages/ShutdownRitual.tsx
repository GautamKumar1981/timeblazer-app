import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../store/store';
import { fetchToday } from '../store/slices/baziSlice';
import { timeboxAPI } from '../services/api';
import Sidebar from '../components/Common/Sidebar';
import Header from '../components/Common/Header';
import { useIsMobile } from '../hooks/useIsMobile';

const ELEM_COLOR: Record<string, string> = {
  Wood: '#16a34a', Fire: '#dc2626', Earth: '#d97706', Metal: '#6b7280', Water: '#2563eb',
};
const ELEM_ICON: Record<string, string> = {
  Wood: '🌱', Fire: '🔥', Earth: '⛰️', Metal: '⚙️', Water: '💧',
};

interface Timebox {
  id: number; title: string; completed: boolean; element_type: string;
  start_time: string; end_time: string;
}

const ShutdownRitual: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { today } = useAppSelector((s) => s.bazi);
  const { user } = useAppSelector((s) => s.auth);

  const [step, setStep] = useState(0);
  const [timeboxes, setTimeboxes] = useState<Timebox[]>([]);
  const [reflection, setReflection] = useState({ wins: '', challenges: '', tomorrow: '', energy: '3' });
  const [done, setDone] = useState(false);

  const dmElem = today?.day_master?.element ?? 'Water';
  const dmColor = ELEM_COLOR[dmElem] ?? '#7c3aed';
  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    dispatch(fetchToday());
    timeboxAPI.getAll({ date: todayStr }).then((res: any) => {
      setTimeboxes(res.data?.timeboxes ?? []);
    }).catch(() => {});
  }, [dispatch, todayStr]);

  const toggleComplete = async (tb: Timebox) => {
    try {
      await timeboxAPI.complete(String(tb.id));
      setTimeboxes(prev => prev.map(t => t.id === tb.id ? { ...t, completed: !t.completed } : t));
    } catch (e) {}
  };

  const completedCount = timeboxes.filter(t => t.completed).length;
  const totalCount = timeboxes.length;
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const elementCounts: Record<string, number> = {};
  timeboxes.filter(t => t.completed && t.element_type).forEach(t => {
    elementCounts[t.element_type] = (elementCounts[t.element_type] ?? 0) + 1;
  });

  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toLocaleDateString('en-GB', { weekday: 'long', month: 'long', day: 'numeric' });

  const handleFinish = () => setDone(true);

  if (done) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8f6ff' }}>
        <Sidebar />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <Header />
          <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: isMobile ? 16 : 32 }}>
            <div style={{ fontSize: 72, marginBottom: 20 }}>🌙</div>
            <h2 style={{ color: '#2e1065', fontSize: 26, fontWeight: 800, margin: '0 0 12px', textAlign: 'center' }}>
              Day complete, {user?.name}. Rest well.
            </h2>
            <p style={{ color: '#6b7280', fontSize: 15, maxWidth: 420, textAlign: 'center', margin: '0 0 12px' }}>
              You completed {completedCount}/{totalCount} timeboxes today ({completionRate}%).
            </p>
            <p style={{ color: '#9ca3af', fontSize: 13, maxWidth: 420, textAlign: 'center', margin: '0 0 32px' }}>
              Tomorrow is {tomorrowStr}. Your morning ritual will set the stage again.
            </p>
            <div style={{ display: 'flex', gap: 14 }}>
              <button onClick={() => navigate('/morning-ritual')} style={{ padding: '12px 28px', backgroundColor: '#7c3aed', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 15, fontWeight: 700 }}>
                Tomorrow's Ritual
              </button>
              <button onClick={() => navigate('/dashboard')} style={{ padding: '12px 28px', backgroundColor: '#ede9fe', color: '#6d28d9', border: '1px solid #c4b5fd', borderRadius: 10, cursor: 'pointer', fontSize: 15, fontWeight: 600 }}>
                Dashboard
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8f6ff' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header />
        <main style={{ flex: 1, padding: isMobile ? 16 : '32px 40px', overflowY: 'auto', maxWidth: 760, margin: '0 auto', width: '100%' }}>

          <div style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 13, color: '#9ca3af', fontWeight: 600, marginBottom: 4 }}>
              {new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
            <h2 style={{ margin: 0, fontSize: 26, fontWeight: 900, color: '#2e1065' }}>
              End of Day Ritual 🌙
            </h2>
            <p style={{ color: '#6b7280', margin: '6px 0 0', fontSize: 14 }}>Close the day intentionally. Mark tasks, reflect, and release.</p>
          </div>

          {/* Step tabs */}
          <div style={{ display: 'flex', gap: 0, marginBottom: 28, backgroundColor: '#f5f3ff', borderRadius: 10, padding: 4 }}>
            {['Review Tasks', 'Reflect', 'Close'].map((label, i) => (
              <button key={label} onClick={() => setStep(i)} style={{
                flex: 1, padding: '8px 0', border: 'none', cursor: 'pointer', borderRadius: 8,
                backgroundColor: step === i ? '#7c3aed' : 'transparent',
                color: step === i ? '#fff' : '#7c3aed',
                fontWeight: step === i ? 700 : 500, fontSize: 13, transition: 'all 0.15s',
              }}>{label}</button>
            ))}
          </div>

          {/* Step 0: Review Tasks */}
          {step === 0 && (
            <div>
              <div style={{ backgroundColor: '#fff', borderRadius: 16, padding: 24, border: '1px solid #e8e3f8', marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#2e1065' }}>✅ Today's Timeboxes</div>
                  <div style={{ fontSize: 13, color: '#7c3aed', fontWeight: 600 }}>{completedCount}/{totalCount} complete</div>
                </div>

                {/* Progress bar */}
                <div style={{ width: '100%', height: 6, backgroundColor: '#f5f3ff', borderRadius: 3, marginBottom: 18 }}>
                  <div style={{ width: `${completionRate}%`, height: '100%', backgroundColor: completionRate >= 80 ? '#16a34a' : completionRate >= 50 ? '#d97706' : '#dc2626', borderRadius: 3, transition: 'width 0.3s' }} />
                </div>

                {timeboxes.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '20px 0', color: '#9ca3af', fontSize: 14 }}>No timeboxes were scheduled today.</div>
                )}
                {timeboxes.map(tb => (
                  <div key={tb.id} style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
                    borderRadius: 10, marginBottom: 8, cursor: 'pointer',
                    backgroundColor: tb.completed ? '#f0fdf4' : '#fafafa',
                    border: `1px solid ${tb.completed ? '#bbf7d0' : '#f3f4f6'}`,
                  }} onClick={() => toggleComplete(tb)}>
                    <div style={{
                      width: 20, height: 20, borderRadius: '50%', border: `2px solid ${tb.completed ? '#16a34a' : '#d1d5db'}`,
                      backgroundColor: tb.completed ? '#16a34a' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      {tb.completed && <span style={{ color: '#fff', fontSize: 11 }}>✓</span>}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: tb.completed ? '#166534' : '#374151', textDecoration: tb.completed ? 'line-through' : 'none' }}>
                        {tb.title}
                      </div>
                      <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>
                        {new Date(tb.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – {new Date(tb.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {tb.element_type && <span style={{ marginLeft: 8, color: ELEM_COLOR[tb.element_type] }}>{ELEM_ICON[tb.element_type]} {tb.element_type}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Element balance */}
              {Object.keys(elementCounts).length > 0 && (
                <div style={{ backgroundColor: '#fff', borderRadius: 14, padding: '16px 20px', border: '1px solid #e8e3f8', marginBottom: 20 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#2e1065', marginBottom: 12 }}>🌀 Element Balance Today</div>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    {Object.entries(elementCounts).map(([elem, count]) => (
                      <div key={elem} style={{ display: 'flex', alignItems: 'center', gap: 6, backgroundColor: `${ELEM_COLOR[elem]}11`, borderRadius: 8, padding: '6px 12px', border: `1px solid ${ELEM_COLOR[elem]}33` }}>
                        <span style={{ fontSize: 16 }}>{ELEM_ICON[elem]}</span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: ELEM_COLOR[elem] }}>{elem}</span>
                        <span style={{ fontSize: 12, color: '#6b7280' }}>×{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button onClick={() => setStep(1)} style={{ padding: '12px 32px', backgroundColor: '#7c3aed', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 15, fontWeight: 700 }}>
                Reflect on the Day →
              </button>
            </div>
          )}

          {/* Step 1: Reflect */}
          {step === 1 && (
            <div>
              <div style={{ backgroundColor: '#fff', borderRadius: 16, padding: 24, border: '1px solid #e8e3f8', marginBottom: 20 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#2e1065', marginBottom: 18 }}>🪞 Daily Reflection</div>

                {[
                  { key: 'wins', label: '🏆 What went well today?', placeholder: 'Celebrate your wins, big and small…' },
                  { key: 'challenges', label: '🌊 What was challenging?', placeholder: 'What obstacles did you face?…' },
                  { key: 'tomorrow', label: "🌅 What's your intention for tomorrow?", placeholder: 'One clear intention for tomorrow…' },
                ].map(({ key, label, placeholder }) => (
                  <div key={key} style={{ marginBottom: 18 }}>
                    <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>{label}</label>
                    <textarea
                      rows={3}
                      style={{ width: '100%', padding: '10px 14px', border: '1px solid #e2d9f3', borderRadius: 8, fontSize: 14, color: '#1f2937', resize: 'vertical', boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit' }}
                      placeholder={placeholder}
                      value={reflection[key as keyof typeof reflection]}
                      onChange={(e) => setReflection({ ...reflection, [key]: e.target.value })}
                    />
                  </div>
                ))}

                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 8 }}>⚡ Energy level today (1–5)</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {['1', '2', '3', '4', '5'].map(n => (
                      <button key={n} onClick={() => setReflection({ ...reflection, energy: n })} style={{
                        width: 40, height: 40, borderRadius: '50%', border: `2px solid ${reflection.energy === n ? '#7c3aed' : '#e2d9f3'}`,
                        backgroundColor: reflection.energy === n ? '#7c3aed' : '#fff',
                        color: reflection.energy === n ? '#fff' : '#6b7280',
                        cursor: 'pointer', fontWeight: 700, fontSize: 14,
                      }}>{n}</button>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={() => setStep(0)} style={{ padding: '12px 24px', backgroundColor: '#f5f3ff', color: '#6d28d9', border: '1px solid #c4b5fd', borderRadius: 10, cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>← Back</button>
                <button onClick={() => setStep(2)} style={{ padding: '12px 32px', backgroundColor: '#7c3aed', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 15, fontWeight: 700 }}>Preview & Close →</button>
              </div>
            </div>
          )}

          {/* Step 2: Close */}
          {step === 2 && (
            <div>
              <div style={{ backgroundColor: '#fff', borderRadius: 16, padding: 24, border: '1px solid #e8e3f8', marginBottom: 20 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#2e1065', marginBottom: 18 }}>📋 Day Summary</div>

                <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 18 }}>
                  <div style={{ flex: 1, minWidth: 140, textAlign: 'center', backgroundColor: completionRate >= 70 ? '#f0fdf4' : '#fff7ed', borderRadius: 12, padding: 16, border: `1px solid ${completionRate >= 70 ? '#bbf7d0' : '#fed7aa'}` }}>
                    <div style={{ fontSize: 32, fontWeight: 900, color: completionRate >= 70 ? '#16a34a' : '#d97706' }}>{completionRate}%</div>
                    <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>Tasks completed</div>
                  </div>
                  <div style={{ flex: 1, minWidth: 140, textAlign: 'center', backgroundColor: `${dmColor}11`, borderRadius: 12, padding: 16, border: `1px solid ${dmColor}33` }}>
                    <div style={{ fontSize: 32 }}>{ELEM_ICON[dmElem]}</div>
                    <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>{dmElem} day energy</div>
                  </div>
                  <div style={{ flex: 1, minWidth: 140, textAlign: 'center', backgroundColor: '#f5f3ff', borderRadius: 12, padding: 16, border: '1px solid #e8e3f8' }}>
                    <div style={{ fontSize: 32, fontWeight: 900, color: '#7c3aed' }}>{reflection.energy}/5</div>
                    <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>Your energy level</div>
                  </div>
                </div>

                {reflection.tomorrow && (
                  <div style={{ backgroundColor: '#ede9fe', borderRadius: 10, padding: '12px 16px', border: '1px solid #c4b5fd', marginBottom: 14 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#6d28d9', marginBottom: 4 }}>🌅 Tomorrow's intention:</div>
                    <div style={{ fontSize: 14, color: '#4c1d95' }}>"{reflection.tomorrow}"</div>
                  </div>
                )}

                <div style={{ backgroundColor: '#f5f3ff', borderRadius: 10, padding: '12px 16px', border: '1px solid #e8e3f8' }}>
                  <div style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600 }}>Tomorrow — {tomorrowStr}</div>
                  <div style={{ fontSize: 13, color: '#374151', marginTop: 4 }}>Your morning ritual will begin your next day with intention.</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={() => setStep(1)} style={{ padding: '12px 24px', backgroundColor: '#f5f3ff', color: '#6d28d9', border: '1px solid #c4b5fd', borderRadius: 10, cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>← Back</button>
                <button onClick={handleFinish} style={{ padding: '12px 32px', backgroundColor: '#7c3aed', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 15, fontWeight: 700 }}>
                  Close the Day 🌙
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ShutdownRitual;
