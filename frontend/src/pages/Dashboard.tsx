import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/store';
import { fetchToday, fetchBaziChart } from '../store/slices/baziSlice';
import { HourForecast } from '../store/slices/baziSlice';
import { vedicAPI } from '../services/api';
import Sidebar from '../components/Common/Sidebar';
import Header  from '../components/Common/Header';
import { useIsMobile } from '../hooks/useIsMobile';

const ELEM_COLOR: Record<string, string> = {
  Wood: '#16a34a', Fire: '#dc2626', Earth: '#d97706', Metal: '#6b7280', Water: '#2563eb',
};
const ELEM_ICON: Record<string, string> = {
  Wood: '🌱', Fire: '🔥', Earth: '⛰️', Metal: '⚙️', Water: '💧',
};
const BRANCH_ANIMAL: Record<number, string> = {
  0: 'Rat', 1: 'Ox', 2: 'Tiger', 3: 'Rabbit', 4: 'Dragon', 5: 'Snake',
  6: 'Horse', 7: 'Goat', 8: 'Monkey', 9: 'Rooster', 10: 'Dog', 11: 'Pig',
};
const DAILY_REMEDIES: Record<string, { morning: string; afternoon: string; evening: string; wear: string; avoid: string }> = {
  Wood:  { morning: 'Face East at sunrise. Spend 5 min near greenery.', afternoon: 'Walk barefoot on grass or do gentle stretching.', evening: 'Place fresh flowers on your desk. Read or journal.', wear: 'Green or teal. Jade or aventurine.', avoid: 'Confrontations and metal-heavy environments.' },
  Fire:  { morning: 'Light a candle. Set an intention aloud.', afternoon: 'Socialize and collaborate — Fire peaks now.', evening: 'Watch a sunset or light incense. Avoid screens.', wear: 'Red, orange, or coral. Ruby or carnelian.', avoid: 'Cold foods and isolation.' },
  Earth: { morning: 'Ground yourself — stand barefoot and breathe deeply.', afternoon: 'Organize, plan, and consolidate practical tasks.', evening: 'Share a meal with loved ones. Amber lighting.', wear: 'Yellow, beige, or terracotta. Citrine or tiger eye.', avoid: 'Overthinking and indecision.' },
  Metal: { morning: 'Declutter one space. Metal flows in clean environments.', afternoon: 'Focus on tasks requiring sharp judgment.', evening: 'Listen to calming music. White or silver decor.', wear: 'White, grey, or silver. Clear quartz or white jade.', avoid: 'Scattered plans. Complete what you start.' },
  Water: { morning: 'Drink water mindfully. Meditate near flowing water.', afternoon: 'Brainstorm and create — Water supports intuition.', evening: 'Take a relaxing bath. Blue lighting nearby.', wear: 'Navy, black, or deep blue. Black tourmaline.', avoid: 'Rigid schedules. Allow flow.' },
};

const Card: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ backgroundColor: '#fff', borderRadius: 14, border: '1px solid #e8e3f8', boxShadow: '0 2px 8px rgba(124,58,237,0.06)', ...style }}>
    {children}
  </div>
);

const Dashboard: React.FC = () => {
  const dispatch   = useAppDispatch();
  const navigate   = useNavigate();
  const isMobile   = useIsMobile();
  const { today, chart, loading } = useAppSelector((s) => s.bazi);
  const { user }   = useAppSelector((s) => s.auth);
  const sub        = useAppSelector((s) => s.subscription.data);
  const [vedicToday, setVedicToday] = useState<any>(null);

  useEffect(() => {
    dispatch(fetchToday());
    dispatch(fetchBaziChart());
    vedicAPI.getToday().then((r: any) => setVedicToday(r.data)).catch(() => {});
  }, [dispatch]);

  const greeting = new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening';
  const isAM = new Date().getHours() < 13;

  // ── Onboarding screen ────────────────────────────────────────────────────────
  if (!loading && (today as any)?.profile_required) {
    const FEATURES = [
      { icon: '🀄', title: 'Your Four Pillars Chart', desc: 'Reveal the Bazi pillars of your birth — the elemental blueprint that governs your natural strengths, career, and relationships.' },
      { icon: '⏰', title: 'Daily Timing Intelligence', desc: 'Know which hours of today are aligned with your energy. Stop guessing when to act — let your chart decide.' },
      { icon: '🙏', title: 'Vedic Panchang & Rashifal', desc: 'Get your daily Moon sign reading, Choghadiya windows, and the full Panchang — calibrated to your birth location.' },
      { icon: '🌀', title: 'Luck Pillars & Dasha', desc: 'Understand the 10-year luck cycles shaping your current life phase and what planetary period you are in.' },
    ];
    return (
      <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8f6ff' }}>
        <Sidebar />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <Header />
          <main style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '24px 16px' : '40px 32px' }}>
            {/* Hero */}
            <div style={{ textAlign: 'center', marginBottom: 36 }}>
              <div style={{ fontSize: isMobile ? 52 : 72, marginBottom: 16 }}>🐉</div>
              <h1 style={{ margin: '0 0 10px', fontSize: isMobile ? 22 : 28, fontWeight: 900, color: '#2e1065' }}>
                Welcome to DragonHour, {user?.name}!
              </h1>
              <p style={{ color: '#6b7280', fontSize: isMobile ? 14 : 15, maxWidth: 480, margin: '0 auto 28px', lineHeight: 1.7 }}>
                DragonHour combines Bazi (Four Pillars) and Vedic Jyotish to give you a personalised map of your energy, timing, and destiny. Set up your birth profile to unlock everything.
              </p>
              <button onClick={() => navigate('/profile')} style={{
                padding: '14px 36px', backgroundColor: '#7c3aed', color: '#fff',
                border: 'none', borderRadius: 12, cursor: 'pointer', fontSize: 16, fontWeight: 700,
                boxShadow: '0 4px 16px rgba(124,58,237,0.35)',
              }}>
                🐉 Calculate My Chart — 2 minutes →
              </button>
              <p style={{ color: '#9ca3af', fontSize: 12, marginTop: 12 }}>Birth date · Birth time · Birth location</p>
            </div>

            {/* Feature cards */}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16, maxWidth: 720, margin: '0 auto 36px' }}>
              {FEATURES.map(f => (
                <Card key={f.title} style={{ padding: '18px 20px' }}>
                  <div style={{ fontSize: 28, marginBottom: 10 }}>{f.icon}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#2e1065', marginBottom: 6 }}>{f.title}</div>
                  <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6 }}>{f.desc}</div>
                </Card>
              ))}
            </div>

            {/* Steps */}
            <div style={{ backgroundColor: '#fff', borderRadius: 16, padding: isMobile ? '20px 16px' : '24px 28px', border: '1px solid #e8e3f8', maxWidth: 720, margin: '0 auto' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#2e1065', marginBottom: 16 }}>How to get started</div>
              {[
                { n: 1, text: 'Enter your birth date and exact birth time' },
                { n: 2, text: 'Select your birth country and city (for Vedic moon calculation)' },
                { n: 3, text: 'Your Bazi chart and Panchang unlock instantly' },
              ].map(s => (
                <div key={s.n} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 12 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: '#7c3aed', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13, flexShrink: 0 }}>{s.n}</div>
                  <div style={{ fontSize: 14, color: '#374151', paddingTop: 4 }}>{s.text}</div>
                </div>
              ))}
              <button onClick={() => navigate('/profile')} style={{ marginTop: 8, padding: '11px 28px', backgroundColor: '#7c3aed', color: '#fff', border: 'none', borderRadius: 9, cursor: 'pointer', fontSize: 14, fontWeight: 700 }}>
                Set Up My Profile →
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // ── Main dashboard ────────────────────────────────────────────────────────────
  const forecast = today?.forecast;
  const dmElem   = today?.day_master?.element ?? (chart as any)?.day_master_element;
  const dmColor  = dmElem ? ELEM_COLOR[dmElem] : '#7c3aed';
  const favElems: string[] = today?.favorable_elements ?? (chart as any)?.favorable_elements ?? [];
  const topHours = forecast?.hours?.filter((h: HourForecast) => h.score >= 75).slice(0, 4) ?? [];
  const remedy   = dmElem ? DAILY_REMEDIES[dmElem] : null;

  const col2 = isMobile ? '1fr' : '1fr 1fr';
  const pad  = isMobile ? '16px' : '28px 32px';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8f6ff' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Header />
        <main style={{ flex: 1, padding: pad, overflowY: 'auto' }}>

          {/* Trial banners */}
          {sub && !sub.has_premium_access && !sub.is_trial_active && (
            <div style={{ backgroundColor: '#fce7f3', borderRadius: 12, padding: '11px 16px', marginBottom: 16, border: '1px solid #fbcfe8', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
              <span style={{ fontSize: 13, color: '#9d174d', fontWeight: 600 }}>🔒 Trial ended. Subscribe to unlock all features.</span>
              <button onClick={() => navigate('/upgrade')} style={{ padding: '6px 14px', backgroundColor: '#db2777', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>Upgrade</button>
            </div>
          )}
          {sub?.is_trial_active && !sub?.is_subscribed && (
            <div style={{ backgroundColor: '#ede9fe', borderRadius: 12, padding: '11px 16px', marginBottom: 16, border: '1px solid #c4b5fd', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
              <span style={{ fontSize: 13, color: '#4c1d95', fontWeight: 600 }}>⏳ {sub.trial_days_remaining} day{sub.trial_days_remaining !== 1 ? 's' : ''} left in free trial</span>
              <button onClick={() => navigate('/upgrade')} style={{ padding: '6px 14px', backgroundColor: '#7c3aed', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>View Plans</button>
            </div>
          )}

          {/* Greeting + date */}
          <div style={{ marginBottom: 20 }}>
            <h2 style={{ margin: '0 0 3px', fontSize: isMobile ? 18 : 22, fontWeight: 800, color: '#2e1065' }}>
              Good {greeting}, {user?.name} ✨
            </h2>
            <p style={{ color: '#9ca3af', fontSize: 13, margin: 0 }}>
              {new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              {dmElem && <> · {ELEM_ICON[dmElem]} {dmElem} Day</>}
            </p>
          </div>

          {/* Ritual CTA */}
          <Card style={{ padding: '14px 18px', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ fontSize: 28 }}>{isAM ? '☀️' : '🌙'}</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#2e1065' }}>{isAM ? 'Start your morning ritual' : 'Ready to close the day?'}</div>
                <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>{isAM ? 'Set priorities and schedule your timeboxes.' : 'Review tasks and reflect on today\'s energy.'}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {isAM && <button onClick={() => navigate('/morning-ritual')} style={{ padding: '8px 16px', backgroundColor: '#7c3aed', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>Begin →</button>}
              <button onClick={() => navigate('/shutdown-ritual')} style={{ padding: '8px 16px', backgroundColor: isAM ? '#f5f3ff' : '#7c3aed', color: isAM ? '#6d28d9' : '#fff', border: isAM ? '1px solid #c4b5fd' : 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: isAM ? 600 : 700 }}>
                {isAM ? '🌙 End Day' : 'End of Day Ritual →'}
              </button>
            </div>
          </Card>

          {/* Stats row */}
          {forecast && (
            <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
              {[
                { label: "Today's Rating", value: forecast.rating, sub: `Score ${Math.round(forecast.score)}/100`, color: forecast.color },
                { label: 'Day Master', value: today?.day_master ? `${today.day_master.cn} ${today.day_master.pinyin}` : '—', sub: today?.day_master?.en ?? '', color: dmColor },
                { label: "Today's Pillar", value: forecast.pillar.name, sub: `${forecast.pillar.stem.en} · ${forecast.pillar.branch.en}`, color: '#7c3aed' },
                { label: 'Favorable', value: favElems.map((e: string) => ELEM_ICON[e]).join(' '), sub: favElems.join(' · '), color: '#d97706' },
              ].map(s => (
                <div key={s.label} style={{ flex: 1, minWidth: 130, backgroundColor: '#fff', borderRadius: 12, padding: '14px 16px', border: `1px solid ${s.color}22`, boxShadow: '0 1px 4px rgba(124,58,237,0.06)' }}>
                  <div style={{ fontSize: 10, color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 6 }}>{s.label}</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: s.color }}>{s.value}</div>
                  {s.sub && <div style={{ fontSize: 11, color: '#6b7280', marginTop: 3 }}>{s.sub}</div>}
                </div>
              ))}
            </div>
          )}

          {/* Vedic Panchang card */}
          {vedicToday?.panchang && (
            <Card style={{ padding: '16px 18px', marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#2e1065' }}>🙏 Today's Vedic Panchang</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 12, color: '#9ca3af' }}>{vedicToday.panchang.bs_date_str} BS</span>
                  <span style={{ padding: '2px 9px', borderRadius: 20, fontSize: 11, fontWeight: 700, backgroundColor: vedicToday.panchang.overall_color, color: '#fff' }}>{vedicToday.panchang.overall}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
                {[
                  { label: 'Tithi', value: vedicToday.panchang.tithi.name_en, sub: vedicToday.panchang.tithi.paksha.split(' ')[0] },
                  { label: 'Vara', value: vedicToday.panchang.vara.en, sub: vedicToday.panchang.vara.planet },
                  { label: 'Nakshatra', value: vedicToday.panchang.nakshatra.en, sub: vedicToday.panchang.nakshatra.quality },
                  { label: 'Yoga', value: vedicToday.panchang.yoga.en, sub: vedicToday.panchang.yoga.quality },
                ].map(({ label, value, sub }) => (
                  <div key={label} style={{ flex: 1, minWidth: isMobile ? 'calc(50% - 4px)' : 100, backgroundColor: '#f5f3ff', borderRadius: 8, padding: '8px 10px' }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>{label}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#2e1065' }}>{value}</div>
                    <div style={{ fontSize: 11, color: '#7c3aed' }}>{sub}</div>
                  </div>
                ))}
              </div>
              {vedicToday.choghadiya?.current && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, backgroundColor: '#f0fdf4', borderRadius: 8, padding: '8px 12px', border: '1px solid #bbf7d0', marginBottom: 8 }}>
                  <span style={{ fontSize: 16 }}>{vedicToday.choghadiya.current.icon}</span>
                  <div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#065f46' }}>Now: {vedicToday.choghadiya.current.name_en} Choghadiya</span>
                    <span style={{ fontSize: 12, color: '#6b7280', marginLeft: 8 }}>{vedicToday.choghadiya.current.start}–{vedicToday.choghadiya.current.end}</span>
                    <div style={{ fontSize: 12, color: '#16a34a', marginTop: 2 }}>{vedicToday.choghadiya.current.meaning}</div>
                  </div>
                </div>
              )}
              {vedicToday.rashifal && (
                <div style={{ backgroundColor: '#ede9fe', borderRadius: 8, padding: '8px 12px', border: '1px solid #c4b5fd', fontSize: 13, color: '#4c1d95', marginBottom: 8 }}>
                  <strong>{vedicToday.rashifal.rashi} Rashifal:</strong> {vedicToday.rashifal.reading.slice(0, 100)}…
                </div>
              )}
              <button onClick={() => navigate('/vedic-panchang')} style={{ padding: '7px 14px', backgroundColor: '#ede9fe', color: '#6d28d9', border: '1px solid #c4b5fd', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                Full Panchang & Hora →
              </button>
            </Card>
          )}

          {/* Best hours + Quick links */}
          <div style={{ display: 'grid', gridTemplateColumns: col2, gap: 16, marginBottom: 16 }}>
            <Card style={{ padding: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#2e1065', marginBottom: 14 }}>⏰ Best Hours Today</div>
              {topHours.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {topHours.map((h: HourForecast) => (
                    <div key={h.branch_index} style={{ display: 'flex', alignItems: 'center', gap: 10, backgroundColor: '#f5f3ff', borderRadius: 8, padding: '9px 12px' }}>
                      <div style={{ minWidth: 48, textAlign: 'center' }}>
                        <div style={{ fontSize: 18, fontWeight: 900, color: '#2e1065', lineHeight: 1.1 }}>{h.pillar_name}</div>
                        <div style={{ fontSize: 9, color: '#9ca3af' }}>{BRANCH_ANIMAL[h.branch_index] ?? ''}</div>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 11, color: ELEM_COLOR[h.stem?.element] ?? '#7c3aed', fontWeight: 600 }}>{h.time_label}</div>
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
              <button onClick={() => navigate('/daily')} style={{ marginTop: 12, width: '100%', padding: '8px 0', backgroundColor: '#ede9fe', color: '#6d28d9', border: '1px solid #c4b5fd', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                Full Hourly Breakdown →
              </button>
            </Card>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { to: '/calendar',        icon: '📅', title: 'Auspicious Calendar',  desc: 'Monthly view of favorable days'       },
                { to: '/business-timing', icon: '💼', title: 'Business Timing',      desc: 'Find dates for meetings & launches'   },
                { to: '/luck-pillars',    icon: '🌀', title: 'Luck Pillars 大运',    desc: 'Your 10-year luck cycle timeline'     },
                { to: '/analytics',       icon: '💎', title: 'Remedies & Charms',    desc: 'Daily remedies, gemstones & amulets' },
              ].map(({ to, icon, title, desc }) => (
                <div key={to} onClick={() => navigate(to)} style={{ backgroundColor: '#fff', borderRadius: 12, padding: '12px 16px', border: '1px solid #e8e3f8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 22 }}>{icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#2e1065' }}>{title}</div>
                    <div style={{ fontSize: 11, color: '#9ca3af' }}>{desc}</div>
                  </div>
                  <span style={{ color: '#c4b5fd', fontSize: 18 }}>›</span>
                </div>
              ))}
            </div>
          </div>

          {/* Today's guidance tips */}
          {(forecast?.tips ?? []).length > 0 && (
            <Card style={{ padding: '18px 20px', marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#2e1065', marginBottom: 12 }}>💡 Today's Guidance</div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {forecast!.tips.map((tip: string, i: number) => (
                  <div key={i} style={{ flex: 1, minWidth: isMobile ? '100%' : 200, backgroundColor: '#f5f3ff', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#374151', lineHeight: 1.6, border: '1px solid #e8e3f8' }}>{tip}</div>
                ))}
              </div>
            </Card>
          )}

          {/* Daily remedy */}
          {remedy && dmElem && (
            <Card style={{ padding: '18px 20px', border: `1px solid ${dmColor}22` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <span style={{ fontSize: 16 }}>💊</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: dmColor }}>Daily Remedy — {dmElem} {ELEM_ICON[dmElem]} Energy</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 8, marginBottom: 10 }}>
                {[
                  { label: '🌅 Morning', text: remedy.morning },
                  { label: '☀️ Afternoon', text: remedy.afternoon },
                  { label: '🌙 Evening', text: remedy.evening },
                  { label: '👗 Wear Today', text: remedy.wear },
                ].map(({ label, text }) => (
                  <div key={label} style={{ backgroundColor: '#f5f3ff', borderRadius: 8, padding: '10px 12px', border: '1px solid #e8e3f8' }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: dmColor, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.4 }}>{label}</div>
                    <div style={{ fontSize: 12, color: '#374151', lineHeight: 1.6 }}>{text}</div>
                  </div>
                ))}
              </div>
              <div style={{ backgroundColor: '#fef2f2', borderRadius: 8, padding: '8px 12px', border: '1px solid #fecaca', fontSize: 12, color: '#dc2626' }}>
                <span style={{ fontWeight: 700 }}>⚠️ Avoid: </span>{remedy.avoid}
              </div>
            </Card>
          )}

        </main>
      </div>
    </div>
  );
};

export default Dashboard;
