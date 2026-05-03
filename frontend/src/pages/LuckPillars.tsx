import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/store';
import { fetchLuckPillars } from '../store/slices/baziSlice';
import { LuckPillar } from '../store/slices/baziSlice';
import Sidebar from '../components/Common/Sidebar';
import Header  from '../components/Common/Header';

const ELEM_COLOR: Record<string, string> = {
  Wood: '#22c55e', Fire: '#ef4444', Earth: '#f59e0b', Metal: '#94a3b8', Water: '#3b82f6',
};

const LuckPillars: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { luckPillars, loading, error } = useAppSelector((s) => s.bazi);

  useEffect(() => { dispatch(fetchLuckPillars()); }, [dispatch]);

  const pageLayout = (content: React.ReactNode) => (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0f0e1a' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header />
        <main style={{ flex: 1, padding: 32, overflowY: 'auto' }}>{content}</main>
      </div>
    </div>
  );

  if (loading) return pageLayout(<div style={{ color: '#9ca3af' }}>Calculating luck pillars…</div>);

  if (error || !luckPillars) return pageLayout(
    <div style={{ textAlign: 'center', paddingTop: 60 }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🌀</div>
      <div style={{ color: '#c4b5fd', fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Profile Required</div>
      <div style={{ color: '#6b7280', fontSize: 14, marginBottom: 24 }}>Set up your birth data to calculate your luck pillars.</div>
      <button onClick={() => navigate('/profile')} style={{
        padding: '10px 24px', backgroundColor: '#7c3aed', color: '#fff',
        border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600,
      }}>Set Up Profile →</button>
    </div>
  );

  return pageLayout(
    <>
      <h2 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 700, color: '#e9d5ff' }}>🌀 Luck Pillars 大运</h2>
      <p style={{ color: '#6b7280', fontSize: 13, margin: '0 0 24px' }}>
        Your 10-year luck cycles — each pillar governs a decade of your life's elemental climate.
      </p>

      {/* Meta */}
      <div style={{
        backgroundColor: '#16152e', borderRadius: 10, padding: '14px 20px',
        border: '1px solid rgba(139,92,246,0.2)', marginBottom: 24,
        display: 'flex', gap: 28, flexWrap: 'wrap',
      }}>
        <div>
          <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 4 }}>Direction</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#c4b5fd' }}>
            {luckPillars.direction === 'forward' ? '↗ Forward 顺行' : '↙ Backward 逆行'}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 4 }}>First Pillar Starts</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#c4b5fd' }}>Age {luckPillars.start_age}</div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 4 }}>Pillars Shown</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#c4b5fd' }}>{luckPillars.pillars.length} × 10 years</div>
        </div>
      </div>

      {/* Timeline */}
      <div style={{ position: 'relative' }}>
        {/* Connecting line */}
        <div style={{
          position: 'absolute', top: 32, left: 31, right: 0, height: 2,
          backgroundColor: 'rgba(139,92,246,0.2)', zIndex: 0,
        }} />

        <div style={{ display: 'flex', gap: 0, overflowX: 'auto', paddingBottom: 16 }}>
          {luckPillars.pillars.map((p: LuckPillar, i: number) => {
            const sColor = ELEM_COLOR[p.stem.element];
            const bColor = ELEM_COLOR[p.branch.element];
            return (
              <div key={i} style={{ minWidth: 120, flex: '0 0 120px', position: 'relative', zIndex: 1 }}>
                {/* Decade node */}
                <div style={{
                  width: 64, height: 64, borderRadius: '50%', margin: '0 auto 12px',
                  backgroundColor: sColor + '20', border: `2px solid ${sColor}66`,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ fontSize: 22, fontWeight: 900, color: sColor, lineHeight: 1 }}>{p.stem.cn}</span>
                  <span style={{ fontSize: 10, color: '#6b7280' }}>#{i + 1}</span>
                </div>

                {/* Branch box */}
                <div style={{
                  backgroundColor: '#16152e', borderRadius: 10, padding: '12px 8px',
                  border: `1px solid ${bColor}44`, margin: '0 4px', textAlign: 'center',
                }}>
                  <div style={{ fontSize: 26, fontWeight: 900, color: bColor }}>{p.branch.cn}</div>
                  <div style={{ fontSize: 10, color: bColor + 'cc', marginBottom: 6 }}>{p.branch.en}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#e5e7eb' }}>{p.name}</div>
                  <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 4 }}>
                    {p.stem.pinyin} {p.branch.pinyin}
                  </div>
                  <div style={{ marginTop: 8, padding: '4px 0', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ fontSize: 10, color: '#6b7280' }}>Age</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#c4b5fd' }}>
                      {p.age_start} – {p.age_end}
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginTop: 6 }}>
                    <span style={{ fontSize: 9, padding: '1px 5px', borderRadius: 6, backgroundColor: sColor + '22', color: sColor }}>{p.stem.element}</span>
                    <span style={{ fontSize: 9, padding: '1px 5px', borderRadius: 6, backgroundColor: bColor + '22', color: bColor }}>{p.branch.element}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Explanation */}
      <div style={{
        backgroundColor: '#16152e', borderRadius: 12, padding: 20,
        border: '1px solid rgba(255,255,255,0.06)', marginTop: 24,
      }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#c4b5fd', marginBottom: 10 }}>How to Read Your Luck Pillars</div>
        <div style={{ fontSize: 12, color: '#9ca3af', lineHeight: 1.7 }}>
          Each luck pillar (大运) governs approximately 10 years of your life. The <strong style={{ color: '#e5e7eb' }}>Heavenly Stem</strong> (top character)
          influences the first 5 years, while the <strong style={{ color: '#e5e7eb' }}>Earthly Branch</strong> (bottom character) governs the second 5 years.
          Pillars whose elements match your <strong style={{ color: '#e5e7eb' }}>favorable elements</strong> bring opportunities and growth;
          those that conflict may bring challenges requiring extra care.
        </div>
      </div>
    </>
  );
};

export default LuckPillars;
