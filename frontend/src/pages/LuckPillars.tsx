import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/store';
import { fetchLuckPillars } from '../store/slices/baziSlice';
import { LuckPillar } from '../store/slices/baziSlice';
import Sidebar from '../components/Common/Sidebar';
import Header  from '../components/Common/Header';

const ELEM_COLOR: Record<string, string> = {
  Wood: '#16a34a', Fire: '#ef4444', Earth: '#f59e0b', Metal: '#6b7280', Water: '#2563eb',
};

// ── Pillar predictions by stem element ────────────────────────────────────────
const STEM_DECADE: Record<string, { theme: string; opportunity: string; challenge: string }> = {
  'Yang Wood':  { theme: 'Ambitious Growth',    opportunity: 'Leadership roles and bold new ventures emerge. Plant seeds for long-term expansion — this is the decade to start your most important projects.',    challenge: 'Overreaching or spreading too thin. Root deeply before growing tall.' },
  'Yin Wood':   { theme: 'Steady Development',  opportunity: 'Gradual but lasting progress. Creativity and artistic pursuits flourish. Relationships deepen through patience and care.',                          challenge: 'Impatience or self-doubt stifles the harvest. Trust the slow bloom.' },
  'Yang Fire':  { theme: 'Visibility & Power',  opportunity: 'Public recognition and authority arrive. Leadership is magnified — great for career climbs and brand-building.',                                     challenge: 'Burnout or aggression if energy isn\'t channelled wisely. Rest is sacred.' },
  'Yin Fire':   { theme: 'Illumination',         opportunity: 'Intuition, spiritual growth, and creative expression peak. Heart-centred connections and inspired ideas shape this decade.',                         challenge: 'Overthinking extinguishes the inner flame. Act on insights promptly.' },
  'Yang Earth': { theme: 'Stability & Legacy',  opportunity: 'Real estate, long-term investments, and institutional influence grow. A decade to build lasting wealth and family foundations.',                     challenge: 'Rigidity or over-caution blocks necessary evolution.' },
  'Yin Earth':  { theme: 'Nurture & Harvest',   opportunity: 'Community building, healing work, and collaborative projects thrive. Quiet influence accumulates significant impact.',                               challenge: 'Martyrdom or neglecting personal needs for others.' },
  'Yang Metal': { theme: 'Justice & Mastery',   opportunity: 'Legal victories, contracts, financial precision, and authority in structured fields. A decade of earning respect through excellence.',              challenge: 'Inflexibility and conflict-seeking undermines alliances.' },
  'Yin Metal':  { theme: 'Refinement',           opportunity: 'Artistic mastery, wealth through precision, and clear communication define this decade. An excellent time for writing, design, or finance.',      challenge: 'Perfectionism and critical thinking can isolate you from others.' },
  'Yang Water': { theme: 'Flow & Wisdom',        opportunity: 'Knowledge, travel, philosophy, and spiritual expansion shape this decade. Influential networks emerge through authentic sharing.',                  challenge: 'Overanalysis leads to indecision. Trust the current.' },
  'Yin Water':  { theme: 'Intuition & Depth',   opportunity: 'Psychic sensitivity, research, and healing modalities are amplified. Deep inner work unlocks extraordinary outer transformation.',                  challenge: 'Withdrawal or emotional turbulence needs conscious management.' },
};

// ── Branch remedies by element ────────────────────────────────────────────────
const BRANCH_REMEDY: Record<string, { crystal: string; colour: string; direction: string; practice: string; affirmation: string }> = {
  Wood:  { crystal: 'Green Aventurine or Jade',       colour: 'Green & Teal',   direction: 'East',  practice: 'Morning journaling and nature walks',     affirmation: 'I grow with grace and purpose.' },
  Fire:  { crystal: 'Red Jasper or Carnelian',        colour: 'Red & Orange',   direction: 'South', practice: 'Candle meditation and movement practice',  affirmation: 'I shine my authentic light boldly.' },
  Earth: { crystal: 'Citrine or Yellow Jasper',       colour: 'Yellow & Brown', direction: 'Centre',practice: 'Grounding barefoot meditation',             affirmation: 'I am stable, rooted, and abundant.' },
  Metal: { crystal: 'Clear Quartz or White Jade',     colour: 'White & Gold',   direction: 'West',  practice: 'Decluttering and breathwork',              affirmation: 'I attract precision and excellence.' },
  Water: { crystal: 'Black Tourmaline or Aquamarine', colour: 'Black & Navy',   direction: 'North', practice: 'Flow journaling and water rituals',        affirmation: 'I flow with wisdom and ease.' },
};

const getPillarEnergy = (p: LuckPillar, favElems: string[]): 'supportive' | 'neutral' | 'challenging' => {
  const good = [p.stem.element, p.branch.element].filter(e => favElems.includes(e)).length;
  if (good >= 2) return 'supportive';
  if (good === 1) return 'neutral';
  return 'challenging';
};

const ENERGY_STYLE: Record<string, { color: string; label: string; icon: string }> = {
  supportive:  { color: '#16a34a', label: 'Supportive Decade',   icon: '✨' },
  neutral:     { color: '#f59e0b', label: 'Mixed Energy Decade', icon: '⚖️' },
  challenging: { color: '#ef4444', label: 'Growth Decade',       icon: '🔥' },
};

const LuckPillars: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { luckPillars, chart, loading, error } = useAppSelector((s) => s.bazi);
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => { dispatch(fetchLuckPillars()); }, [dispatch]);

  const favElems = chart?.favorable_elements ?? [];

  const pageLayout = (content: React.ReactNode) => (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8f6ff' }}>
      <Sidebar /><div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}><Header />
        <main style={{ flex: 1, padding: 32, overflowY: 'auto' }}>{content}</main>
      </div>
    </div>
  );

  if (loading) return pageLayout(<div style={{ color: '#9ca3af' }}>Calculating luck pillars…</div>);
  if (error || !luckPillars) return pageLayout(
    <div style={{ textAlign: 'center', paddingTop: 60 }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🌀</div>
      <div style={{ color: '#7c3aed', fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Profile Required</div>
      <div style={{ color: '#6b7280', fontSize: 14, marginBottom: 24 }}>Set up your birth data to calculate your luck pillars.</div>
      <button onClick={() => navigate('/profile')} style={{ padding: '10px 24px', backgroundColor: '#7c3aed', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>Set Up Profile →</button>
    </div>
  );

  return pageLayout(
    <>
      <h2 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 700, color: '#2e1065' }}>🌀 Luck Pillars 大运</h2>
      <p style={{ color: '#6b7280', fontSize: 13, margin: '0 0 24px' }}>Your 10-year luck cycles — click any pillar to reveal your decade prediction and remedies.</p>

      {/* Meta */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: 10, padding: '14px 20px', border: '1px solid #ede9fe', marginBottom: 24, display: 'flex', gap: 28, flexWrap: 'wrap' }}>
        <div><div style={{ fontSize: 11, color: '#6b7280', marginBottom: 4 }}>Direction</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#7c3aed' }}>{luckPillars.direction === 'forward' ? '↗ Forward 顺行' : '↙ Backward 逆行'}</div></div>
        <div><div style={{ fontSize: 11, color: '#6b7280', marginBottom: 4 }}>First Pillar Starts</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#7c3aed' }}>Age {luckPillars.start_age}</div></div>
        <div><div style={{ fontSize: 11, color: '#6b7280', marginBottom: 4 }}>Total Pillars</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#7c3aed' }}>{luckPillars.pillars.length} × 10 years</div></div>
      </div>

      {/* Pillars */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {luckPillars.pillars.map((p: LuckPillar, i: number) => {
          const sColor   = ELEM_COLOR[p.stem.element];
          const bColor   = ELEM_COLOR[p.branch.element];
          const energy   = getPillarEnergy(p, favElems);
          const estyl    = ENERGY_STYLE[energy];
          const decade   = STEM_DECADE[p.stem.en] ?? STEM_DECADE['Yang Wood'];
          const remedy   = BRANCH_REMEDY[p.branch.element];
          const isOpen   = expanded === i;
          const isCurrent = p.age_start <= 35 && p.age_end >= 25; // rough "current" detection

          return (
            <div key={i} style={{ backgroundColor: '#ffffff', borderRadius: 12, border: `1px solid ${isOpen ? sColor + '66' : '#ede9fe'}`, overflow: 'hidden', transition: 'border-color 0.2s' }}>
              {/* Pillar header row — always visible */}
              <div
                onClick={() => setExpanded(isOpen ? null : i)}
                style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', cursor: 'pointer', flexWrap: 'wrap' }}
              >
                {/* Node */}
                <div style={{ width: 56, height: 56, borderRadius: '50%', backgroundColor: sColor + '20', border: `2px solid ${sColor}66`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: 20, fontWeight: 900, color: sColor, lineHeight: 1 }}>{p.stem.cn}</span>
                  <span style={{ fontSize: 9, color: '#6b7280' }}>#{i + 1}</span>
                </div>
                {/* Branch */}
                <div style={{ backgroundColor: bColor + '18', border: `1px solid ${bColor}44`, borderRadius: 8, padding: '6px 12px', textAlign: 'center', minWidth: 60 }}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: bColor, lineHeight: 1 }}>{p.branch.cn}</div>
                  <div style={{ fontSize: 10, color: bColor + 'cc' }}>{p.branch.en}</div>
                </div>
                {/* Info */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#1f2937' }}>{p.name}</span>
                    <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 10, backgroundColor: estyl.color + '22', color: estyl.color, border: `1px solid ${estyl.color}44` }}>{estyl.icon} {estyl.label}</span>
                    {isCurrent && <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 8, backgroundColor: '#ede9fe', color: '#7c3aed', border: '1px solid #c4b5fd' }}>● Active</span>}
                  </div>
                  <div style={{ fontSize: 12, color: '#9ca3af' }}>
                    Age {p.age_start}–{p.age_end} &nbsp;·&nbsp;
                    <span style={{ color: sColor }}>{p.stem.element}</span> / <span style={{ color: bColor }}>{p.branch.element}</span>
                  </div>
                  <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2, fontStyle: 'italic' }}>{decade.theme}</div>
                </div>
                <span style={{ color: isOpen ? '#7c3aed' : '#9ca3af', fontSize: 18, transition: 'color 0.15s' }}>{isOpen ? '▲' : '▼'}</span>
              </div>

              {/* Expanded content */}
              {isOpen && (
                <div style={{ borderTop: '1px solid #e8e3f8', padding: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                  {/* Prediction */}
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#7c3aed', marginBottom: 12 }}>📖 Decade Prediction (Age {p.age_start}–{p.age_end})</div>
                    <div style={{ backgroundColor: estyl.color + '10', border: `1px solid ${estyl.color}33`, borderRadius: 10, padding: '14px 16px', marginBottom: 12 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: estyl.color, marginBottom: 6 }}>{estyl.icon} {decade.theme}</div>
                      <div style={{ fontSize: 13, color: '#1f2937', lineHeight: 1.7, marginBottom: 8 }}><strong style={{ color: '#a78bfa' }}>Opportunity:</strong> {decade.opportunity}</div>
                      <div style={{ fontSize: 13, color: '#9ca3af', lineHeight: 1.6 }}><strong style={{ color: '#6b7280' }}>Challenge:</strong> {decade.challenge}</div>
                    </div>
                    <div style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.6 }}>
                      {energy === 'supportive' && `Both ${p.stem.element} and ${p.branch.element} align with your favorable elements — this is a decade of natural flow and amplified luck.`}
                      {energy === 'neutral' && `Mixed elemental energy means strategic effort yields rewards. Align actions with your favorable elements to maximise this decade.`}
                      {energy === 'challenging' && `This decade's elements conflict with your chart — but challenge decades forge the greatest strength. Focus on inner cultivation and patience.`}
                    </div>
                  </div>

                  {/* Remedies */}
                  {remedy && (
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#7c3aed', marginBottom: 12 }}>💎 Decade Remedies ({p.branch.element} Energy)</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {[
                          { icon: '💎', label: 'Crystal',       value: remedy.crystal },
                          { icon: '🎨', label: 'Lucky Colours', value: remedy.colour },
                          { icon: '🧭', label: 'Power Direction', value: remedy.direction },
                          { icon: '🧘', label: 'Daily Practice', value: remedy.practice },
                        ].map(r => (
                          <div key={r.label} style={{ backgroundColor: '#f5f3ff', borderRadius: 8, padding: '10px 14px', border: '1px solid #f3f4f6' }}>
                            <span style={{ fontSize: 12, color: '#6b7280' }}>{r.icon} {r.label}: </span>
                            <span style={{ fontSize: 12, color: '#1f2937', fontWeight: 500 }}>{r.value}</span>
                          </div>
                        ))}
                        <div style={{ backgroundColor: '#f5f3ff', borderRadius: 8, padding: '10px 14px', border: '1px solid #e2d9f3', marginTop: 4 }}>
                          <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 4 }}>Decade Affirmation</div>
                          <div style={{ fontSize: 13, color: '#7c3aed', fontStyle: 'italic' }}>"{remedy.affirmation}"</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Guide */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: 12, padding: 20, border: '1px solid #f3f4f6', marginTop: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#7c3aed', marginBottom: 10 }}>How to Read Your Luck Pillars</div>
        <div style={{ fontSize: 12, color: '#9ca3af', lineHeight: 1.7 }}>
          Each luck pillar (大运) governs approximately 10 years. The <strong style={{ color: '#1f2937' }}>Heavenly Stem</strong> influences years 1–5,
          and the <strong style={{ color: '#1f2937' }}>Earthly Branch</strong> governs years 6–10. Pillars whose elements match your
          <strong style={{ color: '#1f2937' }}> favorable elements</strong> bring natural flow and amplified luck.
          Click any pillar to reveal your personalised prediction and decade remedies.
        </div>
      </div>
    </>
  );
};

export default LuckPillars;
