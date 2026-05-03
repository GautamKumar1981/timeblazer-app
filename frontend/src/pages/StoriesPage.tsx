import React, { useEffect, useState } from 'react';
import { storiesAPI } from '../services/api';
import Sidebar from '../components/Common/Sidebar';
import Header  from '../components/Common/Header';

const ELEM_COLOR: Record<string, string> = {
  Wood: '#22c55e', Fire: '#ef4444', Earth: '#f59e0b', Metal: '#94a3b8', Water: '#3b82f6',
};

interface StemStory {
  stem_index: number; cn: string; pinyin: string; element: string; emoji: string;
  title: string; story: string; traits: string[]; famous_for: string;
}
interface BranchStory {
  branch_index: number; cn: string; animal: string; pinyin: string;
  element: string; emoji: string; hour: string; hour_energy: string;
  title: string; story: string; traits: string[];
}

const StoryCard: React.FC<{
  title: string; subtitle: string; cn: string; emoji: string;
  element: string; story: string; traits: string[]; extra?: string;
  isOpen: boolean; onClick: () => void;
}> = ({ title, subtitle, cn, emoji, element, story, traits, extra, isOpen, onClick }) => {
  const color = ELEM_COLOR[element] || '#8b5cf6';
  return (
    <div
      onClick={onClick}
      style={{
        backgroundColor: '#16152e', borderRadius: 12, padding: '18px 20px',
        border: `1px solid ${isOpen ? color + '66' : 'rgba(255,255,255,0.07)'}`,
        cursor: 'pointer', transition: 'all 0.2s',
        boxShadow: isOpen ? `0 0 20px ${color}22` : 'none',
        marginBottom: 12,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{
          width: 56, height: 56, borderRadius: '50%', flexShrink: 0,
          backgroundColor: color + '18', border: `2px solid ${color}44`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 28,
        }}>{emoji}</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontSize: 26, fontWeight: 900, color }}>{cn}</span>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#e5e7eb' }}>{title}</span>
          </div>
          <div style={{ fontSize: 12, color: '#6b7280' }}>{subtitle}</div>
        </div>
        <div style={{ fontSize: 16, color: '#4b5563', transform: isOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }}>›</div>
      </div>

      {isOpen && (
        <div style={{ marginTop: 18, paddingTop: 18, borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ fontSize: 14, color: '#d1d5db', lineHeight: 1.85, whiteSpace: 'pre-line', marginBottom: 16 }}>
            {story}
          </div>
          {extra && (
            <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 14, fontStyle: 'italic' }}>{extra}</div>
          )}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {traits.map((t) => (
              <span key={t} style={{
                padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                backgroundColor: color + '20', color,
              }}>{t}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const StoriesPage: React.FC = () => {
  const [stems, setStems]   = useState<StemStory[]>([]);
  const [branches, setBranches] = useState<BranchStory[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [tab, setTab]       = useState<'stems' | 'branches'>('stems');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    storiesAPI.getAll().then((r) => {
      setStems(r.data.stems || []);
      setBranches(r.data.branches || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const pageLayout = (content: React.ReactNode) => (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0f0e1a' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header />
        <main style={{ flex: 1, padding: 32, overflowY: 'auto' }}>{content}</main>
      </div>
    </div>
  );

  if (loading) return pageLayout(<div style={{ color: '#9ca3af' }}>Loading folk stories…</div>);

  return pageLayout(
    <>
      <h2 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 700, color: '#e9d5ff' }}>
        📖 Celestial Folk Stories
      </h2>
      <p style={{ color: '#6b7280', fontSize: 13, margin: '0 0 24px', maxWidth: 640 }}>
        Discover the ancient myths behind the 10 Heavenly Stems and 12 Earthly Branches —
        the celestial archetypes that shape every Bazi chart.
      </p>

      {/* Tab switcher */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {[
          { key: 'stems',    label: '天干 10 Heavenly Stems' },
          { key: 'branches', label: '地支 12 Earthly Branches' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => { setTab(key as any); setOpenId(null); }}
            style={{
              padding: '9px 20px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600,
              border: `1px solid ${tab === key ? '#8b5cf6' : 'rgba(255,255,255,0.1)'}`,
              backgroundColor: tab === key ? 'rgba(139,92,246,0.2)' : '#16152e',
              color: tab === key ? '#e9d5ff' : '#6b7280',
            }}
          >{label}</button>
        ))}
      </div>

      {/* Introduction panel */}
      {tab === 'stems' && (
        <div style={{
          backgroundColor: '#16152e', borderRadius: 10, padding: '14px 18px',
          border: '1px solid rgba(139,92,246,0.2)', marginBottom: 20, fontSize: 13, color: '#9ca3af', lineHeight: 1.7,
        }}>
          The <strong style={{ color: '#c4b5fd' }}>10 Heavenly Stems (天干)</strong> are the foundational Yang forces of the cosmos —
          the active, celestial principles that give each Bazi pillar its governing character. Each stem carries
          a divine origin story from China's mythological tradition, passed down over four thousand years.
        </div>
      )}
      {tab === 'branches' && (
        <div style={{
          backgroundColor: '#16152e', borderRadius: 10, padding: '14px 18px',
          border: '1px solid rgba(139,92,246,0.2)', marginBottom: 20, fontSize: 13, color: '#9ca3af', lineHeight: 1.7,
        }}>
          The <strong style={{ color: '#c4b5fd' }}>12 Earthly Branches (地支)</strong> are the Yin forces of time —
          twelve two-hour windows that govern the daily energy cycle. Each branch corresponds to one of the
          Zodiac animals, and each carries a myth that reveals the nature of its energy and its hour.
        </div>
      )}

      {/* Stories list */}
      {tab === 'stems' && stems.map((s) => (
        <StoryCard
          key={s.stem_index}
          title={s.title}
          subtitle={`${s.element} · Stem ${s.stem_index + 1} of 10 · ${s.pinyin}`}
          cn={s.cn}
          emoji={s.emoji}
          element={s.element.split(' ')[1] || s.element}
          story={s.story}
          traits={s.traits}
          extra={s.famous_for ? `Known for: ${s.famous_for}` : undefined}
          isOpen={openId === `stem-${s.stem_index}`}
          onClick={() => setOpenId(openId === `stem-${s.stem_index}` ? null : `stem-${s.stem_index}`)}
        />
      ))}

      {tab === 'branches' && branches.map((b) => (
        <StoryCard
          key={b.branch_index}
          title={b.title}
          subtitle={`${b.animal} · ${b.hour} · ${b.element}`}
          cn={b.cn}
          emoji={b.emoji}
          element={b.element}
          story={b.story}
          traits={b.traits}
          extra={b.hour_energy ? `Hour energy: ${b.hour_energy}` : undefined}
          isOpen={openId === `branch-${b.branch_index}`}
          onClick={() => setOpenId(openId === `branch-${b.branch_index}` ? null : `branch-${b.branch_index}`)}
        />
      ))}
    </>
  );
};

export default StoriesPage;
