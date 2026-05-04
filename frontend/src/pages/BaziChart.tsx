import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/store';
import { fetchBaziChart } from '../store/slices/baziSlice';
import { Pillar, Stem } from '../store/slices/baziSlice';
import Sidebar from '../components/Common/Sidebar';
import Header  from '../components/Common/Header';

const ELEM_COLOR: Record<string, string> = {
  Wood: '#22c55e', Fire: '#ef4444', Earth: '#f59e0b', Metal: '#94a3b8', Water: '#3b82f6',
};

// ── Animal characterisations ──────────────────────────────────────────────────
const ANIMAL_PROFILE: Record<string, {
  traits: string[]; strengths: string; challenge: string;
  lifeTheme: string; year2026: string; compatibility: string;
}> = {
  Rat:     { traits: ['Intelligent','Resourceful','Charming','Adaptable'],
             strengths: 'Natural strategist — quick to spot opportunity and turn information into advantage.',
             challenge: 'Can be overly cautious or calculating; learns to trust intuition over intellect.',
             lifeTheme: 'Mastering cycles of abundance through wit and connection.',
             year2026: '2026 (Fire Horse): Dynamic financial energy. Network boldly — unexpected alliances bring breakthroughs. Guard against impulsive spending.',
             compatibility: 'Best with Dragon and Monkey; tension with Horse.' },
  Ox:      { traits: ['Dependable','Patient','Methodical','Honest'],
             strengths: 'Exceptional at building lasting foundations. Delivers what others only promise.',
             challenge: 'Stubbornness can slow necessary change; learning flexibility is the lifelong lesson.',
             lifeTheme: 'Creating enduring legacy through diligence and integrity.',
             year2026: '2026 (Fire Horse): Steady upward climb. Your persistence pays off mid-year. Avoid stubbornly clinging to outdated plans — adapt to the Fire energy.',
             compatibility: 'Best with Snake and Rooster; tension with Goat.' },
  Tiger:   { traits: ['Brave','Charismatic','Ambitious','Independent'],
             strengths: 'Natural leader who inspires others into action. Fearless in pursuit of goals.',
             challenge: 'Impulsiveness and pride can sabotage long-term plans; patience is power.',
             lifeTheme: 'Channeling fierce energy into purposeful leadership.',
             year2026: '2026 (Fire Horse): High-visibility year — be bold and seize the spotlight. Fire fuels your natural charisma. Major career moves are favoured.',
             compatibility: 'Best with Horse and Dog; tension with Monkey.' },
  Rabbit:  { traits: ['Diplomatic','Empathetic','Artistic','Perceptive'],
             strengths: 'Masters of harmony and negotiation. Sees the beauty and potential in all situations.',
             challenge: 'Avoidance of conflict can lead to unexpressed needs building up over time.',
             lifeTheme: 'Creating beauty and peace as a healing force for others.',
             year2026: '2026 (Fire Horse): Relationships flourish. Creative projects gain recognition. The Horse\'s speed complements your grace — trust your instincts in partnerships.',
             compatibility: 'Best with Goat and Pig; tension with Rooster.' },
  Dragon:  { traits: ['Visionary','Magnetic','Ambitious','Courageous'],
             strengths: 'Largest energy in the zodiac — able to manifest extraordinary outcomes through sheer force of will.',
             challenge: 'Dragon energy can overwhelm others; learning to collaborate amplifies power.',
             lifeTheme: 'Transforming impossible visions into tangible reality.',
             year2026: '2026 (Fire Horse): Clash energy — the Horse challenges Dragon\'s dominance. Major restructuring or pivot likely. Avoid ego conflicts; choose diplomacy.',
             compatibility: 'Best with Rat and Monkey; tension with Dog.' },
  Snake:   { traits: ['Wise','Intuitive','Strategic','Perceptive'],
             strengths: 'Deep thinker who sees beneath the surface. Excellence in research, strategy, and the hidden arts.',
             challenge: 'Secretiveness and jealousy can undermine trust; vulnerability is strength.',
             lifeTheme: 'Wielding quiet wisdom to navigate the unseen forces of life.',
             year2026: '2026 (Fire Horse): Financial strategy pays off. Keep a low profile in Q1 and Q2, then expand in H2. Intuition is your superpower this year.',
             compatibility: 'Best with Ox and Rooster; tension with Pig.' },
  Horse:   { traits: ['Adventurous','Independent','Energetic','Free-spirited'],
             strengths: 'Unstoppable forward momentum. Born to explore, connect, and inspire through action.',
             challenge: 'Restlessness can lead to abandoning projects before completion; stamina is the lesson.',
             lifeTheme: 'Inspiring others through relentless pursuit of freedom and passion.',
             year2026: '2026 (Fire Horse): This is YOUR year — but it\'s also a Clash Year (太岁). Expect major life changes, relocations, or career pivots. Embrace transformation.',
             compatibility: 'Best with Tiger and Dog; tension with Rat.' },
  Goat:    { traits: ['Gentle','Creative','Compassionate','Nurturing'],
             strengths: 'Deeply empathic creative force. Brings beauty, care, and artistry to everything.',
             challenge: 'Dependency and indecision; developing self-reliance is the core growth path.',
             lifeTheme: 'Using compassion and creativity as tools for collective healing.',
             year2026: '2026 (Fire Horse): Collaborative energy is your strength. Joint ventures and creative partnerships bloom. Financial support arrives through genuine connections.',
             compatibility: 'Best with Rabbit and Pig; tension with Ox.' },
  Monkey:  { traits: ['Clever','Versatile','Innovative','Witty'],
             strengths: 'Master problem-solver and inventor. Can adapt to any situation and find creative solutions.',
             challenge: 'Can be unreliable or manipulative when challenged; integrity builds lasting success.',
             lifeTheme: 'Using brilliance and adaptability to evolve beyond limitations.',
             year2026: '2026 (Fire Horse): Innovation and breakthroughs — especially in tech and communication. A year of clever pivots and unexpected windfalls. Trust your ingenuity.',
             compatibility: 'Best with Rat and Dragon; tension with Tiger.' },
  Rooster: { traits: ['Meticulous','Honest','Hardworking','Confident'],
             strengths: 'Exceptional attention to detail and systems. Delivers precision and excellence reliably.',
             challenge: 'Perfectionism and criticism of self and others; compassion softens the path.',
             lifeTheme: 'Building excellence through discipline and honest self-expression.',
             year2026: '2026 (Fire Horse): Stable but watch finances carefully. Your precision is an asset in uncertain markets. Guard health — prioritise rest mid-year.',
             compatibility: 'Best with Ox and Snake; tension with Rabbit.' },
  Dog:     { traits: ['Loyal','Honest','Protective','Reliable'],
             strengths: 'Unwavering loyalty and moral compass. Natural protector who creates safety for others.',
             challenge: 'Anxiety and pessimism in uncertain times; faith and play restore balance.',
             lifeTheme: 'Standing as a guardian of truth and justice in all relationships.',
             year2026: '2026 (Fire Horse): New connections and social expansion. Career advancement through authentic relationships. An important friendship or mentor arrives.',
             compatibility: 'Best with Tiger and Horse; tension with Dragon.' },
  Pig:     { traits: ['Generous','Sincere','Optimistic','Trusting'],
             strengths: 'Pure-hearted abundance consciousness. Attracts good fortune through genuine generosity.',
             challenge: 'Naïve trust can lead to being taken advantage of; healthy boundaries protect the gift.',
             lifeTheme: 'Embodying unconditional joy and generosity as a portal to abundance.',
             year2026: '2026 (Fire Horse): Abundance through giving. Philanthropic or community-focused work brings unexpected rewards. Protect your energy from energy-draining situations.',
             compatibility: 'Best with Rabbit and Goat; tension with Snake.' },
};

// ── Year overlay (current year 2026 = Bing Wu 丙午 Fire Horse) ────────────────
const YEAR_ENERGY = {
  year: 2026, name: 'Fire Horse', cn: '丙午', pinyin: 'Bǐng Wǔ',
  theme: 'Speed, Visibility & Transformation',
  overview: 'The Fire Horse year brings explosive energy, rapid change, and bold moves rewarded. Cautious plans made in 2025 can now be launched with confidence. This is a year of high visibility — those who act decisively attract major opportunities. Fire amplifies passion, creativity, and social connection, while Horse energy drives restlessness and the urge for freedom. Expect industry disruptions, technological breakthroughs, and passionate new connections globally.',
  goodFor: ['Launching ventures','Public speaking','Travel','Bold creative work','New relationships'],
  watchOut: ['Impulsive financial decisions','Burning out','Conflicts of ego','Overcommitting'],
};

// ── Sub-components ─────────────────────────────────────────────────────────────
const PillarCard: React.FC<{ pillar: Pillar; title: string }> = ({ pillar, title }) => {
  const sColor = ELEM_COLOR[pillar.stem.element];
  const bColor = ELEM_COLOR[pillar.branch.element];
  return (
    <div style={{ backgroundColor: '#16152e', borderRadius: 12, padding: '20px 16px', border: '1px solid rgba(139,92,246,0.2)', textAlign: 'center', flex: 1 }}>
      <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 12, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>{title}</div>
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 42, fontWeight: 900, color: sColor, textShadow: `0 0 20px ${sColor}66`, lineHeight: 1 }}>{pillar.stem.cn}</div>
        <div style={{ fontSize: 11, color: sColor + 'cc', marginTop: 4 }}>{pillar.stem.en}</div>
      </div>
      <div style={{ backgroundColor: bColor + '18', border: `1px solid ${bColor}44`, borderRadius: 8, padding: '10px 8px', marginBottom: 10 }}>
        <div style={{ fontSize: 36, fontWeight: 900, color: bColor }}>{pillar.branch.cn}</div>
        <div style={{ fontSize: 11, color: bColor + 'cc', marginTop: 2 }}>{pillar.branch.en} · {pillar.branch.element}</div>
      </div>
      {pillar.hidden_stems.length > 0 && (
        <div>
          <div style={{ fontSize: 10, color: '#4b5563', marginBottom: 4 }}>Hidden Stems 藏干</div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 4, flexWrap: 'wrap' }}>
            {pillar.hidden_stems.map((s: Stem) => (
              <span key={s.cn} style={{ fontSize: 12, padding: '2px 7px', borderRadius: 10, backgroundColor: ELEM_COLOR[s.element] + '22', color: ELEM_COLOR[s.element], border: `1px solid ${ELEM_COLOR[s.element]}44` }}>{s.cn}</span>
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
          <div key={elem} style={{ flex: cnt / total, backgroundColor: ELEM_COLOR[elem], transition: 'flex 0.4s' }} title={`${elem}: ${cnt}`} />
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

const AnimalCard: React.FC<{ animal: string; pillarTitle: string }> = ({ animal, pillarTitle }) => {
  const profile = ANIMAL_PROFILE[animal];
  if (!profile) return null;
  return (
    <div style={{ backgroundColor: '#16152e', borderRadius: 12, padding: '18px 20px', border: '1px solid rgba(139,92,246,0.2)', flex: 1, minWidth: 240 }}>
      <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 6, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>{pillarTitle}</div>
      <div style={{ fontSize: 18, fontWeight: 800, color: '#e9d5ff', marginBottom: 10 }}>The {animal}</div>
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 12 }}>
        {profile.traits.map(t => (
          <span key={t} style={{ padding: '2px 8px', borderRadius: 12, fontSize: 11, backgroundColor: 'rgba(139,92,246,0.15)', color: '#c4b5fd', border: '1px solid rgba(139,92,246,0.3)' }}>{t}</span>
        ))}
      </div>
      <div style={{ fontSize: 13, color: '#d1d5db', lineHeight: 1.6, marginBottom: 8 }}><strong style={{ color: '#a78bfa' }}>Strengths:</strong> {profile.strengths}</div>
      <div style={{ fontSize: 13, color: '#9ca3af', lineHeight: 1.6, marginBottom: 8 }}><strong style={{ color: '#6b7280' }}>Growth Edge:</strong> {profile.challenge}</div>
      <div style={{ fontSize: 12, color: '#6b7280', fontStyle: 'italic', marginBottom: 12, lineHeight: 1.5 }}>Life Theme: "{profile.lifeTheme}"</div>
      <div style={{ backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8, padding: '10px 12px' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#fca5a5', marginBottom: 4 }}>🔥 {YEAR_ENERGY.year} Forecast</div>
        <div style={{ fontSize: 12, color: '#e5e7eb', lineHeight: 1.6 }}>{profile.year2026}</div>
      </div>
      <div style={{ fontSize: 11, color: '#6b7280', marginTop: 10 }}>🤝 {profile.compatibility}</div>
    </div>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────────
const BaziChart: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { chart, loading, error } = useAppSelector((s) => s.bazi);
  const [showYear, setShowYear] = useState(true);

  useEffect(() => { dispatch(fetchBaziChart()); }, [dispatch]);

  if (loading) return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0f0e1a' }}>
      <Sidebar /><div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}><Header />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>Calculating your chart…</div>
      </div>
    </div>
  );

  if (error || !chart) return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0f0e1a' }}>
      <Sidebar /><div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}><Header />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>☯</div>
          <div style={{ color: '#c4b5fd', fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Profile Required</div>
          <div style={{ color: '#6b7280', fontSize: 14, marginBottom: 24 }}>Enter your birth data to generate your Bazi chart.</div>
          <button onClick={() => navigate('/profile')} style={{ padding: '10px 24px', backgroundColor: '#7c3aed', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>Set Up Profile →</button>
        </div>
      </div>
    </div>
  );

  const pillars = [
    { key: 'year',  title: 'Year Pillar 年柱',  pillar: chart.year  },
    { key: 'month', title: 'Month Pillar 月柱', pillar: chart.month },
    { key: 'day',   title: 'Day Pillar 日柱',   pillar: chart.day   },
    { key: 'hour',  title: 'Hour Pillar 时柱',  pillar: chart.hour  },
  ];
  const dmColor = ELEM_COLOR[chart.day_master.element];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0f0e1a' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header />
        <main style={{ flex: 1, padding: 32, overflowY: 'auto' }}>
          <h2 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 700, color: '#e9d5ff' }}>🀄 Four Pillars Chart 四柱八字</h2>
          <p style={{ color: '#6b7280', fontSize: 13, margin: '0 0 28px' }}>Your Bazi (八字) — the eight characters that define your elemental blueprint.</p>

          {/* Day Master */}
          <div style={{ backgroundColor: dmColor + '18', border: `1px solid ${dmColor}44`, borderRadius: 12, padding: '16px 22px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
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
                    <span key={e} style={{ padding: '3px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600, backgroundColor: ELEM_COLOR[e] + '28', color: ELEM_COLOR[e], border: `1px solid ${ELEM_COLOR[e]}55` }}>{e}</span>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 6 }}>Avoid</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {chart.unfavorable_elements.map((e) => (
                    <span key={e} style={{ padding: '3px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600, backgroundColor: '#1f1f2e', color: '#6b7280', border: '1px solid rgba(255,255,255,0.1)' }}>{e}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Four Pillars */}
          <div style={{ display: 'flex', gap: 14, marginBottom: 28, flexWrap: 'wrap' }}>
            {pillars.map(({ key, title, pillar }) => <PillarCard key={key} pillar={pillar} title={title} />)}
          </div>

          {/* Element balance */}
          <div style={{ backgroundColor: '#16152e', borderRadius: 12, padding: 22, border: '1px solid rgba(139,92,246,0.2)', marginBottom: 24 }}>
            <ElementBar balance={chart.element_balance} />
          </div>

          {/* ── Animal Characterisations ── */}
          <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#e9d5ff' }}>🐉 Your Animal Signs & {YEAR_ENERGY.year} Predictions</h3>
            <button onClick={() => setShowYear(v => !v)} style={{ background: 'none', border: '1px solid rgba(139,92,246,0.3)', color: '#9ca3af', padding: '5px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>
              {showYear ? 'Hide' : 'Show'} Year Energy
            </button>
          </div>

          {/* Current year energy banner */}
          {showYear && (
            <div style={{ backgroundColor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 12, padding: '16px 20px', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 10, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontSize: 28, fontWeight: 900, color: '#ef4444', lineHeight: 1 }}>{YEAR_ENERGY.cn}</div>
                  <div style={{ fontSize: 11, color: '#9ca3af' }}>{YEAR_ENERGY.pinyin}</div>
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#fca5a5' }}>{YEAR_ENERGY.year} · {YEAR_ENERGY.name}</div>
                  <div style={{ fontSize: 12, color: '#9ca3af' }}>{YEAR_ENERGY.theme}</div>
                </div>
              </div>
              <p style={{ fontSize: 13, color: '#e5e7eb', lineHeight: 1.7, margin: '0 0 10px' }}>{YEAR_ENERGY.overview}</p>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontSize: 11, color: '#4ade80', fontWeight: 600, marginBottom: 4 }}>✅ Favoured in {YEAR_ENERGY.year}</div>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {YEAR_ENERGY.goodFor.map(g => <span key={g} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 10, backgroundColor: 'rgba(34,197,94,0.15)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.3)' }}>{g}</span>)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: '#f87171', fontWeight: 600, marginBottom: 4 }}>⚠️ Watch Out</div>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {YEAR_ENERGY.watchOut.map(w => <span key={w} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 10, backgroundColor: 'rgba(239,68,68,0.12)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' }}>{w}</span>)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Animal cards for all 4 pillars */}
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 24 }}>
            {pillars.map(({ key, title, pillar }) => (
              <AnimalCard key={key} animal={pillar.branch.en} pillarTitle={title} />
            ))}
          </div>

          {/* Pinyin reference */}
          <div style={{ backgroundColor: '#16152e', borderRadius: 12, padding: 20, border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: 13, color: '#9ca3af', marginBottom: 14, fontWeight: 600 }}>Pillar Reference 柱名对照</div>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              {pillars.map(({ title, pillar }) => (
                <div key={title} style={{ minWidth: 110 }}>
                  <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 4 }}>{title.split(' ')[0]}</div>
                  <div style={{ fontSize: 18, color: '#e5e7eb' }}>{pillar.name}</div>
                  <div style={{ fontSize: 11, color: '#9ca3af' }}>{pillar.stem.pinyin} {pillar.branch.pinyin}</div>
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
