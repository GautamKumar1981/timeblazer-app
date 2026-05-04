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

// ── Tong Shu data tables ──────────────────────────────────────────────────────

const DAY_OFFICERS: Record<string, { name: string; zh: string; energy: string; good: string[]; avoid: string[] }> = {
  Rat:     { name: 'Establish',  zh: '建', energy: 'Foundation energy — ideal for starting new ventures.',
             good:  ['Starting businesses','Signing contracts','Moving homes','Planting seeds'],
             avoid: ['Demolition','Major surgery','Confrontations'] },
  Ox:      { name: 'Remove',     zh: '除', energy: 'Clearing energy — remove obstacles and stagnant chi.',
             good:  ['Decluttering','Ending bad habits','Medical treatments','Letting go'],
             avoid: ['New beginnings','Investments','Weddings'] },
  Tiger:   { name: 'Full',       zh: '滿', energy: 'Abundance energy — celebrations and completion.',
             good:  ['Celebrations','Completing projects','Receiving payments','Feasts'],
             avoid: ['Starting new ventures','Funerals','Conflicts'] },
  Rabbit:  { name: 'Balance',    zh: '平', energy: 'Harmony energy — diplomacy and finding equilibrium.',
             good:  ['Negotiations','Mediation','Partnerships','Travel'],
             avoid: ['Aggressive moves','Legal battles','Major risk-taking'] },
  Dragon:  { name: 'Stable',     zh: '定', energy: 'Stability energy — long-term foundations.',
             good:  ['Long-term planning','Real estate','Commitments','Education'],
             avoid: ['Impulsive decisions','Speculation','Rushing'] },
  Snake:   { name: 'Execute',    zh: '執', energy: 'Action energy — precision and focused work.',
             good:  ['Detailed work','Problem solving','Repairs','Focused study'],
             avoid: ['Major decisions','Weddings','Opening ceremonies'] },
  Horse:   { name: 'Break',      zh: '破', energy: 'Breakthrough energy — demolish to rebuild.',
             good:  ['Breaking bad patterns','Renovation','Ending relationships','Surgery'],
             avoid: ['New projects','Investments','Moving','Weddings'] },
  Goat:    { name: 'Danger',     zh: '危', energy: 'Caution energy — review before proceeding.',
             good:  ['Review and analysis','Conservation','Prayer and meditation','Low-risk activities'],
             avoid: ['Travel by water','High-risk activities','Confrontations','Surgery'] },
  Monkey:  { name: 'Success',    zh: '成', energy: 'Achievement energy — strongest day for launches.',
             good:  ['Product launches','Opening ceremonies','Awards','Promotions'],
             avoid: ['Litigation','Demolition','Breaking partnerships'] },
  Rooster: { name: 'Receive',    zh: '收', energy: 'Harvest energy — collect what you\'ve sown.',
             good:  ['Collecting receivables','Harvesting results','Shopping','Networking'],
             avoid: ['Funerals','Demolition','Aggressive expansion'] },
  Dog:     { name: 'Open',       zh: '開', energy: 'Expansion energy — bold moves and new openings.',
             good:  ['Grand openings','New relationships','Bold decisions','Creative projects'],
             avoid: ['Funerals','Demolition','Cutting ties'] },
  Pig:     { name: 'Close',      zh: '閉', energy: 'Consolidation energy — protect and preserve.',
             good:  ['Private matters','Rest and recovery','Archives','Security work'],
             avoid: ['Public launches','New ventures','Surgery','Major decisions'] },
};

const ELEMENT_WISDOM: Record<string, { focus: string; bestFor: string[]; challenge: string; remedy: string }> = {
  Wood:  { focus: 'Growth & Vision',    bestFor: ['Strategic planning','Education','Creative projects','Networking'],    challenge: 'Overextending',     remedy: 'Wear green or blue; work near plants' },
  Fire:  { focus: 'Visibility & Speed', bestFor: ['Presentations','Pitching ideas','Social events','Brand-building'],    challenge: 'Impulsiveness',     remedy: 'Wear red; light a candle at your desk' },
  Earth: { focus: 'Stability & Trust',  bestFor: ['Property matters','Negotiations','Long-term investments','Family'],   challenge: 'Overthinking',      remedy: 'Wear yellow or brown; use crystals' },
  Metal: { focus: 'Precision & Law',    bestFor: ['Contracts','Legal work','Financial planning','Cutting bad habits'],   challenge: 'Rigidity',          remedy: 'Wear white or gold; declutter your space' },
  Water: { focus: 'Flow & Insight',     bestFor: ['Research','Communication','Travel','Meditation','Creative writing'],  challenge: 'Over-analysis',     remedy: 'Wear black or navy; place water near you' },
};

const BRANCH_HOURS: Record<string, { hours: string; peak: string }> = {
  Rat:     { hours: '23:00 – 01:00', peak: 'Water: deep focus, introspection' },
  Ox:      { hours: '01:00 – 03:00', peak: 'Earth: steady, persistent work' },
  Tiger:   { hours: '03:00 – 05:00', peak: 'Wood: bold decisions, leadership' },
  Rabbit:  { hours: '05:00 – 07:00', peak: 'Wood: creativity, diplomacy' },
  Dragon:  { hours: '07:00 – 09:00', peak: 'Earth: abundance, ambition' },
  Snake:   { hours: '09:00 – 11:00', peak: 'Fire: intellect, strategy' },
  Horse:   { hours: '11:00 – 13:00', peak: 'Fire: speed, networking, visibility' },
  Goat:    { hours: '13:00 – 15:00', peak: 'Earth: creativity, nurturing' },
  Monkey:  { hours: '15:00 – 17:00', peak: 'Metal: strategy, analysis' },
  Rooster: { hours: '17:00 – 19:00', peak: 'Metal: precision, finishing tasks' },
  Dog:     { hours: '19:00 – 21:00', peak: 'Earth: loyalty, consolidation' },
  Pig:     { hours: '21:00 – 23:00', peak: 'Water: rest, wisdom, reflection' },
};

// ── Component ─────────────────────────────────────────────────────────────────

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

  const firstDay  = new Date(year, month - 1, 1).getDay();
  const hasPremium = sub?.has_premium_access ?? true;
  const todayStr  = today.toISOString().split('T')[0];

  const isFreeVisible = (dateStr: string) => {
    const diff = (new Date(dateStr + 'T00:00:00').getTime() - new Date(todayStr + 'T00:00:00').getTime()) / 86400000;
    return diff >= 0 && diff < 7;
  };

  // Tong Shu helpers
  const officer  = selected ? DAY_OFFICERS[selected.pillar.branch.en] : null;
  const stemElem = selected ? ELEMENT_WISDOM[selected.pillar.stem.element] : null;
  const branchHr = selected ? BRANCH_HOURS[selected.pillar.branch.en] : null;

  const chip = (label: string, color: string) => (
    <span key={label} style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 12, margin: '2px 3px 2px 0', backgroundColor: color + '22', color, border: `1px solid ${color}44` }}>
      {label}
    </span>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0f0e1a' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header />
        <main style={{ flex: 1, padding: 32, overflowY: 'auto' }}>
          <h2 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 700, color: '#e9d5ff' }}>📅 Tong Shu Power Planner</h2>
          <p style={{ color: '#6b7280', fontSize: 13, margin: '0 0 20px' }}>
            Chinese almanac calendar — colour-coded by your Bazi element compatibility. Click any day for your personalised power guide.
          </p>

          {/* Subscription banner */}
          {sub && !hasPremium && (
            <div style={{ backgroundColor: 'rgba(124,58,237,0.12)', borderRadius: 12, padding: '16px 20px', border: '1px solid rgba(124,58,237,0.4)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#c4b5fd', marginBottom: 4 }}>✨ Unlock Your Full Monthly Planner</div>
                <div style={{ fontSize: 13, color: '#9ca3af' }}>Subscribe for £2.99/month to access the complete Tong Shu calendar, daily remedies, and strategic timing for every day.</div>
              </div>
              <button onClick={() => navigate('/subscription')} style={{ padding: '10px 24px', backgroundColor: '#7c3aed', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap' }}>
                Subscribe — £2.99/mo
              </button>
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
            {!hasPremium && <div style={{ fontSize: 11, color: '#6b7280', marginLeft: 'auto' }}>🔒 7-day preview — subscribe for full month</div>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 380px' : '1fr', gap: 20, alignItems: 'start' }}>

            {/* ── Calendar grid ── */}
            <div style={{ backgroundColor: '#16152e', borderRadius: 12, padding: 20, border: '1px solid rgba(139,92,246,0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <button onClick={prevMonth} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', color: '#9ca3af', padding: '6px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 16 }}>‹</button>
                <span style={{ fontSize: 16, fontWeight: 700, color: '#e5e7eb' }}>{MONTHS[month - 1]} {year}</span>
                <button onClick={nextMonth} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', color: '#9ca3af', padding: '6px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 16 }}>›</button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4, marginBottom: 8 }}>
                {DAYS.map(d => <div key={d} style={{ textAlign: 'center', fontSize: 11, color: '#6b7280', fontWeight: 600, padding: '4px 0' }}>{d}</div>)}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4 }}>
                {Array.from({ length: firstDay }).map((_, i) => <div key={`b${i}`} />)}

                {(calendar ?? []).map((day: CalendarDay) => {
                  const d       = new Date(day.date + 'T00:00:00');
                  const isToday = day.date === todayStr;
                  const isSel   = selected?.date === day.date;
                  const visible = hasPremium || isFreeVisible(day.date);

                  if (!visible) {
                    return (
                      <div key={day.date} onClick={() => navigate('/subscription')} title="Subscribe to unlock" style={{ aspectRatio: '1', borderRadius: 8, cursor: 'pointer', backgroundColor: '#1a1830', border: '1px solid rgba(255,255,255,0.04)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, opacity: 0.35 }}>
                        <span style={{ fontSize: 12, color: '#4b5563' }}>{d.getDate()}</span>
                        <span style={{ fontSize: 9 }}>🔒</span>
                      </div>
                    );
                  }

                  return (
                    <div key={day.date} onClick={() => setSelected(isSel ? null : day)} style={{ aspectRatio: '1', borderRadius: 8, cursor: 'pointer', backgroundColor: isSel ? day.color + '40' : day.color + '18', border: `1px solid ${isSel ? day.color : day.color + '44'}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, position: 'relative', transition: 'all 0.15s' }}>
                      {isToday && <div style={{ position: 'absolute', top: 3, right: 3, width: 6, height: 6, borderRadius: '50%', backgroundColor: '#8b5cf6' }} />}
                      <span style={{ fontSize: 12, fontWeight: isToday ? 800 : 500, color: '#e5e7eb' }}>{d.getDate()}</span>
                      <span style={{ fontSize: 9, color: day.color }}>{day.pillar.name}</span>
                    </div>
                  );
                })}
              </div>

              {loading && <div style={{ textAlign: 'center', color: '#6b7280', fontSize: 12, marginTop: 12 }}>Loading…</div>}
            </div>

            {/* ── Detail + Tong Shu panel ── */}
            {selected && (
              <div style={{ backgroundColor: '#16152e', borderRadius: 12, border: '1px solid rgba(139,92,246,0.2)', position: 'sticky', top: 20, overflow: 'hidden' }}>

                {/* Day header */}
                <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid rgba(139,92,246,0.15)' }}>
                  <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>
                    {new Date(selected.date + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                  <div style={{ fontSize: 36, fontWeight: 900, color: '#e5e7eb', marginBottom: 2 }}>{selected.pillar.name}</div>
                  <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 10 }}>
                    {selected.pillar.stem.pinyin} · {selected.pillar.branch.en} · {selected.pillar.stem.en}
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                    <span style={{ padding: '4px 14px', borderRadius: 20, backgroundColor: selected.color + '28', color: selected.color, border: `1px solid ${selected.color}55`, fontWeight: 700, fontSize: 13 }}>{selected.rating}</span>
                    {[selected.pillar.stem.element, selected.pillar.branch.element].filter((v, i, a) => a.indexOf(v) === i).map(e => (
                      <span key={e} style={{ padding: '4px 10px', borderRadius: 12, fontSize: 12, backgroundColor: ELEM_COLOR[e] + '28', color: ELEM_COLOR[e], border: `1px solid ${ELEM_COLOR[e]}55` }}>{e}</span>
                    ))}
                  </div>
                  <div style={{ width: '100%', height: 5, backgroundColor: '#1f1f2e', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ width: `${selected.score}%`, height: '100%', backgroundColor: selected.color, borderRadius: 4 }} />
                  </div>
                  <div style={{ fontSize: 11, color: '#4b5563', marginTop: 4 }}>Day Score: {Math.round(selected.score)}/100</div>
                </div>

                {/* Tong Shu Power Planner */}
                <div style={{ padding: '16px 20px', maxHeight: 520, overflowY: 'auto' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#a78bfa', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14 }}>
                    📖 Tong Shu Power Guide
                  </div>

                  {/* Day Officer */}
                  {officer && (
                    <div style={{ backgroundColor: 'rgba(139,92,246,0.1)', borderRadius: 10, padding: '12px 14px', marginBottom: 12, border: '1px solid rgba(139,92,246,0.2)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                        <span style={{ fontSize: 24, fontWeight: 900, color: '#c4b5fd' }}>{officer.zh}</span>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: '#e9d5ff' }}>Day Officer: {officer.name}</div>
                          <div style={{ fontSize: 12, color: '#9ca3af' }}>{officer.energy}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Good For */}
                  {officer && (
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#4ade80', marginBottom: 6 }}>✅ Auspicious Activities</div>
                      <div>{officer.good.map(a => chip(a, '#22c55e'))}</div>
                    </div>
                  )}

                  {/* Avoid */}
                  {officer && (
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#f87171', marginBottom: 6 }}>⚠️ Best to Avoid</div>
                      <div>{officer.avoid.map(a => chip(a, '#ef4444'))}</div>
                    </div>
                  )}

                  {/* Element Wisdom */}
                  {stemElem && (
                    <div style={{ backgroundColor: 'rgba(245,158,11,0.08)', borderRadius: 10, padding: '12px 14px', marginBottom: 12, border: '1px solid rgba(245,158,11,0.2)' }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#fbbf24', marginBottom: 6 }}>⚡ Stem Energy: {stemElem.focus}</div>
                      <div style={{ marginBottom: 8 }}>{stemElem.bestFor.map(a => chip(a, '#f59e0b'))}</div>
                      <div style={{ fontSize: 12, color: '#9ca3af' }}>
                        <span style={{ color: '#fcd34d' }}>Challenge:</span> {stemElem.challenge}
                      </div>
                      <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>
                        <span style={{ color: '#fcd34d' }}>Remedy:</span> {stemElem.remedy}
                      </div>
                    </div>
                  )}

                  {/* Lucky Hour */}
                  {branchHr && (
                    <div style={{ backgroundColor: 'rgba(59,130,246,0.08)', borderRadius: 10, padding: '12px 14px', marginBottom: 14, border: '1px solid rgba(59,130,246,0.2)' }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#93c5fd', marginBottom: 4 }}>🕐 Peak Energy Hour</div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: '#e5e7eb', marginBottom: 2 }}>{branchHr.hours}</div>
                      <div style={{ fontSize: 12, color: '#9ca3af' }}>{branchHr.peak}</div>
                    </div>
                  )}

                  <button onClick={() => navigate(`/daily?date=${selected.date}`)} style={{ width: '100%', padding: '9px 0', backgroundColor: 'rgba(124,58,237,0.15)', color: '#c4b5fd', border: '1px solid rgba(124,58,237,0.3)', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                    ⏰ View Hourly Forecast + Remedies →
                  </button>
                </div>
              </div>
            )}

            {/* Empty state when nothing selected */}
            {!selected && (
              <div style={{ backgroundColor: '#16152e', borderRadius: 12, padding: 30, border: '1px solid rgba(139,92,246,0.2)', textAlign: 'center', color: '#4b5563' }}>
                <div style={{ fontSize: 32, marginBottom: 10 }}>📖</div>
                <div style={{ fontSize: 13, color: '#6b7280' }}>Click a day to open your Tong Shu Power Guide</div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default CalendarView;
