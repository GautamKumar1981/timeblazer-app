import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { nepaliAPI } from '../services/api';
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

const NepaliPanchang: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'panchang' | 'choghadiya' | 'hora' | 'rashifal' | 'dasha'>('panchang');
  const [dashaData, setDashaData] = useState<any>(null);

  useEffect(() => {
    nepaliAPI.getToday().then((res: any) => {
      setData(res.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (activeTab === 'dasha') {
      nepaliAPI.getDasha().then((res: any) => setDashaData(res.data)).catch(() => {});
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

  if (data?.profile_required) return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8f6ff' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, padding: 32 }}>
        <div style={{ fontSize: 64 }}>🙏</div>
        <h2 style={{ color: '#2e1065', fontSize: 22, fontWeight: 800, textAlign: 'center', margin: 0 }}>Set Up Your Jyotish Profile</h2>
        <p style={{ color: '#6b7280', fontSize: 14, textAlign: 'center', maxWidth: 380, margin: 0 }}>
          Enter your birth details to get your personalised Rashifal, Nakshatra, and Dasha periods.
        </p>
        <button onClick={() => navigate('/nepali-profile')} style={{ padding: '12px 28px', backgroundColor: '#7c3aed', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 15, fontWeight: 700 }}>
          🙏 Set Up Profile →
        </button>
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
            <h2 style={{ margin: 0, fontSize: 24, fontWeight: 900, color: '#2e1065' }}>🙏 Nepali Panchang</h2>
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
              <button key={t.key} onClick={() => setActiveTab(t.key as any)} style={{
                flex: 1, padding: '8px 12px', border: 'none', cursor: 'pointer', borderRadius: 8, whiteSpace: 'nowrap',
                backgroundColor: activeTab === t.key ? '#7c3aed' : 'transparent',
                color: activeTab === t.key ? '#fff' : '#7c3aed',
                fontWeight: activeTab === t.key ? 700 : 500, fontSize: 13,
              }}>{t.label}</button>
            ))}
          </div>

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

              <button onClick={() => navigate('/nepali-profile')} style={{ padding: '10px 22px', backgroundColor: '#ede9fe', color: '#6d28d9', border: '1px solid #c4b5fd', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                Update Jyotish Profile
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
                    display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 8, marginBottom: 6,
                    backgroundColor: s.is_current ? QUALITY_BG[s.quality] : s.quality === 'inauspicious' ? '#fafafa' : '#fafafa',
                    border: `1px solid ${s.is_current ? QUALITY_BORDER[s.quality] : '#f3f4f6'}`,
                    fontWeight: s.is_current ? 700 : 400,
                  }}>
                    <div style={{ fontSize: 16 }}>{s.icon}</div>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: 13, color: s.is_current ? QUALITY_COLOR[s.quality] : '#374151' }}>{s.name_en}</span>
                      <span style={{ fontSize: 12, color: '#9ca3af', marginLeft: 8 }}>{s.start}–{s.end}</span>
                    </div>
                    {s.is_current && <span style={{ fontSize: 11, backgroundColor: '#7c3aed', color: '#fff', borderRadius: 10, padding: '2px 8px', fontWeight: 700 }}>NOW</span>}
                  </div>
                ))}
                <div style={{ fontSize: 12, fontWeight: 700, color: '#6b7280', margin: '14px 0 10px' }}>NIGHTTIME</div>
                {chog.night_slots.map((s: any, i: number) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 8, marginBottom: 6,
                    backgroundColor: '#fafafa', border: '1px solid #f3f4f6',
                  }}>
                    <div style={{ fontSize: 16 }}>{s.icon}</div>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: 13, color: '#374151' }}>{s.name_en}</span>
                      <span style={{ fontSize: 12, color: '#9ca3af', marginLeft: 8 }}>{s.start}–{s.end}</span>
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
                    💡 Rashifal is based on your Moon sign ({rashifal.rashi}). Update your birth details in <button onClick={() => navigate('/nepali-profile')} style={{ background: 'none', border: 'none', color: '#7c3aed', cursor: 'pointer', fontWeight: 700, padding: 0, fontSize: 13 }}>Jyotish Profile</button> for personalised readings.
                  </div>
                </Card>
              ) : (
                <div style={{ textAlign: 'center', padding: 40 }}>
                  <div style={{ fontSize: 48, marginBottom: 14 }}>🙏</div>
                  <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 20 }}>Set up your Jyotish profile to get personalised Rashifal.</p>
                  <button onClick={() => navigate('/nepali-profile')} style={{ padding: '10px 24px', backgroundColor: '#7c3aed', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 700 }}>Set Up Profile</button>
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
                  <button onClick={() => navigate('/nepali-profile')} style={{ padding: '10px 24px', backgroundColor: '#7c3aed', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 700 }}>Set Up Profile</button>
                </div>
              )}
            </div>
          )}

        </main>
      </div>
    </div>
  );
};

export default NepaliPanchang;
