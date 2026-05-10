import React, { useEffect, useState } from 'react';
import { artifactsAPI } from '../services/api';
import Sidebar from '../components/Common/Sidebar';
import Header  from '../components/Common/Header';
import { useAppSelector } from '../store/store';

const ELEM_COLOR: Record<string, string> = {
  Wood: '#16a34a', Fire: '#ef4444', Earth: '#f59e0b', Metal: '#6b7280', Water: '#2563eb', All: '#7c3aed',
};

const CATEGORY_COLORS: Record<string, string> = {
  Protection: '#ef4444', Prosperity: '#16a34a', 'Clarity & Metal': '#6b7280',
  Harmony: '#f59e0b', Balance: '#7c3aed', Luck: '#f59e0b',
  Wealth: '#16a34a', Navigation: '#2563eb',
};

interface Artifact {
  id: number; name: string; cn_name: string; emoji: string;
  category: string; element: string; price_gbp: number;
  description: string; benefits: string[]; how_to_use: string;
  image_url: string; buy_url: string | null; in_stock: boolean;
  bazi_recommendation: string[];
}

const ArtifactsShop: React.FC = () => {
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [loading, setLoading]     = useState(true);
  const [selected, setSelected]   = useState<Artifact | null>(null);
  const [filter, setFilter]       = useState<string>('All');
  const chart = useAppSelector((s) => s.bazi.chart);

  useEffect(() => {
    artifactsAPI.getAll().then((r) => {
      setArtifacts(r.data.artifacts || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const categories = ['All', ...Array.from(new Set(artifacts.map((a) => a.category)))];
  const filtered = filter === 'All' ? artifacts : artifacts.filter((a) => a.category === filter);

  const isRecommended = (a: Artifact) => {
    if (!chart?.favorable_elements) return false;
    return a.bazi_recommendation.includes('All') ||
      chart.favorable_elements.some((e: string) => a.bazi_recommendation.includes(e));
  };

  const pageLayout = (content: React.ReactNode) => (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8f6ff' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header />
        <main style={{ flex: 1, padding: 32, overflowY: 'auto' }}>{content}</main>
      </div>
    </div>
  );

  if (loading) return pageLayout(<div style={{ color: '#9ca3af' }}>Loading artifacts…</div>);

  return pageLayout(
    <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 380px' : '1fr', gap: 24 }}>
      {/* Left: grid */}
      <div>
        <h2 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 700, color: '#2e1065' }}>🏺 Sacred Artifacts</h2>
        <p style={{ color: '#6b7280', fontSize: 13, margin: '0 0 20px' }}>
          Authentic feng shui instruments and Bazi remedies to harmonise your elemental energies.
          Purchase links will be added soon — click any artifact to explore.
        </p>

        {chart?.favorable_elements && (
          <div style={{
            backgroundColor: 'rgba(34,197,94,0.08)', borderRadius: 10, padding: '10px 16px',
            border: '1px solid rgba(34,197,94,0.25)', marginBottom: 20, fontSize: 12,
          }}>
            <span style={{ color: '#16a34a', fontWeight: 600 }}>✦ Your favourable elements: </span>
            <span style={{ color: '#9ca3af' }}>{chart.favorable_elements.join(' & ')}</span>
            <span style={{ color: '#6b7280' }}> — items marked ✦ are personally recommended for your chart.</span>
          </div>
        )}

        {/* Filter row */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              style={{
                padding: '6px 14px', borderRadius: 20, cursor: 'pointer', fontSize: 11, fontWeight: 600,
                border: `1px solid ${filter === cat ? '#7c3aed' : '#e8e3f8'}`,
                backgroundColor: filter === cat ? '#ede9fe' : '#ffffff',
                color: filter === cat ? '#2e1065' : '#6b7280',
              }}
            >{cat}</button>
          ))}
        </div>

        {/* Artifact cards grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
          {filtered.map((a) => {
            const elemColor = ELEM_COLOR[a.element] || '#7c3aed';
            const catColor  = CATEGORY_COLORS[a.category] || '#7c3aed';
            const recommended = isRecommended(a);
            const isActive = selected?.id === a.id;

            return (
              <div
                key={a.id}
                onClick={() => setSelected(isActive ? null : a)}
                style={{
                  backgroundColor: '#ffffff', borderRadius: 12,
                  border: `1px solid ${isActive ? '#7c3aed' : recommended ? 'rgba(34,197,94,0.3)' : '#f3f4f6'}`,
                  cursor: 'pointer', transition: 'all 0.2s', overflow: 'hidden',
                  boxShadow: isActive ? '0 0 16px #c4b5fd' : 'none',
                }}
              >
                {/* Artifact image area */}
                <div style={{
                  height: 140, backgroundColor: elemColor + '12',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  position: 'relative',
                  borderBottom: `1px solid ${elemColor}22`,
                }}>
                  <span style={{ fontSize: 60 }}>{a.emoji}</span>
                  {recommended && (
                    <div style={{
                      position: 'absolute', top: 8, right: 8, fontSize: 10, fontWeight: 700,
                      backgroundColor: 'rgba(34,197,94,0.2)', color: '#16a34a',
                      padding: '2px 8px', borderRadius: 20,
                      border: '1px solid rgba(34,197,94,0.4)',
                    }}>✦ Recommended</div>
                  )}
                  {!a.in_stock && (
                    <div style={{
                      position: 'absolute', bottom: 8, left: 8, fontSize: 10, fontWeight: 700,
                      backgroundColor: 'rgba(239,68,68,0.2)', color: '#ef4444',
                      padding: '2px 8px', borderRadius: 20,
                    }}>Out of Stock</div>
                  )}
                </div>

                <div style={{ padding: '14px 16px' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#1f2937', marginBottom: 2 }}>{a.name}</div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>{a.cn_name}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{
                      fontSize: 10, padding: '2px 8px', borderRadius: 12, fontWeight: 600,
                      backgroundColor: catColor + '20', color: catColor,
                    }}>{a.category}</span>
                    <span style={{ fontSize: 15, fontWeight: 800, color: '#7c3aed' }}>£{a.price_gbp.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right: detail panel */}
      {selected && (
        <div style={{
          backgroundColor: '#ffffff', borderRadius: 12,
          border: '1px solid #c4b5fd',
          padding: 0, alignSelf: 'start', position: 'sticky', top: 0,
          overflow: 'hidden',
        }}>
          {/* Hero area */}
          <div style={{
            height: 180, backgroundColor: (ELEM_COLOR[selected.element] || '#7c3aed') + '15',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative',
          }}>
            <span style={{ fontSize: 80 }}>{selected.emoji}</span>
            <button
              onClick={() => setSelected(null)}
              style={{
                position: 'absolute', top: 12, right: 12,
                background: 'rgba(0,0,0,0.4)', border: 'none', color: '#9ca3af',
                borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', fontSize: 16, lineHeight: '28px',
              }}
            >×</button>
          </div>

          <div style={{ padding: '20px 22px' }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#2e1065', marginBottom: 2 }}>{selected.name}</div>
            <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 4 }}>{selected.cn_name}</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: '#7c3aed', marginBottom: 14 }}>
              £{selected.price_gbp.toFixed(2)} <span style={{ fontSize: 12, color: '#6b7280', fontWeight: 400 }}>per item</span>
            </div>

            <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.7, marginBottom: 18 }}>{selected.description}</div>

            <div style={{ fontSize: 12, fontWeight: 700, color: '#7c3aed', marginBottom: 8 }}>✦ Benefits</div>
            {selected.benefits.map((b) => (
              <div key={b} style={{ fontSize: 12, color: '#9ca3af', padding: '3px 0', display: 'flex', gap: 8 }}>
                <span style={{ color: '#16a34a' }}>·</span> {b}
              </div>
            ))}

            <div style={{ height: 1, backgroundColor: '#f3f4f6', margin: '16px 0' }} />

            <div style={{ fontSize: 12, fontWeight: 700, color: '#7c3aed', marginBottom: 8 }}>🧭 How to Use</div>
            <div style={{ fontSize: 12, color: '#9ca3af', lineHeight: 1.7 }}>{selected.how_to_use}</div>

            <div style={{ height: 1, backgroundColor: '#f3f4f6', margin: '16px 0' }} />

            <button
              style={{
                width: '100%', padding: '12px 0',
                backgroundColor: selected.in_stock ? '#7c3aed' : '#374151',
                color: selected.in_stock ? '#fff' : '#6b7280',
                border: 'none', borderRadius: 10, cursor: selected.in_stock ? 'pointer' : 'not-allowed',
                fontSize: 14, fontWeight: 700, marginBottom: 8,
              }}
            >
              {selected.in_stock ? '🛒 Purchase Link Coming Soon' : 'Out of Stock'}
            </button>
            <div style={{ fontSize: 11, color: '#9ca3af', textAlign: 'center' }}>
              Secure checkout · Worldwide shipping · Authentic items
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArtifactsShop;
