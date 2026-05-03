import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/store';
import { fetchCalendar } from '../store/slices/baziSlice';
import { CalendarDay } from '../store/slices/baziSlice';
import Sidebar from '../components/Common/Sidebar';
import Header  from '../components/Common/Header';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

const ELEM_COLOR: Record<string, string> = {
  Wood: '#22c55e', Fire: '#ef4444', Earth: '#f59e0b', Metal: '#94a3b8', Water: '#3b82f6',
};

const CalendarView: React.FC = () => {
  const dispatch  = useAppDispatch();
  const navigate  = useNavigate();
  const { calendar, loading } = useAppSelector((s) => s.bazi);
  const sub = useAppSelector((s) => s.subscription.data);

  const today = new Date();
  const [year,  setYear]  = React.useState(today.getFullYear());
  const [month, setMonth] = React.useState(today.getMonth() + 1);
  const [selected, setSelected] = React.useState<CalendarDay | null>(null);

  useEffect(() => { dispatch(fetchCalendar({ year, month })); }, [dispatch, year, month]);

  const prevMonth = () => { if (month === 1) { setYear(y => y - 1); setMonth(12); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 12) { setYear(y => y + 1); setMonth(1); } else setMonth(m => m + 1); };

  const firstDay = new Date(year, month - 1, 1).getDay();
  const hasPremium = sub?.has_premium_access ?? true;
  const todayStr = today.toISOString().split('T')[0];

  // Days visible for free users: only current week (7 days from today within the same month)
  const isFreeVisible = (dateStr: string) => {
    const diff = (new Date(dateStr + 'T00:00:00').getTime() - new Date(todayStr + 'T00:00:00').getTime()) / 86400000;
    return diff >= 0 && diff < 7;
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0f0e1a' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header />
        <main style={{ flex: 1, padding: 32, overflowY: 'auto' }}>
          <h2 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 700, color: '#e9d5ff' }}>📅 Auspicious Calendar</h2>
          <p style={{ color: '#6b7280', fontSize: 13, margin: '0 0 16px' }}>
            Colour-coded by your personal Bazi element compatibility.
          </p>

          {/* Subscription banner for expired trial */}
          {sub && !hasPremium && (
            <div style={{
              backgroundColor: 'rgba(124,58,237,0.12)', borderRadius: 12, padding: '16px 20px',
              border: '1px solid rgba(124,58,237,0.4)', marginBottom: 20,
              display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#c4b5fd', marginBottom: 4 }}>
                  ✨ Unlock Your Full Monthly Calendar
                </div>
                <div style={{ fontSize: 13, color: '#9ca3af' }}>
                  Your free trial has ended. Subscribe for £2.99/month to see the full month of personalised
                  auspicious days, remedies, and strategic guidance.
                </div>
              </div>
              <button
                onClick={() => navigate('/subscription')}
                style={{
                  padding: '10px 24px', backgroundColor: '#7c3aed', color: '#fff',
                  border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 700,
                  whiteSpace: 'nowrap',
                }}
              >Subscribe — £2.99/mo</button>
            </div>
          )}

          {/* Legend */}
          <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
            {[['#22c55e','Auspicious'],['#f59e0b','Neutral'],['#ef4444','Challenging']].map(([c, l]) => (
              <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: c }} />
                <span style={{ fontSize: 12, color: '#9ca3af' }}>{l}</span>
              </div>
            ))}
            {!hasPremium && (
              <div style={{ fontSize: 11, color: '#6b7280', marginLeft: 'auto' }}>
                🔒 Showing 7-day preview — subscribe for the full month
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 340px' : '1fr', gap: 20, alignItems: 'start' }}>
            {/* Calendar grid */}
            <div style={{ backgroundColor: '#16152e', borderRadius: 12, padding: 20, border: '1px solid rgba(139,92,246,0.2)' }}>
              {/* Month nav */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <button onClick={prevMonth} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', color: '#9ca3af', padding: '6px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 16 }}>‹</button>
                <span style={{ fontSize: 16, fontWeight: 700, color: '#e5e7eb' }}>{MONTHS[month - 1]} {year}</span>
                <button onClick={nextMonth} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', color: '#9ca3af', padding: '6px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 16 }}>›</button>
              </div>

              {/* Day headers */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4, marginBottom: 8 }}>
                {DAYS.map(d => (
                  <div key={d} style={{ textAlign: 'center', fontSize: 11, color: '#6b7280', fontWeight: 600, padding: '4px 0' }}>{d}</div>
                ))}
              </div>

              {/* Day cells */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4, position: 'relative' }}>
                {Array.from({ length: firstDay }).map((_, i) => <div key={`b${i}`} />)}

                {(calendar ?? []).map((day: CalendarDay) => {
                  const d       = new Date(day.date + 'T00:00:00');
                  const isToday = day.date === todayStr;
                  const isSel   = selected?.date === day.date;
                  const visible = hasPremium || isFreeVisible(day.date);

                  if (!visible) {
                    return (
                      <div
                        key={day.date}
                        onClick={() => navigate('/subscription')}
                        title="Subscribe to see full month"
                        style={{
                          aspectRatio: '1', borderRadius: 8, cursor: 'pointer',
                          backgroundColor: '#1a1830',
                          border: '1px solid rgba(255,255,255,0.04)',
                          display: 'flex', flexDirection: 'column',
                          alignItems: 'center', justifyContent: 'center', gap: 2,
                          opacity: 0.35,
                        }}
                      >
                        <span style={{ fontSize: 12, color: '#4b5563' }}>{d.getDate()}</span>
                        <span style={{ fontSize: 9, color: '#374151' }}>🔒</span>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={day.date}
                      onClick={() => setSelected(isSel ? null : day)}
                      style={{
                        aspectRatio: '1', borderRadius: 8, cursor: 'pointer',
                        backgroundColor: isSel ? day.color + '40' : day.color + '18',
                        border: `1px solid ${isSel ? day.color : day.color + '44'}`,
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center', gap: 2,
                        position: 'relative', transition: 'all 0.15s',
                      }}
                    >
                      {isToday && (
                        <div style={{
                          position: 'absolute', top: 3, right: 3,
                          width: 6, height: 6, borderRadius: '50%', backgroundColor: '#8b5cf6',
                        }} />
                      )}
                      <span style={{ fontSize: 12, fontWeight: isToday ? 800 : 500, color: '#e5e7eb' }}>
                        {d.getDate()}
                      </span>
                      <span style={{ fontSize: 9, color: day.color }}>{day.pillar.name}</span>
                    </div>
                  );
                })}
              </div>

              {loading && <div style={{ textAlign: 'center', color: '#6b7280', fontSize: 12, marginTop: 12 }}>Loading…</div>}
            </div>

            {/* Detail panel */}
            <div style={{ backgroundColor: '#16152e', borderRadius: 12, padding: 20, border: '1px solid rgba(139,92,246,0.2)', position: 'sticky', top: 20 }}>
              {selected ? (
                <>
                  <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 10 }}>
                    {new Date(selected.date + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                  <div style={{ fontSize: 38, fontWeight: 900, color: '#e5e7eb', marginBottom: 2 }}>{selected.pillar.name}</div>
                  <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 12 }}>
                    {selected.pillar.stem.pinyin} · {selected.pillar.branch.en} · {selected.pillar.stem.en}
                  </div>
                  <span style={{
                    display: 'inline-block', padding: '5px 14px', borderRadius: 20,
                    backgroundColor: selected.color + '28', color: selected.color,
                    border: `1px solid ${selected.color}55`, fontWeight: 700, fontSize: 13, marginBottom: 14,
                  }}>{selected.rating}</span>
                  <div style={{ marginBottom: 4, fontSize: 11, color: '#6b7280' }}>Score: {Math.round(selected.score)}/100</div>
                  <div style={{ width: '100%', height: 6, backgroundColor: '#1f1f2e', borderRadius: 4, overflow: 'hidden', marginBottom: 16 }}>
                    <div style={{ width: `${selected.score}%`, height: '100%', backgroundColor: selected.color, borderRadius: 4 }} />
                  </div>

                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
                    {[selected.pillar.stem.element, selected.pillar.branch.element].filter((v,i,a)=>a.indexOf(v)===i).map(e => (
                      <span key={e} style={{
                        padding: '3px 10px', borderRadius: 12, fontSize: 12,
                        backgroundColor: ELEM_COLOR[e] + '28', color: ELEM_COLOR[e],
                        border: `1px solid ${ELEM_COLOR[e]}55`,
                      }}>{e}</span>
                    ))}
                  </div>

                  <button
                    onClick={() => navigate(`/daily?date=${selected.date}`)}
                    style={{
                      width: '100%', padding: '9px 0',
                      backgroundColor: 'rgba(124,58,237,0.15)', color: '#c4b5fd',
                      border: '1px solid rgba(124,58,237,0.3)', borderRadius: 8,
                      cursor: 'pointer', fontSize: 12, fontWeight: 600,
                    }}
                  >
                    ⏰ View Hourly Forecast + Remedies →
                  </button>
                </>
              ) : (
                <div style={{ textAlign: 'center', color: '#4b5563', padding: '30px 0' }}>
                  <div style={{ fontSize: 32, marginBottom: 10 }}>📅</div>
                  <div style={{ fontSize: 13 }}>Click a day to see its Bazi details</div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CalendarView;
