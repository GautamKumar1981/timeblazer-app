import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/store';
import { fetchToday, fetchBaziChart } from '../store/slices/baziSlice';
import { HourForecast } from '../store/slices/baziSlice';
import Sidebar from '../components/Common/Sidebar';
import Header  from '../components/Common/Header';

const ELEM_COLOR: Record<string, string> = {
  Wood: '#16a34a', Fire: '#dc2626', Earth: '#d97706', Metal: '#6b7280', Water: '#2563eb',
};

const ELEM_ICON: Record<string, string> = {
  Wood: '🌱', Fire: '🔥', Earth: '⛰️', Metal: '⚙️', Water: '💧',
};

const BRANCH_ANIMAL: Record<number, { en: string }> = {
  0: { en: 'Rat' }, 1: { en: 'Ox' }, 2: { en: 'Tiger' },
  3: { en: 'Rabbit' }, 4: { en: 'Dragon' }, 5: { en: 'Snake' },
  6: { en: 'Horse' }, 7: { en: 'Goat' }, 8: { en: 'Monkey' },
  9: { en: 'Rooster' }, 10: { en: 'Dog' }, 11: { en: 'Pig' },
};

const DAILY_REMEDIES: Record<string, { morning: string; afternoon: string; evening: string; wear: string; avoid: string }> = {
  Wood: {
    morning: 'Face East at sunrise. Spend 5 min near greenery — a plant or garden.',
    afternoon: 'Walk barefoot on grass or do gentle stretching to activate growth energy.',
    evening: 'Place fresh flowers on your desk. Read or journal to nurture your mind.',
    wear: 'Green or teal clothing. Jade or aventurine gemstone.',
    avoid: 'Confrontations and metal-heavy environments today.',
  },
  Fire: {
    morning: 'Light a red or orange candle. Set an intention aloud — Fire energy thrives on declaration.',
    afternoon: 'Socialize and collaborate. Fire peaks in the afternoon; schedule key meetings now.',
    evening: 'Watch a sunset or light incense. Avoid screens an hour before sleep.',
    wear: 'Red, orange, or coral. Ruby or carnelian gemstone.',
    avoid: 'Cold foods and isolation. Keep your spirits high.',
  },
  Earth: {
    morning: 'Ground yourself — stand barefoot on the floor and take 5 deep breaths.',
    afternoon: 'Handle practical tasks: organize, plan, and consolidate. Earth energy excels in structure.',
    evening: 'Share a meal with loved ones. Yellow or amber lighting promotes Earth harmony.',
    wear: 'Yellow, beige, or terracotta. Citrine or tiger eye gemstone.',
    avoid: 'Overthinking and indecision. Trust your instincts today.',
  },
  Metal: {
    morning: 'Declutter one space. Metal energy flows when the environment is clean and precise.',
    afternoon: 'Focus on high-priority tasks requiring sharp judgment and clear communication.',
    evening: 'Listen to calming music. White or silver decor enhances Metal chi.',
    wear: 'White, grey, or silver. Clear quartz or white jade gemstone.',
    avoid: 'Scattered plans. Complete what you start today.',
  },
  Water: {
    morning: 'Drink a full glass of water mindfully. Meditate near flowing water if possible.',
    afternoon: 'Brainstorm and be creative — Water energy supports innovation and intuition.',
    evening: 'Take a relaxing bath or shower. Blue lighting or a small water feature nearby.',
    wear: 'Navy, black, or deep blue. Black tourmaline or aquamarine gemstone.',
    avoid: 'Rigid schedules. Allow spontaneity and flow.',
  },
};

const StatCard: React.FC<{ label: string; value: React.ReactNode; sub?: string; color?: string }> = ({ label, value, sub, color = '#7c3aed' }) => (
  <div style={{
    backgroundColor: '#fff', borderRadius: 14, padding: '18px 20px',
    border: `1px solid ${color}33`, flex: 1, minWidth: 140,
    boxShadow: '0 2px 8px rgba(124,58,237,0.07)',
  }}>
    <div style={{ fontSize: 10, color: '#9ca3af', marginBottom: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.7 }}>{label}</div>
    <div style={{ fontSize: 22, fontWeight: 800, color }}>{value}</div>
    {sub && <div style={{ fontSize: 11, color: '#6b7280', marginTop: 4 }}>{sub}</div>}
  </div>
);

const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { today, chart, loading } = useAppSelector((s) => s.bazi);
  const { user }   = useAppSelector((s) => s.auth);
  const sub        = useAppSelector((s) => s.subscription.data);

  useEffect(() => {
    dispatch(fetchToday());
    dispatch(fetchBaziChart());
  }, [dispatch]);

  const greeting = new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening';

  // Profile not set up yet
  if (!loading && (today as any)?.profile_required) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8f6ff' }}>
        <Sidebar />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Header />
          <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
            <div style={{ fontSize: 64, marginBottom: 20 }}>🐉</div>
            <h2 style={{ color: '#2e1065', fontSize: 24, fontWeight: 700, margin: '0 0 10px', textAlign: 'center' }}>
              Welcome to DragonHour, {user?.name}!
            </h2>
            <p style={{ color: '#6b7280', fontSize: 15, margin: '0 0 28px', textAlign: 'center', maxWidth: 420 }}>
              Enter your birth date, time, and gender to calculate your personalised Bazi chart and unlock your timing insights.
            </p>
            <button
              onClick={() => navigate('/profile')}
              style={{ padding: '13px 32px', backgroundColor: '#7c3aed', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 16, fontWeight: 700 }}
            >
              🐉 Calculate My Bazi Chart →
            </button>
          </main>
        </div>
      </div>
    );
  }

  const forecast = today?.forecast;
  const dmElem   = today?.day_master?.element ?? chart?.day_master_element;
  const dmColor  = dmElem ? ELEM_COLOR[dmElem] : '#7c3aed';
  const favElems = today?.favorable_elements ?? chart?.favorable_elements ?? [];
  const topHours = forecast?.hours?.filter((h: HourForecast) => h.score >= 75).slice(0, 4) ?? [];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8f6ff' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header />
        <main style={{ flex: 1, padding: '28px 32px', overflowY: 'auto' }}>

          {/* Trial banner */}
          {sub && !sub.has_premium_access && (
            <div style={{ backgroundColor: '#fce7f3', borderRadius: 12, padding: '12px 20px', marginBottom: 20, border: '1px solid #fbcfe8', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13, color: '#9d174d', fontWeight: 600 }}>🔒 Your 7-day trial has ended. Subscribe to unlock all features.</span>
              <button onClick={() => navigate('/upgrade')} style={{ padding: '6px 16px', backgroundColor: '#db2777', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>Upgrade</button>
            </div>
          )}
          {sub?.is_trial_active && (
            <div style={{ backgroundColor: '#ede9fe', borderRadius: 12, padding: '12px 20px', marginBottom: 20, border: '1px solid #c4b5fd', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13, color: '#4c1d95', fontWeight: 600 }}>⏳ Free trial: {sub.trial_days_remaining} day{sub.trial_days_remaining !== 1 ? 's' : ''} remaining</span>
              <button onClick={() => navigate('/upgrade')} style={{ padding: '6px 16px', backgroundColor: '#7c3aed', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>View Plans</button>
            </div>
          )}

          {/* Greeting */}
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 800, color: '#2e1065' }}>
              Good {greeting}, {user?.name} ✨
            </h2>
            <p style={{ color: '#9ca3af', fontSize: 13, margin: 0 }}>
              {new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {/* Top stats row */}
          <div style={{ display: 'flex', gap: 14, marginBottom: 24, flexWrap: 'wrap' }}>
            {forecast && (
              <StatCard label="Today's Rating" value={forecast.rating} sub={`Score: ${Math.round(forecast.score)}/100`} color={forecast.color} />
            )}
            {today?.day_master && (
              <StatCard
                label="Day Master 日主"
                value={<span>{today.day_master.cn} <span style={{ fontSize: 13 }}>{today.day_master.pinyin}</span></span>}
                sub={today.day_master.en}
                color={dmColor}
              />
            )}
            {forecast && (
              <StatCard label="Today's Pillar" value={forecast.pillar.name} sub={`${forecast.pillar.stem.en} · ${forecast.pillar.branch.en}`} color="#7c3aed" />
            )}
            <StatCard
              label="Favorable Elements"
              value={<span style={{ fontSize: 15, display: 'flex', gap: 6, marginTop: 2 }}>{favElems.map((e: string) => <span key={e}>{ELEM_ICON[e]}</span>)}</span>}
              sub={favElems.join(' · ')}
              color="#d97706"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {/* Best Hours Today */}
            <div style={{ backgroundColor: '#fff', borderRadius: 14, padding: 22, border: '1px solid #e8e3f8', boxShadow: '0 2px 8px rgba(124,58,237,0.06)' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#2e1065', marginBottom: 14 }}>⏰ Best Hours Today</div>
              {topHours.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {topHours.map((h: HourForecast) => (
                    <div key={h.branch_index} style={{ display: 'flex', alignItems: 'center', gap: 12, backgroundColor: '#f5f3ff', borderRadius: 8, padding: '10px 14px' }}>
                      <div style={{ minWidth: 52, textAlign: 'center' }}>
                        <div style={{ fontSize: 20, fontWeight: 900, color: '#2e1065', lineHeight: 1.1 }}>{h.pillar_name}</div>
                        <div style={{ fontSize: 9, color: '#6b7280', marginTop: 2 }}>
                          {BRANCH_ANIMAL[h.branch_index]?.en ?? h.branch?.en ?? ''}
                        </div>
                        <div style={{ fontSize: 9, color: ELEM_COLOR[h.stem?.element] ?? '#7c3aed' }}>
                          {h.stem?.element ?? ''}
                        </div>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 11, color: ELEM_COLOR[h.stem.element], fontWeight: 600 }}>{h.time_label}</div>
                        <div style={{ width: '100%', height: 4, backgroundColor: '#e8e3f8', borderRadius: 2, marginTop: 4 }}>
                          <div style={{ width: `${h.score}%`, height: '100%', backgroundColor: h.color, borderRadius: 2 }} />
                        </div>
                      </div>
                      <span style={{ fontSize: 12, color: h.color, fontWeight: 700 }}>{Math.round(h.score)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ color: '#9ca3af', fontSize: 13 }}>No strong hours today — plan lighter activities.</div>
              )}
              <button onClick={() => navigate('/daily')} style={{
                marginTop: 14, width: '100%', padding: '8px 0',
                backgroundColor: '#ede9fe', color: '#6d28d9',
                border: '1px solid #c4b5fd', borderRadius: 8,
                cursor: 'pointer', fontSize: 12, fontWeight: 600,
              }}>
                Full Hourly Breakdown →
              </button>
            </div>

            {/* Quick links (Bazi Chart removed) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { to: '/calendar',        icon: '📅', title: 'Auspicious Calendar',   desc: 'Monthly view of favorable days'          },
                { to: '/business-timing', icon: '💼', title: 'Business Timing',       desc: 'Find dates for meetings & launches'       },
                { to: '/luck-pillars',    icon: '🌀', title: 'Luck Pillars 大运',     desc: 'Your 10-year luck cycle timeline'         },
                { to: '/analytics',       icon: '💎', title: 'Remedies & Charms',     desc: 'Daily remedies, gemstones & amulets'      },
              ].map(({ to, icon, title, desc }) => (
                <div key={to} onClick={() => navigate(to)} style={{
                  backgroundColor: '#fff', borderRadius: 12, padding: '14px 18px',
                  border: '1px solid #e8e3f8', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 14,
                  boxShadow: '0 1px 4px rgba(124,58,237,0.06)',
                }}>
                  <span style={{ fontSize: 24 }}>{icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#2e1065' }}>{title}</div>
                    <div style={{ fontSize: 11, color: '#9ca3af' }}>{desc}</div>
                  </div>
                  <span style={{ color: '#c4b5fd', fontSize: 18 }}>›</span>
                </div>
              ))}
            </div>
          </div>

          {/* Day tips */}
          {(forecast?.tips ?? []).length > 0 && (
            <div style={{ marginTop: 20, backgroundColor: '#fff', borderRadius: 14, padding: '18px 22px', border: '1px solid #e8e3f8', boxShadow: '0 2px 8px rgba(124,58,237,0.06)' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#2e1065', marginBottom: 12 }}>💡 Today's Guidance</div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {forecast!.tips.map((tip: string, i: number) => (
                  <div key={i} style={{
                    flex: 1, minWidth: 200, backgroundColor: '#f5f3ff', borderRadius: 8,
                    padding: '10px 14px', fontSize: 13, color: '#374151', lineHeight: 1.6,
                    border: '1px solid #e8e3f8',
                  }}>{tip}</div>
                ))}
              </div>
            </div>
          )}

          {/* Daily Remedy */}
          {dmElem && DAILY_REMEDIES[dmElem] && (() => {
            const r   = DAILY_REMEDIES[dmElem];
            const col = dmColor;
            return (
              <div style={{ marginTop: 20, backgroundColor: '#fff', borderRadius: 14, padding: '18px 22px', border: `1px solid ${col}33`, boxShadow: '0 2px 8px rgba(124,58,237,0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <span style={{ fontSize: 18 }}>💊</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: col }}>Daily Remedy — {dmElem} {ELEM_ICON[dmElem]} Energy</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                  {[
                    { label: '🌅 Morning', text: r.morning },
                    { label: '☀️ Afternoon', text: r.afternoon },
                    { label: '🌙 Evening', text: r.evening },
                    { label: '👗 Wear Today', text: r.wear },
                  ].map(({ label, text }) => (
                    <div key={label} style={{ backgroundColor: '#f5f3ff', borderRadius: 8, padding: '10px 14px', border: '1px solid #e8e3f8' }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: col, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.4 }}>{label}</div>
                      <div style={{ fontSize: 12, color: '#374151', lineHeight: 1.6 }}>{text}</div>
                    </div>
                  ))}
                </div>
                <div style={{ backgroundColor: '#fef2f2', borderRadius: 8, padding: '8px 14px', border: '1px solid #fecaca', fontSize: 12, color: '#dc2626' }}>
                  <span style={{ fontWeight: 700 }}>⚠️ Avoid: </span>{r.avoid}
                </div>
              </div>
            );
          })()}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
