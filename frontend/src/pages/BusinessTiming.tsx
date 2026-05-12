import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/store';
import { fetchBusinessTiming, clearBusinessRecs } from '../store/slices/baziSlice';
import { BusinessRec } from '../store/slices/baziSlice';
import Sidebar from '../components/Common/Sidebar';
import Header  from '../components/Common/Header';
import { useIsMobile } from '../hooks/useIsMobile';

const ACTIVITIES = [
  { key: 'meeting',    icon: '🤝', name: 'Business Meeting',          desc: 'Client meetings, team discussions, negotiations' },
  { key: 'contract',   icon: '📝', name: 'Contract Signing',          desc: 'Legal agreements, MoUs, partnerships' },
  { key: 'launch',     icon: '🚀', name: 'Product / Business Launch', desc: 'New products, services, campaigns' },
  { key: 'investment', icon: '💰', name: 'Investment / Financial',    desc: 'Capital deployment, stock purchases, loans' },
  { key: 'travel',     icon: '✈️', name: 'Business Travel',           desc: 'Overseas trips, site visits, conferences' },
  { key: 'hiring',     icon: '👥', name: 'Hiring / Recruitment',      desc: 'Job offers, onboarding, HR decisions' },
  { key: 'marketing',  icon: '📣', name: 'Marketing / PR Campaign',   desc: 'Launches, announcements, media events' },
];

const ELEM_COLOR: Record<string, string> = {
  Wood: '#16a34a', Fire: '#ef4444', Earth: '#f59e0b', Metal: '#6b7280', Water: '#2563eb',
};

const BusinessTiming: React.FC = () => {
  const dispatch = useAppDispatch();
  const isMobile = useIsMobile();
  const { businessRecs, loading } = useAppSelector((s) => s.bazi);
  const [selected, setSelected] = useState('meeting');
  const [days, setDays] = useState(30);

  useEffect(() => { return () => { dispatch(clearBusinessRecs()); }; }, [dispatch]);

  const handleSearch = () => dispatch(fetchBusinessTiming({ activity: selected, days_ahead: days }));

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8f6ff' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Header />
        <main style={{ flex: 1, padding: isMobile ? 16 : 32, overflowY: 'auto' }}>
          <h2 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 700, color: '#2e1065' }}>
            💼 Business Timing
          </h2>
          <p style={{ color: '#6b7280', fontSize: 13, margin: '0 0 28px' }}>
            Find the most auspicious dates for important business activities.
          </p>

          {/* Activity selector */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: 12, padding: 22, border: '1px solid #ede9fe', marginBottom: 20 }}>
            <div style={{ fontSize: 13, color: '#7c3aed', fontWeight: 600, marginBottom: 14 }}>Select Activity</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
              {ACTIVITIES.map(({ key, icon, name, desc }) => (
                <div
                  key={key}
                  onClick={() => setSelected(key)}
                  style={{
                    padding: '12px 14px', borderRadius: 10, cursor: 'pointer',
                    border: `2px solid ${selected === key ? '#7c3aed' : '#f3f4f6'}`,
                    backgroundColor: selected === key ? '#ede9fe' : '#f5f3ff',
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{ fontSize: 18, marginBottom: 6 }}>{icon}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: selected === key ? '#7c3aed' : '#374151', marginBottom: 3 }}>{name}</div>
                  <div style={{ fontSize: 11, color: '#6b7280' }}>{desc}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 18, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <label style={{ fontSize: 12, color: '#9ca3af' }}>Search within:</label>
                <select
                  value={days}
                  onChange={(e) => setDays(parseInt(e.target.value))}
                  style={{ padding: '7px 10px', backgroundColor: '#e8e3f8', border: '1px solid #e8e3f8', borderRadius: 6, color: '#1f2937', fontSize: 13 }}
                >
                  {[15, 30, 60, 90].map(d => <option key={d} value={d}>{d} days</option>)}
                </select>
              </div>
              <button
                onClick={handleSearch}
                disabled={loading}
                style={{
                  padding: '9px 24px', backgroundColor: '#7c3aed', color: '#fff',
                  border: 'none', borderRadius: 8, cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: 13, fontWeight: 700, opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? 'Analysing…' : 'Find Best Dates →'}
              </button>
            </div>
          </div>

          {/* Results */}
          {businessRecs && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <span style={{ fontSize: 22 }}>{businessRecs.activity && (businessRecs.activity as any).icon}</span>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: '#1f2937' }}>
                    {(businessRecs.activity as any).name}
                  </div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>
                    {(businessRecs.activity as any).description}
                  </div>
                </div>
              </div>

              {businessRecs.recommendations.length === 0 ? (
                <div style={{ color: '#6b7280', fontSize: 14, padding: '20px 0' }}>
                  No strong matches found in the selected period. Try extending to 60 or 90 days.
                </div>
              ) : (
                <div style={{ display: 'grid', gap: 10 }}>
                  {businessRecs.recommendations.map((rec: BusinessRec, i: number) => (
                    <div key={rec.date} style={{
                      backgroundColor: '#ffffff', borderRadius: 10, padding: '16px 20px',
                      border: `1px solid ${i < 3 ? '#7c3aed55' : '#f3f4f6'}`,
                      display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
                    }}>
                      {i < 3 && (
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#f59e0b', minWidth: 24 }}>
                          #{i + 1}
                        </div>
                      )}
                      <div style={{ minWidth: 160 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#1f2937' }}>{rec.day_name}</div>
                        <div style={{ fontSize: 20, fontWeight: 800, color: '#7c3aed' }}>{rec.pillar.name}</div>
                        <div style={{ fontSize: 11, color: '#9ca3af' }}>
                          {rec.pillar.stem.en} · {rec.pillar.branch.en}
                        </div>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                          {rec.day_elements.filter((v,idx,a)=>a.indexOf(v)===idx).map(e => (
                            <span key={e} style={{
                              padding: '2px 9px', borderRadius: 12, fontSize: 11, fontWeight: 600,
                              backgroundColor: ELEM_COLOR[e] + '28', color: ELEM_COLOR[e],
                              border: `1px solid ${ELEM_COLOR[e]}44`,
                            }}>{e}</span>
                          ))}
                        </div>
                        <div style={{ display: 'flex', gap: 16, fontSize: 11, color: '#9ca3af' }}>
                          <span>Activity match: {rec.activity_match}/2</span>
                          <span>Personal match: {rec.personal_match}/2</span>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 22, fontWeight: 800, color: rec.score >= 80 ? '#16a34a' : rec.score >= 50 ? '#f59e0b' : '#ef4444' }}>
                          {rec.score}
                        </div>
                        <div style={{ fontSize: 10, color: '#6b7280' }}>score</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default BusinessTiming;
