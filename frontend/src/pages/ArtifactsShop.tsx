import React, { useEffect, useState } from 'react';
import { artifactsAPI } from '../services/api';
import Sidebar from '../components/Common/Sidebar';
import Header  from '../components/Common/Header';
import { useAppSelector } from '../store/store';
import { useIsMobile } from '../hooks/useIsMobile';

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
  const chart    = useAppSelector((s) => s.bazi.chart);
  const isMobile = useIsMobile();

  useEffect(() => {
    artifactsAPI.getAll().then((r) => {
      setArtifacts(r.data.artifacts || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const categories  = ['All', ...Array.from(new Set(artifacts.map((a) => a.category)))];
  const filtered    = filter === 'All' ? artifacts : artifacts.filter((a) => a.category === filter);
  const isRecommended = (a: Artifact) => {
    if (!chart?.favorable_elements) return false;
    return a.bazi_recommendation.includes('All') ||
      chart.favorable_elements.some((e: string) => a.bazi_recommendation.includes(e));
  };

  const shell = (content: React.ReactNode) => (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8f6ff' }}>
      <Sidebar />
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <Header />
        <main style={{ flex: 1, minWidth: 0, padding: isMobile ? '14px' : '32px', overflowY: 'auto', boxSizing: 'border-box' }}>
          {content}
        </main>
      </div>
    </div>
  );

  if (loading) return shell(<div style={{ color: '#9ca3af' }}>Loading artifacts…</div>);

  return shell(
    <div style={{ width: '100%', boxSizing: 'border-box' }}>

      {/* Mobile detail modal */}
      {isMobile && selected && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-end' }}
          onClick={() => setSelected(null)}>
          <div style={{ backgroundColor: '#fff', borderRadius: '16px 16px 0 0', width: '100%', maxHeight: '85vh', overflowY: 'auto', padding: '20px 18px' }}
            onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <span style={{ fontSize: 40 }}>{selected.emoji}</span>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', fontSize: 24, color: '#9ca3af', cursor: 'pointer' }}>×</button>
            </div>
            <div style={{ fontSize: 17, fontWeight: 800, color: '#2e1065', marginBottom: 2 }}>{selected.name}</div>
            <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 8 }}>{selected.cn_name}</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: '#7c3aed', marginBottom: 12 }}>£{selected.price_gbp.toFixed(2)}</div>
            <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.7, marginBottom: 14 }}>{selected.description}</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#7c3aed', marginBottom: 6 }}>✦ Benefits</div>
            {selected.benefits.map((b) => (
              <div key={b} style={{ fontSize: 12, color: '#6b7280', padding: '2px 0', display: 'flex', gap: 8 }}>
                <span style={{ color: '#16a34a' }}>·</span>{b}
              </div>
            ))}
            <div style={{ height: 1, backgroundColor: '#f3f4f6', margin: '14px 0' }} />
            <div style={{ fontSize: 12, fontWeight: 700, color: '#7c3aed', marginBottom: 6 }}>🧭 How to Use</div>
            <div style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.7, marginBottom: 16 }}>{selected.how_to_use}</div>
            <button style={{ width: '100%', padding: '13px 0', backgroundColor: selected.in_stock ? '#7c3aed' : '#d1d5db', color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700 }}>
              {selected.in_stock ? '🛒 Purchase Link Coming Soon' : 'Out of Stock'}
            </button>
          </div>
        </div>
      )}

      {/* Main layout: side panel on desktop, single col on mobile */}
      <div style={{ display: 'grid', gridTemplateColumns: (!isMobile && selected) ? '1fr 360px' : '1fr', gap: 24, minWidth: 0 }}>

        {/* Left: list */}
        <div style={{ minWidth: 0 }}>
          <h2 style={{ margin: '0 0 4px', fontSize: isMobile ? 18 : 22, fontWeight: 700, color: '#2e1065' }}>🏺 Sacred Artifacts</h2>
          <p style={{ color: '#6b7280', fontSize: 13, margin: '0 0 16px', lineHeight: 1.5 }}>
            Authentic feng shui instruments and Bazi remedies to harmonise your elemental energies.
          </p>

          {chart?.favorable_elements && (
            <div style={{ backgroundColor: 'rgba(34,197,94,0.08)', borderRadius: 10, padding: '10px 14px', border: '1px solid rgba(34,197,94,0.25)', marginBottom: 16, fontSize: 12 }}>
              <span style={{ color: '#16a34a', fontWeight: 600 }}>✦ Favourable elements: </span>
              <span style={{ color: '#6b7280' }}>{chart.favorable_elements.join(' & ')}</span>
            </div>
          )}

          {/* Filter chips */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
            {categories.map((cat) => (
              <button key={cat} onClick={() => setFilter(cat)} style={{
                padding: '5px 12px', borderRadius: 20, cursor: 'pointer', fontSize: 11, fontWeight: 600,
                border: `1px solid ${filter === cat ? '#7c3aed' : '#e8e3f8'}`,
                backgroundColor: filter === cat ? '#ede9fe' : '#fff',
                color: filter === cat ? '#2e1065' : '#6b7280',
              }}>{cat}</button>
            ))}
          </div>

          {/* Cards grid */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(240px, 1fr))', gap: isMobile ? 8 : 14 }}>
            {filtered.map((a) => {
              const elemColor   = ELEM_COLOR[a.element] || '#7c3aed';
              const recommended = isRecommended(a);
              const isActive    = selected?.id === a.id;

              return (
                <div key={a.id} onClick={() => setSelected(isActive ? null : a)} style={{
                  backgroundColor: '#fff', borderRadius: 10, overflow: 'hidden', cursor: 'pointer',
                  border: `1px solid ${isActive ? '#7c3aed' : recommended ? 'rgba(34,197,94,0.3)' : '#f0edf8'}`,
                  boxShadow: isActive ? '0 0 0 2px #c4b5fd' : 'none',
                  minWidth: 0,
                }}>
                  <div style={{ height: isMobile ? 90 : 130, backgroundColor: elemColor + '12', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: isMobile ? 40 : 56 }}>{a.emoji}</span>
                  </div>
                  <div style={{ padding: isMobile ? '8px' : '12px 14px' }}>
                    <div style={{ fontSize: isMobile ? 11 : 13, fontWeight: 700, color: '#1f2937', lineHeight: 1.3, marginBottom: 4, wordBreak: 'break-word' }}>{a.name}</div>
                    <div style={{ fontSize: isMobile ? 12 : 14, fontWeight: 800, color: '#7c3aed' }}>£{a.price_gbp.toFixed(2)}</div>
                    {!a.in_stock && <div style={{ fontSize: 10, color: '#ef4444', marginTop: 3, fontWeight: 600 }}>Out of stock</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Desktop detail panel */}
        {!isMobile && selected && (
          <div style={{ backgroundColor: '#fff', borderRadius: 12, border: '1px solid #c4b5fd', alignSelf: 'start', position: 'sticky', top: 0, overflow: 'hidden' }}>
            <div style={{ height: 180, backgroundColor: (ELEM_COLOR[selected.element] || '#7c3aed') + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              <span style={{ fontSize: 80 }}>{selected.emoji}</span>
              <button onClick={() => setSelected(null)} style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(0,0,0,0.4)', border: 'none', color: '#fff', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', fontSize: 16 }}>×</button>
            </div>
            <div style={{ padding: '20px 22px' }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#2e1065', marginBottom: 2 }}>{selected.name}</div>
              <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 4 }}>{selected.cn_name}</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: '#7c3aed', marginBottom: 14 }}>£{selected.price_gbp.toFixed(2)} <span style={{ fontSize: 12, color: '#6b7280', fontWeight: 400 }}>per item</span></div>
              <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.7, marginBottom: 16 }}>{selected.description}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#7c3aed', marginBottom: 8 }}>✦ Benefits</div>
              {selected.benefits.map((b) => (
                <div key={b} style={{ fontSize: 12, color: '#9ca3af', padding: '3px 0', display: 'flex', gap: 8 }}><span style={{ color: '#16a34a' }}>·</span>{b}</div>
              ))}
              <div style={{ height: 1, backgroundColor: '#f3f4f6', margin: '14px 0' }} />
              <div style={{ fontSize: 12, fontWeight: 700, color: '#7c3aed', marginBottom: 8 }}>🧭 How to Use</div>
              <div style={{ fontSize: 12, color: '#9ca3af', lineHeight: 1.7, marginBottom: 16 }}>{selected.how_to_use}</div>
              <button style={{ width: '100%', padding: '12px 0', backgroundColor: selected.in_stock ? '#7c3aed' : '#374151', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700 }}>
                {selected.in_stock ? '🛒 Purchase Link Coming Soon' : 'Out of Stock'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArtifactsShop;
