import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/store';
import { fetchDailyForecast } from '../store/slices/baziSlice';
import { HourForecast } from '../store/slices/baziSlice';
import Sidebar from '../components/Common/Sidebar';
import Header  from '../components/Common/Header';

const ELEM_COLOR: Record<string, string> = {
  Wood: '#22c55e', Fire: '#ef4444', Earth: '#f59e0b', Metal: '#94a3b8', Water: '#3b82f6',
};

const scoreBar = (score: number, color: string) => (
  <div style={{ width: '100%', height: 4, backgroundColor: '#1f1f2e', borderRadius: 2, overflow: 'hidden' }}>
    <div style={{ width: `${score}%`, height: '100%', backgroundColor: color, borderRadius: 2 }} />
  </div>
);

const Card: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{
    backgroundColor: '#16152e', borderRadius: 12, padding: '20px 22px',
    border: '1px solid rgba(139,92,246,0.18)', marginBottom: 20, ...style,
  }}>
    {children}
  </div>
);

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ fontSize: 13, fontWeight: 700, color: '#c4b5fd', marginBottom: 14, letterSpacing: 0.3 }}>
    {children}
  </div>
);

const DailyForecast: React.FC = () => {
  const dispatch  = useAppDispatch();
  const location  = useLocation();
  const { dailyForecast: forecast, loading } = useAppSelector((s) => s.bazi);

  const urlDate = new URLSearchParams(location.search).get('date');
  const [date, setDate] = useState(urlDate || new Date().toISOString().split('T')[0]);
  const [activeTab, setActiveTab] = useState<'hours' | 'wisdom' | 'remedy' | 'stories'>('hours');

  useEffect(() => { dispatch(fetchDailyForecast(date)); }, [dispatch, date]);

  const pageLayout = (content: React.ReactNode) => (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0f0e1a' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header />
        <main style={{ flex: 1, padding: 32, overflowY: 'auto' }}>{content}</main>
      </div>
    </div>
  );

  if (loading) return pageLayout(<div style={{ color: '#9ca3af' }}>Loading forecast…</div>);

  const wisdom = (forecast as any)?.wisdom;
  const remedy = (forecast as any)?.remedy;
  const pillarStory = (forecast as any)?.pillar_story;

  const tabs = [
    { key: 'hours',   label: '⏰ Hourly Breakdown' },
    { key: 'wisdom',  label: '⚔️ Art of War & Five Rings' },
    { key: 'remedy',  label: '🌿 Remedies' },
    { key: 'stories', label: '📖 Pillar Stories' },
  ] as const;

  return pageLayout(
    <>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#e9d5ff' }}>⏰ Daily Forecast</h2>
          <p style={{ color: '#6b7280', fontSize: 13, margin: '4px 0 0' }}>
            Auspicious hours · Strategic wisdom · Personalised remedies
          </p>
        </div>
        <input
          type="date" value={date}
          onChange={(e) => setDate(e.target.value)}
          style={{
            padding: '8px 12px', backgroundColor: '#16152e',
            border: '1px solid rgba(139,92,246,0.3)', borderRadius: 8,
            color: '#e5e7eb', fontSize: 13,
          }}
        />
      </div>

      {forecast && (
        <>
          {/* Day summary card */}
          <div style={{
            backgroundColor: '#16152e', borderRadius: 12, padding: '20px 24px',
            border: `1px solid ${forecast.color}44`, marginBottom: 24,
            display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap',
          }}>
            <div style={{ textAlign: 'center', minWidth: 80 }}>
              <div style={{ fontSize: 42, fontWeight: 900, color: '#e5e7eb', lineHeight: 1 }}>{forecast.pillar.name}</div>
              <div style={{ fontSize: 11, color: '#6b7280', marginTop: 4 }}>
                {forecast.pillar.stem.pinyin} · {forecast.pillar.branch.pinyin}
              </div>
              <div style={{ display: 'flex', gap: 4, justifyContent: 'center', marginTop: 6 }}>
                <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 8, backgroundColor: (ELEM_COLOR[forecast.pillar.stem.element] || '#8b5cf6') + '22', color: ELEM_COLOR[forecast.pillar.stem.element] }}>
                  {forecast.pillar.stem.element}
                </span>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span style={{
                  padding: '4px 14px', borderRadius: 20, fontSize: 13, fontWeight: 700,
                  backgroundColor: forecast.color + '28', color: forecast.color,
                  border: `1px solid ${forecast.color}55`,
                }}>
                  {forecast.rating}
                </span>
                <span style={{ fontSize: 13, color: '#9ca3af' }}>{Math.round(forecast.score)}/100</span>
                {wisdom && (
                  <span style={{
                    padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                    backgroundColor: wisdom.energy_level === 'high' ? 'rgba(34,197,94,0.15)' : wisdom.energy_level === 'medium' ? 'rgba(245,158,11,0.15)' : 'rgba(59,130,246,0.15)',
                    color: wisdom.energy_level === 'high' ? '#22c55e' : wisdom.energy_level === 'medium' ? '#f59e0b' : '#3b82f6',
                  }}>
                    {wisdom.energy_level === 'high' ? '⚡ High Energy' : wisdom.energy_level === 'medium' ? '〰 Moderate' : '🌊 Low Energy'}
                  </span>
                )}
              </div>
              {scoreBar(forecast.score, forecast.color)}
              <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {forecast.tips.map((t: string, i: number) => (
                  <div key={i} style={{
                    backgroundColor: '#1e1c3a', borderRadius: 8, padding: '7px 11px',
                    fontSize: 12, color: '#d1d5db', border: '1px solid rgba(255,255,255,0.07)',
                    maxWidth: 320,
                  }}>{t}</div>
                ))}
              </div>
            </div>
          </div>

          {/* Tab switcher */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
            {tabs.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                style={{
                  padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600,
                  border: `1px solid ${activeTab === key ? '#8b5cf6' : 'rgba(255,255,255,0.1)'}`,
                  backgroundColor: activeTab === key ? 'rgba(139,92,246,0.2)' : '#16152e',
                  color: activeTab === key ? '#e9d5ff' : '#6b7280',
                  transition: 'all 0.15s',
                }}
              >{label}</button>
            ))}
          </div>

          {/* ── HOURLY TAB ── */}
          {activeTab === 'hours' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
              {forecast.hours.map((h: HourForecast) => (
                <div key={h.branch_index} style={{
                  backgroundColor: '#16152e', borderRadius: 10, padding: '14px 16px',
                  border: `1px solid ${h.color}33`,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div>
                      <div style={{ fontSize: 20, fontWeight: 800, color: '#e5e7eb' }}>{h.pillar_name}</div>
                      <div style={{ fontSize: 10, color: '#6b7280', marginTop: 1 }}>{h.stem.en} · {h.branch.en}</div>
                    </div>
                    <span style={{
                      fontSize: 10, padding: '2px 8px', borderRadius: 10, fontWeight: 600,
                      backgroundColor: h.color + '28', color: h.color,
                    }}>{h.rating}</span>
                  </div>
                  <div style={{ fontSize: 11, color: ELEM_COLOR[h.stem.element], marginBottom: 6 }}>{h.time_label}</div>
                  {scoreBar(h.score, h.color)}
                  <div style={{ marginTop: 6, display: 'flex', gap: 4 }}>
                    {[h.stem.element, h.branch.element].filter((v, i, a) => a.indexOf(v) === i).map(elem => (
                      <span key={elem} style={{
                        fontSize: 10, padding: '1px 6px', borderRadius: 8,
                        backgroundColor: ELEM_COLOR[elem] + '20', color: ELEM_COLOR[elem],
                      }}>{elem}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── WISDOM TAB ── */}
          {activeTab === 'wisdom' && wisdom && (
            <div>
              {/* Art of War */}
              <Card>
                <SectionTitle>⚔️ Art of War — Sun Tzu</SectionTitle>
                <div style={{
                  borderLeft: '3px solid #ef4444', paddingLeft: 16,
                  fontStyle: 'italic', fontSize: 18, color: '#f3f4f6', lineHeight: 1.6, marginBottom: 12,
                }}>
                  "{wisdom.art_of_war.quote}"
                </div>
                <div style={{ fontSize: 13, color: '#9ca3af', marginBottom: 8 }}>
                  {wisdom.art_of_war.context}
                </div>
                <div style={{ fontSize: 11, color: '#4b5563' }}>— {wisdom.art_of_war.source}</div>
              </Card>

              {/* Book of Five Rings */}
              <Card>
                <SectionTitle>🗡️ Book of Five Rings — Miyamoto Musashi</SectionTitle>
                <div style={{
                  borderLeft: '3px solid #8b5cf6', paddingLeft: 16,
                  fontStyle: 'italic', fontSize: 18, color: '#f3f4f6', lineHeight: 1.6, marginBottom: 12,
                }}>
                  "{wisdom.five_rings.quote}"
                </div>
                <div style={{ fontSize: 13, color: '#9ca3af', marginBottom: 8 }}>
                  {wisdom.five_rings.context}
                </div>
                <div style={{ fontSize: 11, color: '#4b5563' }}>— {wisdom.five_rings.source}</div>
              </Card>

              {/* Strategic connection */}
              <Card style={{ backgroundColor: '#1a1830' }}>
                <SectionTitle>🎯 How Today's Energy Maps to Strategy</SectionTitle>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  {[
                    { label: 'Element Governs', value: forecast.pillar.stem.element },
                    { label: 'Energy Level', value: wisdom.energy_level.charAt(0).toUpperCase() + wisdom.energy_level.slice(1) },
                    { label: 'Best for', value: 'Decisions aligned with ' + forecast.pillar.stem.element + ' energy' },
                    { label: 'Avoid', value: wisdom.energy_level === 'low' ? 'Major launches, high-stakes decisions' : 'Excessive caution and hesitation' },
                  ].map(({ label, value }) => (
                    <div key={label} style={{ backgroundColor: '#16152e', borderRadius: 8, padding: '10px 14px' }}>
                      <div style={{ fontSize: 10, color: '#6b7280', marginBottom: 4 }}>{label}</div>
                      <div style={{ fontSize: 13, color: '#d1d5db', fontWeight: 600 }}>{value}</div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* ── REMEDY TAB ── */}
          {activeTab === 'remedy' && remedy && (
            <div>
              {/* Day element remedy */}
              {remedy.day_element_remedy && (
                <Card>
                  <SectionTitle>
                    {remedy.day_element_remedy.emoji} Today's Element: {remedy.day_element} — Balancing Remedies
                  </SectionTitle>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14, marginBottom: 18 }}>
                    {[
                      { icon: '💎', label: 'Crystals', items: remedy.day_element_remedy.crystals },
                      { icon: '🎨', label: 'Colours', items: remedy.day_element_remedy.colors },
                      { icon: '🍽️', label: 'Foods', items: remedy.day_element_remedy.foods },
                      { icon: '🧘', label: 'Activities', items: remedy.day_element_remedy.activities },
                    ].map(({ icon, label, items }) => (
                      <div key={label} style={{ backgroundColor: '#1a1830', borderRadius: 10, padding: '12px 14px' }}>
                        <div style={{ fontSize: 12, color: '#c4b5fd', fontWeight: 600, marginBottom: 8 }}>{icon} {label}</div>
                        {items.map((item: string) => (
                          <div key={item} style={{ fontSize: 12, color: '#9ca3af', padding: '2px 0' }}>· {item}</div>
                        ))}
                      </div>
                    ))}
                  </div>

                  <div style={{ backgroundColor: '#1a1830', borderRadius: 10, padding: '14px 16px', marginBottom: 12 }}>
                    <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 6 }}>🧭 Feng Shui Direction</div>
                    <div style={{ fontSize: 14, color: '#e5e7eb', fontWeight: 600 }}>
                      {remedy.day_element_remedy.direction} — activate this direction today
                    </div>
                    <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 6 }}>{remedy.day_element_remedy.feng_shui_tip}</div>
                  </div>

                  <div style={{
                    backgroundColor: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.3)',
                    borderRadius: 10, padding: '14px 16px',
                  }}>
                    <div style={{ fontSize: 11, color: '#c4b5fd', marginBottom: 6 }}>🌸 Daily Affirmation</div>
                    <div style={{ fontSize: 15, color: '#e9d5ff', fontStyle: 'italic', lineHeight: 1.6 }}>
                      "{remedy.day_element_remedy.affirmation}"
                    </div>
                  </div>
                </Card>
              )}

              {/* Strengthen favourable elements */}
              {remedy.strengthen_elements?.length > 0 && (
                <Card>
                  <SectionTitle>✦ Strengthen Your Favourable Elements Today</SectionTitle>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
                    {remedy.strengthen_elements.map((el: any) => (
                      <div key={el.element} style={{
                        backgroundColor: '#1a1830', borderRadius: 10, padding: '14px 16px',
                        border: `1px solid ${ELEM_COLOR[el.element]}33`,
                      }}>
                        <div style={{ fontSize: 15, fontWeight: 700, color: ELEM_COLOR[el.element], marginBottom: 8 }}>
                          {el.emoji} {el.element}
                        </div>
                        <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 6 }}>
                          💎 {el.crystals.join(', ')}
                        </div>
                        <div style={{ fontSize: 12, color: '#9ca3af' }}>
                          🧭 Face {el.direction} · {el.activities[0]}
                        </div>
                        <div style={{ fontSize: 11, color: ELEM_COLOR[el.element] + 'cc', marginTop: 8, fontStyle: 'italic' }}>
                          "{el.affirmation}"
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* ── STORIES TAB ── */}
          {activeTab === 'stories' && pillarStory && (
            <div>
              <Card>
                <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 16 }}>
                  Today's day pillar is <strong style={{ color: '#c4b5fd' }}>{forecast.pillar.name}</strong> —
                  {' '}{forecast.pillar.stem.en} + {forecast.pillar.branch.en}.
                  Here are the celestial folk stories behind these two characters.
                </div>

                {pillarStory.stem && (
                  <div style={{ marginBottom: 28 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                      <span style={{ fontSize: 36 }}>{pillarStory.stem.emoji}</span>
                      <div>
                        <div style={{ fontSize: 20, fontWeight: 800, color: ELEM_COLOR[forecast.pillar.stem.element] }}>
                          {pillarStory.stem.cn} — {pillarStory.stem.title}
                        </div>
                        <div style={{ fontSize: 12, color: '#6b7280' }}>
                          {pillarStory.stem.element} · Heavenly Stem {pillarStory.stem.stem_index + 1} of 10
                        </div>
                      </div>
                    </div>
                    <div style={{ fontSize: 14, color: '#d1d5db', lineHeight: 1.8, whiteSpace: 'pre-line' }}>
                      {pillarStory.stem.story}
                    </div>
                    {pillarStory.stem.traits && (
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 14 }}>
                        {pillarStory.stem.traits.map((t: string) => (
                          <span key={t} style={{
                            padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                            backgroundColor: ELEM_COLOR[forecast.pillar.stem.element] + '20',
                            color: ELEM_COLOR[forecast.pillar.stem.element],
                          }}>{t}</span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.08)', margin: '20px 0' }} />

                {pillarStory.branch && (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                      <span style={{ fontSize: 36 }}>{pillarStory.branch.emoji}</span>
                      <div>
                        <div style={{ fontSize: 20, fontWeight: 800, color: ELEM_COLOR[forecast.pillar.branch.element] }}>
                          {pillarStory.branch.cn} — {pillarStory.branch.title}
                        </div>
                        <div style={{ fontSize: 12, color: '#6b7280' }}>
                          {pillarStory.branch.animal} · {pillarStory.branch.hour} · {pillarStory.branch.hour_energy}
                        </div>
                      </div>
                    </div>
                    <div style={{ fontSize: 14, color: '#d1d5db', lineHeight: 1.8, whiteSpace: 'pre-line' }}>
                      {pillarStory.branch.story}
                    </div>
                    {pillarStory.branch.traits && (
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 14 }}>
                        {pillarStory.branch.traits.map((t: string) => (
                          <span key={t} style={{
                            padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                            backgroundColor: ELEM_COLOR[forecast.pillar.branch.element] + '20',
                            color: ELEM_COLOR[forecast.pillar.branch.element],
                          }}>{t}</span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </Card>
            </div>
          )}
        </>
      )}
    </>
  );
};

export default DailyForecast;
