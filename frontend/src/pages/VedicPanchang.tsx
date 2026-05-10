import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { vedicAPI } from '../services/api';
import Sidebar from '../components/Common/Sidebar';
import Header from '../components/Common/Header';

const QUALITY_COLOR: Record<string, string> = {
  excellent: '#065f46', auspicious: '#16a34a', mixed: '#d97706', inauspicious: '#dc2626',
};
const QUALITY_BG: Record<string, string> = {
  excellent: '#d1fae5', auspicious: '#f0fdf4', mixed: '#fef9c3', inauspicious: '#fef2f2',
};
const QUALITY_BORDER: Record<string, string> = {
  excellent: '#6ee7b7', auspicious: '#bbf7d0', mixed: '#fde68a', inauspicious: '#fecaca',
};

const Card: React.FC<{ title: string; children: React.ReactNode; accent?: string }> = ({ title, children, accent = '#7c3aed' }) => (
  <div style={{ backgroundColor: '#fff', borderRadius: 14, padding: 22, border: '1px solid #e8e3f8', boxShadow: '0 2px 8px rgba(124,58,237,0.06)', marginBottom: 16 }}>
    <div style={{ fontSize: 14, fontWeight: 700, color: accent, marginBottom: 14 }}>{title}</div>
    {children}
  </div>
);

const PanchangLimb: React.FC<{ label: string; nameEn: string; nameNp: string; quality: string; detail?: string }> = ({ label, nameEn, nameNp, quality, detail }) => (
  <div style={{
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    padding: '12px 14px', borderRadius: 10, marginBottom: 10,
    backgroundColor: QUALITY_BG[quality] ?? '#f5f3ff',
    border: `1px solid ${QUALITY_BORDER[quality] ?? '#e8e3f8'}`,
  }}>
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 800, color: '#1f2937' }}>{nameEn}</div>
      <div style={{ fontSize: 13, color: '#6b7280' }}>{nameNp}</div>
      {detail && <div style={{ fontSize: 12, color: '#374151', marginTop: 4, lineHeight: 1.5 }}>{detail}</div>}
    </div>
    <div style={{
      padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
      backgroundColor: QUALITY_COLOR[quality] ?? '#7c3aed',
      color: '#fff', flexShrink: 0, marginLeft: 12, marginTop: 2,
    }}>
      {quality.charAt(0).toUpperCase() + quality.slice(1)}
    </div>
  </div>
);

const VedicPanchang: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(false);
  const [activeTab, setActiveTab] = useState<'panchang' | 'choghadiya' | 'hora' | 'rashifal' | 'dasha'>('panchang');
  const [dashaData, setDashaData] = useState<any>(null);
  const [guideOpen, setGuideOpen] = useState(true);

  const TAB_GUIDES: Record<string, { icon: string; title: string; what: string; how: string[] }> = {
    panchang: {
      icon: '📅',
      title: 'What is Panchang?',
      what: 'Panchang is the Vedic almanac — a snapshot of five cosmic qualities (the "five limbs") active at any given moment. Ancient Jyotish practitioners used it to choose the most aligned time for any important action.',
      how: [
        'Tithi (Lunar Day): The Moon\'s phase relative to the Sun. Auspicious tithis favor new beginnings, ceremonies, and signing agreements. Inauspicious tithis are better for routine work.',
        'Vara (Weekday): Each weekday is ruled by a planet. Check the ruling planet\'s strengths — Sunday (Sun) for authority, Monday (Moon) for nurturing, Thursday (Jupiter) for wisdom and finance.',
        'Nakshatra (Moon Star): The constellation the Moon occupies today. It shapes the emotional and mental quality of the day. Auspicious nakshatras support new ventures; inauspicious ones call for caution.',
        'Yoga (Sun + Moon): A combination of the Sun and Moon\'s positions. Each yoga carries a distinct character — some energize action, others invite rest.',
        'Karana (Half Day): A half-tithi unit that fine-tunes timing within the day. Watch for Vishti (Bhadra) Karana — it is generally unfavorable for new starts.',
      ],
    },
    choghadiya: {
      icon: '⏰',
      title: 'What is Choghadiya?',
      what: 'Choghadiya divides the day and night into 8 equal segments, each ruled by a planetary energy. It is the most practical Vedic tool for choosing the right hour for a specific task.',
      how: [
        'Amrit (✨ Excellent): Best for any auspicious activity — signing contracts, starting business, travel, or launching projects.',
        'Shubh (🌟 Auspicious): Good for all positive activities — meetings, education, creative work, and new relationships.',
        'Char (🚀 Auspicious): Favors movement and change — ideal for travel, relocation, and dynamic activities.',
        'Labh (💰 Auspicious): Excellent for business, finance, trade, and profit-seeking activities.',
        'Udveg (😰 Inauspicious): Best for government-related work only. Avoid personal or financial decisions.',
        'Rog (🚫 Inauspicious): Avoid starting important activities. Routine, maintenance, or medical treatment is acceptable.',
        'Kaal (⚠️ Inauspicious): Avoid new beginnings entirely. Rest, reflect, or handle existing tasks only.',
        'Rahu Kaal: A fixed inauspicious window each day based on the weekday. Never start something new during Rahu Kaal.',
      ],
    },
    hora: {
      icon: '🪐',
      title: 'What is Hora?',
      what: 'Hora is the system of planetary hours — every clock hour from midnight is ruled by one of 7 planets in a fixed sequence. Unlike Choghadiya, Hora gives you a planet-specific energy to align your task with, hour by hour.',
      how: [
        'Sun Hora ☀️: Authority, health, government. Use it for leadership decisions, dealing with officials, or boosting confidence.',
        'Moon Hora 🌙: Emotions, public relations, travel. Best for nurturing conversations, creative intuition, and connecting with people.',
        'Mars Hora 🔴: Courage, energy, property. Good for taking bold action, exercise, property dealings, and tackling tough tasks.',
        'Mercury Hora 💚: Communication, business, writing. The best hora for negotiations, learning, writing, and trade.',
        'Jupiter Hora 🟠: Wisdom, expansion, finance. Excellent for all auspicious activities, financial decisions, education, and spiritual practices.',
        'Venus Hora 💗: Relationships, arts, beauty. Ideal for creative projects, social activities, and matters of love and harmony.',
        'Saturn Hora ⚫: Discipline, hard work, karma. Best for long-term planning, focused deep work, and resolving karmic obligations.',
      ],
    },
    rashifal: {
      icon: '⭐',
      title: 'What is Rashifal?',
      what: 'Rashifal is your daily reading based on your Janma Rashi — the Moon sign you were born under. In Vedic astrology, the Moon governs the mind and emotions, making the Moon sign more personally significant than the Sun sign.',
      how: [
        'Your Janma Rashi is determined by the Moon\'s position at your birth. It is fixed for life.',
        'The daily Rashifal reflects how today\'s planetary transits interact with your natal Moon — affecting your mental energy, focus, and opportunities.',
        'Use it as a thematic lens: if the reading says "partnerships are favored today", prioritise collaborative work. If it says "avoid impulsive decisions", plan rather than act.',
        'Rashifal is a general guide, not a prediction. It works best when combined with Panchang and Choghadiya for specific timing.',
        'Requires your birth city in your profile — the Moon\'s exact position at birth is location-sensitive.',
      ],
    },
    dasha: {
      icon: '🌀',
      title: 'What is Vimshottari Dasha?',
      what: 'Dasha is a planetary period system unique to Vedic astrology. Life is divided into a 120-year cycle of major planetary periods (Mahadasha) and sub-periods (Antardasha). Each period amplifies the energy and lessons of its ruling planet.',
      how: [
        'Mahadasha (Major Period): The dominant planetary influence over a multi-year stretch of life. It sets the broad theme — your general fortunes, relationships, health, and career direction during that era.',
        'Antardasha (Sub-Period): A planet within the Mahadasha that adds a secondary flavor. It shifts every few months to years, creating distinct phases inside the major period.',
        'Sun Dasha: Authority, health, recognition. Career peaks and relationship with father.',
        'Moon Dasha: Emotions, nurturing, public life. Travel, creative sensitivity, and family focus.',
        'Mars Dasha: Ambition, property, energy. Disputes, boldness, and drive for achievement.',
        'Mercury Dasha: Business, intellect, communication. Best for education, trade, and analytical work.',
        'Jupiter Dasha: Wisdom, wealth, expansion. Often the most prosperous and spiritually fulfilling period.',
        'Venus Dasha: Relationships, luxury, arts. Favors partnerships, creativity, and material comforts.',
        'Saturn Dasha: Discipline, karma, hard work. Brings long delays but lasting rewards through perseverance.',
        'Rahu/Ketu Dasha: Transformations, unconventional paths, and karmic turning points.',
      ],
    },
  };

  useEffect(() => {
    vedicAPI.getToday()
      .then((res: any) => { setData(res.data); })
      .catch(() => { setApiError(true); })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (activeTab === 'dasha') {
      vedicAPI.getDasha()
        .then((res: any) => setDashaData(res.data))
        .catch(() => {});
    }
  }, [activeTab]);

  if (loading) return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8f6ff' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#7c3aed', fontSize: 18, fontWeight: 600 }}>Loading Panchang…</div>
      </div>
    </div>
  );

  if (apiError || !data) return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8f6ff' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header />
        <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, padding: 32 }}>
          <div style={{ fontSize: 48 }}>🙏</div>
          <h2 style={{ color: '#2e1065', fontSize: 20, fontWeight: 800, margin: 0 }}>Could not load Panchang</h2>
          <p style={{ color: '#6b7280', fontSize: 14, maxWidth: 360, textAlign: 'center', margin: 0 }}>
            Please check your connection and try again. If this persists, your birth profile may need to be updated.
          </p>
          <button onClick={() => window.location.reload()} style={{ padding: '10px 24px', backgroundColor: '#7c3aed', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 700 }}>
            Retry
          </button>
        </main>
      </div>
    </div>
  );

  const pan = data?.panchang;
  const chog = data?.choghadiya;
  const hora = data?.current_hora;
  const rashifal = data?.rashifal;
  const bestWindows = data?.best_windows ?? [];

  const TABS = [
    { key: 'panchang',  label: '📅 Panchang'   },
    { key: 'choghadiya',label: '⏰ Choghadiya'  },
    { key: 'hora',      label: '🪐 Hora'        },
    { key: 'rashifal',  label: '⭐ Rashifal'    },
    { key: 'dasha',     label: '🌀 Dasha'       },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8f6ff' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header />
        <main style={{ flex: 1, padding: '28px 32px', overflowY: 'auto', maxWidth: 800, margin: '0 auto', width: '100%' }}>

          {/* Header */}
          <div style={{ marginBottom: 20 }}>
            <h2 style={{ margin: 0, fontSize: 24, fontWeight: 900, color: '#2e1065' }}>🙏 Vedic Panchang</h2>
            {pan && (
              <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginTop: 8 }}>
                <div style={{ fontSize: 14, color: '#374151', fontWeight: 600 }}>
                  {pan.bs_date_str} BS
                </div>
                <div style={{ fontSize: 13, color: '#9ca3af' }}>·</div>
                <div style={{ fontSize: 13, color: '#9ca3af' }}>
                  {new Date(pan.ad_date).toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
                <div style={{
                  padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700,
                  backgroundColor: QUALITY_COLOR[pan.overall?.toLowerCase() === 'excellent' ? 'excellent' : pan.overall?.toLowerCase() === 'good' ? 'auspicious' : pan.overall?.toLowerCase() === 'challenging' ? 'inauspicious' : 'mixed'] ?? '#7c3aed',
                  color: '#fff',
                }}>{pan.overall}</div>
              </div>
            )}
          </div>

          {/* Quick best windows */}
          {bestWindows.length > 0 && (
            <div style={{ backgroundColor: '#d1fae5', borderRadius: 12, padding: '12px 18px', marginBottom: 20, border: '1px solid #6ee7b7', display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#065f46' }}>✨ Auspicious windows today:</span>
              {bestWindows.slice(0, 4).map((w: any, i: number) => (
                <span key={i} style={{ fontSize: 12, backgroundColor: '#fff', color: '#065f46', borderRadius: 6, padding: '3px 10px', border: '1px solid #6ee7b7', fontWeight: 600 }}>
                  {w.name_en} {w.start}–{w.end}
                </span>
              ))}
            </div>
          )}

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 24, backgroundColor: '#f5f3ff', borderRadius: 10, padding: 4, overflowX: 'auto' }}>
            {TABS.map(t => (
              <button key={t.key} onClick={() => { setActiveTab(t.key as any); setGuideOpen(true); }} style={{
                flex: 1, padding: '8px 12px', border: 'none', cursor: 'pointer', borderRadius: 8, whiteSpace: 'nowrap',
                backgroundColor: activeTab === t.key ? '#7c3aed' : 'transparent',
                color: activeTab === t.key ? '#fff' : '#7c3aed',
                fontWeight: activeTab === t.key ? 700 : 500, fontSize: 13,
              }}>{t.label}</button>
            ))}
          </div>

          {/* Per-tab guide */}
          {guideOpen && TAB_GUIDES[activeTab] && (() => {
            const g = TAB_GUIDES[activeTab];
            return (
              <div style={{ backgroundColor: '#f5f3ff', borderRadius: 12, padding: '16px 18px', marginBottom: 20, border: '1px solid #e8e3f8' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#4c1d95' }}>{g.icon} {g.title}</div>
                  <button onClick={() => setGuideOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#a78bfa', fontSize: 18, lineHeight: 1, padding: 0 }} title="Dismiss guide">✕</button>
                </div>
                <p style={{ fontSize: 13, color: '#374151', margin: '0 0 12px', lineHeight: 1.6 }}>{g.what}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {g.how.map((tip, i) => {
                    const colon = tip.indexOf(':');
                    const label = colon > -1 ? tip.slice(0, colon) : null;
                    const body = colon > -1 ? tip.slice(colon + 1).trim() : tip;
                    return (
                      <div key={i} style={{ display: 'flex', gap: 8, fontSize: 13, color: '#374151', lineHeight: 1.55 }}>
                        <span style={{ color: '#7c3aed', fontWeight: 700, flexShrink: 0 }}>→</span>
                        <span>{label ? <><strong style={{ color: '#2e1065' }}>{label}:</strong> {body}</> : body}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* Profile setup banner — only if personalised data missing */}
          {data?.profile_required && (
            <div style={{ backgroundColor: '#ede9fe', borderRadius: 10, padding: '12px 16px', marginBottom: 20, border: '1px solid #c4b5fd', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
              <span style={{ fontSize: 13, color: '#4c1d95' }}>
                Add your birth city in your profile to unlock personalised Rashifal and Dasha readings.
              </span>
              <button onClick={() => navigate('/profile')} style={{ padding: '7px 16px', backgroundColor: '#7c3aed', color: '#fff', border: 'none', borderRadius: 7, cursor: 'pointer', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                Update Profile
              </button>
            </div>
          )}

          {/* Panchang tab */}
          {activeTab === 'panchang' && pan && (
            <div>
              <Card title="पञ्चाङ्ग — The Five Limbs">
                <PanchangLimb label="Tithi — Lunar Day" nameEn={`${pan.tithi.name_en} (${pan.tithi.number})`} nameNp={pan.tithi.name_np} quality={pan.tithi.auspicious ? 'auspicious' : pan.tithi.inauspicious ? 'inauspicious' : 'mixed'} detail={`${pan.tithi.paksha} — ${pan.tithi.auspicious ? 'Favorable for auspicious activities.' : pan.tithi.inauspicious ? 'Avoid major decisions.' : 'Neutral energy.'}`} />
                <PanchangLimb label="Vara — Weekday" nameEn={pan.vara.en} nameNp={pan.vara.np} quality={pan.vara.auspicious ? 'auspicious' : 'mixed'} detail={`Ruled by ${pan.vara.planet} (${pan.vara.planet_np}). ${pan.vara.good_for}`} />
                <PanchangLimb label="Nakshatra — Moon's Star" nameEn={pan.nakshatra.en} nameNp={pan.nakshatra.np} quality={pan.nakshatra.quality} detail={pan.nakshatra.meaning} />
                <PanchangLimb label="Yoga — Sun+Moon" nameEn={pan.yoga.en} nameNp={pan.yoga.np} quality={pan.yoga.quality} />
                <PanchangLimb label="Karana — Half Day" nameEn={pan.karana.en} nameNp={pan.karana.np} quality={pan.karana.quality} detail={pan.karana.is_vishti ? pan.karana.note : ''} />
              </Card>

              {pan.karana.is_vishti && (
                <div style={{ backgroundColor: '#fef2f2', borderRadius: 10, padding: '12px 16px', marginBottom: 16, border: '1px solid #fecaca', fontSize: 13, color: '#dc2626' }}>
                  ⚠️ <strong>Vishti Karana (Bhadra)</strong> is currently active. Avoid starting new work during this period.
                </div>
              )}

              <button onClick={() => navigate('/profile')} style={{ padding: '10px 22px', backgroundColor: '#ede9fe', color: '#6d28d9', border: '1px solid #c4b5fd', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                Update Birth Profile
              </button>
            </div>
          )}

          {/* Choghadiya tab */}
          {activeTab === 'choghadiya' && chog && (
            <div>
              <Card title="⏰ Current Choghadiya">
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px',
                  backgroundColor: QUALITY_BG[chog.current.quality] ?? '#f5f3ff',
                  borderRadius: 12, border: `1px solid ${QUALITY_BORDER[chog.current.quality] ?? '#e8e3f8'}`,
                  marginBottom: 12,
                }}>
                  <div style={{ fontSize: 32 }}>{chog.current.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: QUALITY_COLOR[chog.current.quality] ?? '#7c3aed' }}>
                      {chog.current.name_en} <span style={{ fontSize: 14, fontWeight: 400 }}>({chog.current.name_np})</span>
                    </div>
                    <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>{chog.current.meaning}</div>
                    <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>{chog.current.start} – {chog.current.end}</div>
                  </div>
                </div>
                <div style={{ backgroundColor: '#fef2f2', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#dc2626', border: '1px solid #fecaca' }}>
                  ⚠️ <strong>Rahu Kaal (Kathmandu):</strong> {chog.rahu_kaal.start}–{chog.rahu_kaal.end} NPT — avoid starting new activities.
                </div>
              </Card>

              <Card title="📅 Day Schedule">
                <div style={{ fontSize: 12, fontWeight: 700, color: '#6b7280', marginBottom: 10 }}>DAYTIME</div>
                {chog.day_slots.map((s: any, i: number) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 12px', borderRadius: 8, marginBottom: 6,
                    backgroundColor: s.is_current ? QUALITY_BG[s.quality] : '#fafafa',
                    border: `1px solid ${s.is_current ? QUALITY_BORDER[s.quality] : '#f3f4f6'}`,
                  }}>
                    <div style={{ fontSize: 18, marginTop: 2 }}>{s.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 13, fontWeight: s.is_current ? 700 : 600, color: s.is_current ? QUALITY_COLOR[s.quality] : '#1f2937' }}>{s.name_en}</span>
                        <span style={{ fontSize: 11, color: '#9ca3af' }}>{s.start}–{s.end}</span>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 10, backgroundColor: QUALITY_COLOR[s.quality] ?? '#7c3aed', color: '#fff' }}>
                          {s.quality.charAt(0).toUpperCase() + s.quality.slice(1)}
                        </span>
                        {s.is_current && <span style={{ fontSize: 10, backgroundColor: '#7c3aed', color: '#fff', borderRadius: 10, padding: '1px 7px', fontWeight: 700 }}>NOW</span>}
                      </div>
                      <div style={{ fontSize: 12, color: '#6b7280', marginTop: 3, lineHeight: 1.4 }}>{s.meaning}</div>
                    </div>
                  </div>
                ))}
                <div style={{ fontSize: 12, fontWeight: 700, color: '#6b7280', margin: '14px 0 10px' }}>NIGHTTIME</div>
                {chog.night_slots.map((s: any, i: number) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 12px', borderRadius: 8, marginBottom: 6,
                    backgroundColor: s.is_current ? QUALITY_BG[s.quality] : '#fafafa',
                    border: `1px solid ${s.is_current ? QUALITY_BORDER[s.quality] : '#f3f4f6'}`,
                  }}>
                    <div style={{ fontSize: 18, marginTop: 2 }}>{s.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 13, fontWeight: s.is_current ? 700 : 600, color: s.is_current ? QUALITY_COLOR[s.quality] : '#1f2937' }}>{s.name_en}</span>
                        <span style={{ fontSize: 11, color: '#9ca3af' }}>{s.start}–{s.end}</span>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 10, backgroundColor: QUALITY_COLOR[s.quality] ?? '#7c3aed', color: '#fff' }}>
                          {s.quality.charAt(0).toUpperCase() + s.quality.slice(1)}
                        </span>
                        {s.is_current && <span style={{ fontSize: 10, backgroundColor: '#7c3aed', color: '#fff', borderRadius: 10, padding: '1px 7px', fontWeight: 700 }}>NOW</span>}
                      </div>
                      <div style={{ fontSize: 12, color: '#6b7280', marginTop: 3, lineHeight: 1.4 }}>{s.meaning}</div>
                    </div>
                  </div>
                ))}
              </Card>
            </div>
          )}

          {/* Hora tab */}
          {activeTab === 'hora' && hora && data?.hora_schedule && (
            <div>
              <Card title="🪐 Current Planetary Hour (Hora)">
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 18px', backgroundColor: '#f5f3ff', borderRadius: 12, border: '1px solid #e8e3f8', marginBottom: 12 }}>
                  <div style={{ width: 52, height: 52, borderRadius: '50%', backgroundColor: hora.color + '22', border: `2px solid ${hora.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ fontSize: 20, fontWeight: 900, color: hora.color }}>♄</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: '#2e1065' }}>{hora.planet} Hora</div>
                    <div style={{ fontSize: 13, color: '#6b7280' }}>{hora.planet_np} — {hora.meaning}</div>
                    <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>Changes in {hora.next_hora_in_minutes} minutes</div>
                  </div>
                </div>
              </Card>

              <Card title="📋 24-Hour Hora Schedule (NPT)">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {data.hora_schedule.map((h: any) => (
                    <div key={h.hour} style={{
                      display: 'flex', alignItems: 'center', gap: 10, padding: '7px 12px', borderRadius: 8,
                      backgroundColor: h.is_current ? '#ede9fe' : 'transparent',
                      border: h.is_current ? '1px solid #c4b5fd' : '1px solid transparent',
                      fontWeight: h.is_current ? 700 : 400,
                    }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: h.color, flexShrink: 0 }} />
                      <div style={{ fontSize: 12, color: '#9ca3af', minWidth: 100 }}>{h.time_label}</div>
                      <div style={{ fontSize: 13, color: h.is_current ? '#6d28d9' : '#374151', flex: 1 }}>{h.planet} <span style={{ color: '#9ca3af', fontSize: 12 }}>({h.planet_np})</span></div>
                      {h.is_current && <span style={{ fontSize: 11, backgroundColor: '#7c3aed', color: '#fff', borderRadius: 10, padding: '2px 8px' }}>NOW</span>}
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* Rashifal tab */}
          {activeTab === 'rashifal' && (
            <div>
              {rashifal ? (
                <Card title={`⭐ Today's Rashifal — ${rashifal.rashi} (${rashifal.rashi_np})`}>
                  <div style={{ backgroundColor: '#f5f3ff', borderRadius: 10, padding: '16px 18px', marginBottom: 14, border: '1px solid #e8e3f8' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#7c3aed', marginBottom: 4 }}>Janma Nakshatra</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#2e1065' }}>{rashifal.nakshatra}</div>
                  </div>
                  <div style={{ fontSize: 15, color: '#374151', lineHeight: 1.7, padding: '8px 0' }}>
                    {rashifal.reading}
                  </div>
                  <div style={{ marginTop: 16, backgroundColor: '#ede9fe', borderRadius: 10, padding: '12px 16px', border: '1px solid #c4b5fd', fontSize: 13, color: '#4c1d95' }}>
                    💡 Rashifal is based on your Moon sign ({rashifal.rashi}). Update your birth details in <button onClick={() => navigate('/profile')} style={{ background: 'none', border: 'none', color: '#7c3aed', cursor: 'pointer', fontWeight: 700, padding: 0, fontSize: 13 }}>Birth Profile</button> for personalised readings.
                  </div>
                </Card>
              ) : (
                <div style={{ textAlign: 'center', padding: 40 }}>
                  <div style={{ fontSize: 48, marginBottom: 14 }}>🙏</div>
                  <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 20 }}>Set up your Jyotish profile to get personalised Rashifal.</p>
                  <button onClick={() => navigate('/profile')} style={{ padding: '10px 24px', backgroundColor: '#7c3aed', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 700 }}>Set Up Profile</button>
                </div>
              )}
            </div>
          )}

          {/* Dasha tab */}
          {activeTab === 'dasha' && (
            <div>
              {dashaData ? (
                <>
                  <Card title="🌀 Current Planetary Period (Vimshottari Dasha)">
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
                      <div style={{ flex: 1, minWidth: 160, backgroundColor: `${dashaData.dasha.current_mahadasha.color}11`, borderRadius: 10, padding: '14px 18px', border: `1px solid ${dashaData.dasha.current_mahadasha.color}33` }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: dashaData.dasha.current_mahadasha.color, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Mahadasha (Major Period)</div>
                        <div style={{ fontSize: 20, fontWeight: 800, color: '#2e1065' }}>{dashaData.dasha.current_mahadasha.planet}</div>
                        <div style={{ fontSize: 12, color: '#9ca3af' }}>{dashaData.dasha.current_mahadasha.planet_np}</div>
                        <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>{dashaData.dasha.current_mahadasha.start.slice(0, 7)} → {dashaData.dasha.current_mahadasha.end.slice(0, 7)}</div>
                      </div>
                      <div style={{ flex: 1, minWidth: 160, backgroundColor: `${dashaData.dasha.current_antardasha.color}11`, borderRadius: 10, padding: '14px 18px', border: `1px solid ${dashaData.dasha.current_antardasha.color}33` }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: dashaData.dasha.current_antardasha.color, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Antardasha (Sub-Period)</div>
                        <div style={{ fontSize: 20, fontWeight: 800, color: '#2e1065' }}>{dashaData.dasha.current_antardasha.planet}</div>
                        <div style={{ fontSize: 12, color: '#9ca3af' }}>{dashaData.dasha.current_antardasha.planet_np}</div>
                        <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>Until {dashaData.dasha.current_antardasha.end.slice(0, 10)}</div>
                      </div>
                    </div>
                    <div style={{ backgroundColor: '#f5f3ff', borderRadius: 10, padding: '12px 16px', border: '1px solid #e8e3f8', fontSize: 14, color: '#374151', lineHeight: 1.6 }}>
                      {dashaData.dasha.current_mahadasha.meaning}
                    </div>
                  </Card>

                  <Card title="📊 Mahadasha Timeline (120-year cycle)">
                    {dashaData.dasha.mahadashas.map((d: any) => {
                      const isActive = new Date(d.start) <= new Date() && new Date() < new Date(d.end);
                      return (
                        <div key={d.planet} style={{
                          display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, marginBottom: 6,
                          backgroundColor: isActive ? `${d.color}11` : '#fafafa',
                          border: `1px solid ${isActive ? d.color + '44' : '#f3f4f6'}`,
                          fontWeight: isActive ? 700 : 400,
                        }}>
                          <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: d.color, flexShrink: 0 }} />
                          <div style={{ flex: 1 }}>
                            <span style={{ fontSize: 14, color: isActive ? '#2e1065' : '#6b7280' }}>{d.planet} ({d.planet_np})</span>
                            <span style={{ fontSize: 12, color: '#9ca3af', marginLeft: 10 }}>{d.years} yrs</span>
                          </div>
                          <div style={{ fontSize: 12, color: '#9ca3af' }}>{d.start.slice(0, 4)}–{d.end.slice(0, 4)}</div>
                          {isActive && <span style={{ fontSize: 11, backgroundColor: '#7c3aed', color: '#fff', borderRadius: 10, padding: '2px 8px' }}>ACTIVE</span>}
                        </div>
                      );
                    })}
                  </Card>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: 40 }}>
                  <div style={{ fontSize: 48, marginBottom: 14 }}>🌀</div>
                  <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 20 }}>Set up your Jyotish profile to calculate your Vimshottari Dasha periods.</p>
                  <button onClick={() => navigate('/profile')} style={{ padding: '10px 24px', backgroundColor: '#7c3aed', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 700 }}>Set Up Profile</button>
                </div>
              )}
            </div>
          )}

        </main>
      </div>
    </div>
  );
};

export default VedicPanchang;
