import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/store';
import { fetchBaziChart } from '../store/slices/baziSlice';
import { Pillar, Stem } from '../store/slices/baziSlice';
import Sidebar from '../components/Common/Sidebar';
import Header  from '../components/Common/Header';

const ELEM_COLOR: Record<string, string> = {
  Wood: '#22c55e', Fire: '#ef4444', Earth: '#f59e0b', Metal: '#94a3b8', Water: '#3b82f6',
};

const PillarCard: React.FC<{ pillar: Pillar; title: string }> = ({ pillar, title }) => {
  const sElem  = pillar.stem.element;
  const bElem  = pillar.branch.element;
  const sColor = ELEM_COLOR[sElem];
  const bColor = ELEM_COLOR[bElem];

  return (
    <div style={{
      backgroundColor: '#16152e', borderRadius: 12, padding: '20px 16px',
      border: '1px solid rgba(139,92,246,0.2)', textAlign: 'center', flex: 1,
    }}>
      <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 12, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>
        {title}
      </div>

      {/* Heavenly Stem */}
      <div style={{ marginBottom: 8 }}>
        <div style={{
          fontSize: 42, fontWeight: 900, color: sColor,
          textShadow: `0 0 20px ${sColor}66`, lineHeight: 1,
        }}>
          {pillar.stem.cn}
        </div>
        <div style={{ fontSize: 11, color: sColor + 'cc', marginTop: 4 }}>{pillar.stem.en}</div>
      </div>

      {/* Earthly Branch */}
      <div style={{
        backgroundColor: bColor + '18', border: `1px solid ${bColor}44`,
        borderRadius: 8, padding: '10px 8px', marginBottom: 10,
      }}>
        <div style={{ fontSize: 36, fontWeight: 900, color: bColor }}>{pillar.branch.cn}</div>
        <div style={{ fontSize: 11, color: bColor + 'cc', marginTop: 2 }}>
          {pillar.branch.en} · {pillar.branch.element}
        </div>
      </div>

      {/* Hidden stems */}
      {pillar.hidden_stems.length > 0 && (
        <div>
          <div style={{ fontSize: 10, color: '#4b5563', marginBottom: 4 }}>Hidden Stems 藏干</div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 4, flexWrap: 'wrap' }}>
            {pillar.hidden_stems.map((s: Stem) => (
              <span key={s.cn} style={{
                fontSize: 12, padding: '2px 7px', borderRadius: 10,
                backgroundColor: ELEM_COLOR[s.element] + '22',
                color: ELEM_COLOR[s.element], border: `1px solid ${ELEM_COLOR[s.element]}44`,
              }}>
                {s.cn}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const ElementBar: React.FC<{ balance: Record<string, number> }> = ({ balance }) => {
  const total = Object.values(balance).reduce((a, b) => a + b, 0) || 1;
  return (
    <div>
      <div style={{ fontSize: 13, color: '#9ca3af', marginBottom: 10, fontWeight: 600 }}>Element Balance 五行</div>
      <div style={{ display: 'flex', borderRadius: 8, overflow: 'hidden', height: 12, marginBottom: 12 }}>
        {Object.entries(balance).map(([elem, cnt]) => (
          <div key={elem} style={{
            flex: cnt / total, backgroundColor: ELEM_COLOR[elem],
            transition: 'flex 0.4s',
          }} title={`${elem}: ${cnt}`} />
        ))}
      </div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {Object.entries(balance).map(([elem, cnt]) => (
          <div key={elem} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: ELEM_COLOR[elem] }} />
            <span style={{ fontSize: 12, color: '#d1d5db' }}>{elem}</span>
            <span style={{ fontSize: 11, color: '#6b7280' }}>×{cnt}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const BaziChart: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { chart, loading, error } = useAppSelector((s) => s.bazi);

  useEffect(() => { dispatch(fetchBaziChart()); }, [dispatch]);

  if (loading) return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0f0e1a' }}>
      <Sidebar /><div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}><Header />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
          Calculating your chart…
        </div>
      </div>
    </div>
  );

  if (error?.includes('profile_required') || error) return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0f0e1a' }}>
      <Sidebar /><div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}><Header />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>☯</div>
          <div style={{ color: '#c4b5fd', fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Profile Required</div>
          <div style={{ color: '#6b7280', fontSize: 14, marginBottom: 24 }}>Enter your birth data to generate your Bazi chart.</div>
          <button onClick={() => navigate('/profile')} style={{
            padding: '10px 24px', backgroundColor: '#7c3aed', color: '#fff',
            border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600,
          }}>Set Up Profile →</button>
        </div>
      </div>
    </div>
  );

  if (!chart) return null;

  const pillars = [
    { key: 'year', title: 'Year Pillar 年柱', pillar: chart.year },
    { key: 'month', title: 'Month Pillar 月柱', pillar: chart.month },
    { key: 'day', title: 'Day Pillar 日柱', pillar: chart.day },
    { key: 'hour', title: 'Hour Pillar 时柱', pillar: chart.hour },
  ];

  const dmColor = ELEM_COLOR[chart.day_master.element];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0f0e1a' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header />
        <main style={{ flex: 1, padding: 32, overflowY: 'auto' }}>
          <h2 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 700, color: '#e9d5ff' }}>
            🀄 Four Pillars Chart 四柱八字
          </h2>
          <p style={{ color: '#6b7280', fontSize: 13, margin: '0 0 28px' }}>
            Your Bazi (八字) — the eight characters that define your elemental blueprint.
          </p>

          {/* Day Master banner */}
          <div style={{
            backgroundColor: dmColor + '18', border: `1px solid ${dmColor}44`,
            borderRadius: 12, padding: '16px 22px', marginBottom: 24,
            display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <span style={{ fontSize: 38, color: dmColor }}>{chart.day_master.cn}</span>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: dmColor }}>{chart.day_master.en}</div>
                <div style={{ fontSize: 12, color: '#9ca3af' }}>Day Master · {chart.day_master_strength}</div>
              </div>
            </div>
            <div style={{ flex: 1, display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 6 }}>Favorable Elements 喜用神</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {chart.favorable_elements.map((e) => (
                    <span key={e} style={{
                      padding: '3px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600,
                      backgroundColor: ELEM_COLOR[e] + '28', color: ELEM_COLOR[e],
                      border: `1px solid ${ELEM_COLOR[e]}55`,
                    }}>{e}</span>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 6 }}>Avoid</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {chart.unfavorable_elements.map((e) => (
                    <span key={e} style={{
                      padding: '3px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600,
                      backgroundColor: '#1f1f2e', color: '#6b7280',
                      border: '1px solid rgba(255,255,255,0.1)',
                    }}>{e}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Four Pillars */}
          <div style={{ display: 'flex', gap: 14, marginBottom: 28, flexWrap: 'wrap' }}>
            {pillars.map(({ key, title, pillar }) => (
              <PillarCard key={key} pillar={pillar} title={title} />
            ))}
          </div>

          {/* Element balance */}
          <div style={{
            backgroundColor: '#16152e', borderRadius: 12, padding: 22,
            border: '1px solid rgba(139,92,246,0.2)', marginBottom: 20,
          }}>
            <ElementBar balance={chart.element_balance} />
          </div>

          {/* Pinyin reference */}
          <div style={{
            backgroundColor: '#16152e', borderRadius: 12, padding: 20,
            border: '1px solid rgba(255,255,255,0.06)',
          }}>
            <div style={{ fontSize: 13, color: '#9ca3af', marginBottom: 14, fontWeight: 600 }}>Pillar Reference 柱名对照</div>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              {pillars.map(({ title, pillar }) => (
                <div key={title} style={{ minWidth: 110 }}>
                  <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 4 }}>{title.split(' ')[0]}</div>
                  <div style={{ fontSize: 18, color: '#e5e7eb' }}>{pillar.name}</div>
                  <div style={{ fontSize: 11, color: '#9ca3af' }}>
                    {pillar.stem.pinyin} {pillar.branch.pinyin}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default BaziChart;
