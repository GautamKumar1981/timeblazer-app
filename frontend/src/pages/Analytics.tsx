import React from 'react';
import { useAppSelector } from '../store/store';
import Sidebar from '../components/Common/Sidebar';
import Header  from '../components/Common/Header';
import { useIsMobile } from '../hooks/useIsMobile';

const ELEM_COLOR: Record<string, string> = {
  Wood: '#16a34a', Fire: '#ef4444', Earth: '#f59e0b', Metal: '#6b7280', Water: '#2563eb',
};

// ── Remedy data ───────────────────────────────────────────────────────────────
const DAILY_REMEDIES: Record<string, { morning: string; afternoon: string; evening: string; avoid: string }> = {
  Wood:  { morning: 'Face East and take 10 deep breaths near a plant or tree. Visualise green light entering your chest.', afternoon: 'Take a short walk in nature. Wear green or teal clothing to amplify Wood energy.', evening: 'Write in a journal — capture growth intentions before sleep. Place fresh flowers by your bed.', avoid: 'Confrontation, metal-heavy spaces, and overly structured environments.' },
  Fire:  { morning: 'Light a red or orange candle for 5 minutes. Recite your top 3 intentions aloud with passion.', afternoon: 'Engage socially — Fire needs expression. Share your ideas boldly in meetings or conversations.', evening: 'Dim the lights and use warm amber tones. Avoid screens 1 hour before bed.', avoid: 'Cold environments, isolation, and water-dominated spaces.' },
  Earth: { morning: 'Sit barefoot on the ground or floor for 5 minutes. Hold a citrine or yellow jasper crystal.', afternoon: 'Eat grounding foods — root vegetables, whole grains. Stay centred in long-term thinking.', evening: 'Tidy and declutter one space. Burn sandalwood or patchouli incense.', avoid: 'Overthinking, scattered energy, and damp environments.' },
  Metal: { morning: 'Declutter one drawer or surface. Set a precise intention for the day — Metal rewards clarity.', afternoon: 'Focus on detail-oriented tasks: contracts, finances, editing, planning.', evening: 'White or gold colours in your space. Breathwork or singing bowls to clear stagnant chi.', avoid: 'Messy environments, vague plans, and emotional over-reactions.' },
  Water: { morning: 'Drink a full glass of water mindfully. Place your palms on a bowl of water and set an intention.', afternoon: 'Research, writing, or deep creative work. Trust your intuition over logic today.', evening: 'A bath or foot soak with black salt. Journal your dreams and subconscious insights.', avoid: 'Rigid thinking, harsh environments, and overexertion.' },
};

const MONTHLY_REMEDIES: Record<string, string[]> = {
  Wood:  ['Activate the East sector of your home with a healthy plant or water feature.', 'Wear jade or green tourmaline jewellery for sustained growth energy.', 'Begin a new learning course or skill — Wood months reward intellectual seeds.'],
  Fire:  ['Activate the South sector with red decor, candles, or a bright lamp.', 'Network aggressively — attend events, pitch ideas, build visibility.', 'Wear ruby, garnet, or red coral to amplify Fire month blessings.'],
  Earth: ['Repair or refresh the centre of your home — the earth palace governs this month.', 'Make long-term financial decisions: property, savings, investments.', 'Wear yellow sapphire or citrine for Earth month abundance.'],
  Metal: ['Activate the West sector with white flowers or metallic décor.', 'Sign contracts, resolve legal matters, and finalise important agreements.', 'Wear clear quartz or white jade for Metal month precision.'],
  Water: ['Activate the North sector with a small water feature or dark blue accents.', 'Prioritise research, travel planning, and deep introspective work.', 'Wear aquamarine, lapis lazuli, or black tourmaline for Water month wisdom.'],
};

const YEARLY_REMEDIES: Record<string, { theme: string; tips: string[]; affirmation: string }> = {
  Wood:  { theme: 'Year of Growth & Vision',    tips: ['Invest in education and personal development.', 'Start a business or creative project — Wood years reward new beginnings.', 'Surround yourself with thriving green plants in your workspace.'], affirmation: 'This year I plant seeds that will bear fruit for decades.' },
  Fire:  { theme: 'Year of Passion & Momentum', tips: ['Launch products, brands, and public-facing ventures.', 'Build your social network — Fire years reward visibility.', 'Use red, orange, and gold in your branding and wardrobe.'], affirmation: 'This year I step fully into my light and lead with confidence.' },
  Earth: { theme: 'Year of Stability & Legacy', tips: ['Focus on property, family, and long-term wealth building.', 'Centre decisions around legacy and what lasts beyond you.', 'Yellow and amber crystals on your wealth altar this year.'], affirmation: 'This year I build foundations that stand for generations.' },
  Metal: { theme: 'Year of Precision & Justice', tips: ['Legal matters, contracts, and financial planning are favoured.', 'Cleanse and declutter your entire home and workspace in Q1.', 'White quartz and metallic accents attract Metal year fortune.'], affirmation: 'This year I attract clarity, precision, and just rewards.' },
  Water: { theme: 'Year of Wisdom & Flow',       tips: ['Deep study, travel, and spiritual practices bring greatest returns.', 'Trust your intuition — Water years reward inner knowing over outer logic.', 'A water feature in the North sector activates annual wealth flow.'], affirmation: 'This year I flow with effortless wisdom toward my highest path.' },
};

// ── Lucky Items ───────────────────────────────────────────────────────────────
const LUCKY_ITEMS: Record<string, {
  gemstones: { name: string; benefit: string }[];
  bracelets: { name: string; benefit: string }[];
  amulets:   { name: string; benefit: string }[];
}> = {
  Wood:  {
    gemstones: [{ name: 'Green Aventurine', benefit: 'Attracts opportunity and good luck' }, { name: 'Jade', benefit: 'Prosperity, harmony and longevity' }, { name: 'Emerald', benefit: 'Growth, abundance and heart healing' }],
    bracelets: [{ name: 'Jade Bangle', benefit: 'Protection and wealth accumulation' }, { name: 'Green Tourmaline Bracelet', benefit: 'Activates Wood energy and creativity' }],
    amulets:   [{ name: 'Kuan Yin Pendant', benefit: 'Compassion, guidance and protection' }, { name: 'Bamboo Charm', benefit: 'Resilience and steady growth' }],
  },
  Fire:  {
    gemstones: [{ name: 'Ruby', benefit: 'Passion, leadership and vitality' }, { name: 'Red Jasper', benefit: 'Courage, stamina and grounding' }, { name: 'Carnelian', benefit: 'Creativity, motivation and success' }],
    bracelets: [{ name: 'Red Coral Bracelet', benefit: 'Protection and Fire energy amplification' }, { name: 'Garnet Bracelet', benefit: 'Passion, commitment and abundance' }],
    amulets:   [{ name: 'Dragon Amulet', benefit: 'Power, authority and good fortune' }, { name: 'Phoenix Charm', benefit: 'Transformation and rebirth' }],
  },
  Earth: {
    gemstones: [{ name: 'Citrine', benefit: 'Wealth manifestation and positivity' }, { name: 'Yellow Sapphire', benefit: 'Wisdom, prosperity and Jupiter blessings' }, { name: 'Tiger\'s Eye', benefit: 'Clarity, protection and willpower' }],
    bracelets: [{ name: 'Citrine Bracelet', benefit: 'Activates abundance and solar plexus' }, { name: 'Yellow Jade Bracelet', benefit: 'Stability and Earth energy grounding' }],
    amulets:   [{ name: 'Pi Yao (Pixiu)', benefit: 'Attracts and retains wealth' }, { name: 'Earth God (Tu Di Gong) Charm', benefit: 'Blessings on property and business' }],
  },
  Metal: {
    gemstones: [{ name: 'Clear Quartz', benefit: 'Amplifies all intentions and clarity' }, { name: 'White Jade', benefit: 'Purity, protection and good fortune' }, { name: 'Pyrite', benefit: 'Wealth attraction and manifestation' }],
    bracelets: [{ name: 'White Crystal Bracelet', benefit: 'Clarity, precision and Metal energy' }, { name: 'Hematite Bracelet', benefit: 'Grounding, protection and strength' }],
    amulets:   [{ name: 'Guan Yu Pendant', benefit: 'Justice, protection and business success' }, { name: 'Sword Charm', benefit: 'Cutting through obstacles and clarity' }],
  },
  Water: {
    gemstones: [{ name: 'Aquamarine', benefit: 'Calm, courage and clear communication' }, { name: 'Black Tourmaline', benefit: 'Protection from negative energy' }, { name: 'Lapis Lazuli', benefit: 'Wisdom, intuition and spiritual insight' }],
    bracelets: [{ name: 'Obsidian Bracelet', benefit: 'Protection and Water energy flow' }, { name: 'Aquamarine Bracelet', benefit: 'Emotional balance and communication' }],
    amulets:   [{ name: 'Mazu Pendant', benefit: 'Safe travels and navigation of life\'s waters' }, { name: 'Black Pi Xiu', benefit: 'Protection and wealth from hidden sources' }],
  },
};

const cardStyle: React.CSSProperties = {
  backgroundColor: '#fff', borderRadius: 14, padding: '16px',
  border: '1px solid #e8e3f8', boxShadow: '0 2px 8px rgba(124,58,237,0.06)',
};

const ComingSoon: React.FC<{ name: string; benefit: string }> = ({ name, benefit }) => (
  <div style={{ backgroundColor: '#f5f3ff', borderRadius: 8, padding: '12px 14px', border: '1px solid #e8e3f8', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
    <div>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#2e1065' }}>{name}</div>
      <div style={{ fontSize: 12, color: '#6b7280' }}>{benefit}</div>
    </div>
    <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, backgroundColor: '#ede9fe', color: '#6d28d9', border: '1px solid #c4b5fd', whiteSpace: 'nowrap', cursor: 'default' }}>
      🔗 Coming Soon
    </span>
  </div>
);

const Remedies: React.FC = () => {
  const { today, chart } = useAppSelector((s) => s.bazi);
  const dayElem   = today?.forecast?.pillar?.stem?.element ?? chart?.day_master?.element ?? 'Wood';
  const monthElem = chart?.day_master?.element ?? 'Wood';
  const yearElem  = 'Fire'; // 2026 = Fire Horse
  const favElems  = chart?.favorable_elements ?? [];
  const primaryElem = favElems[0] ?? dayElem;

  const isMobile = useIsMobile();

  const daily   = DAILY_REMEDIES[dayElem]   ?? DAILY_REMEDIES['Wood'];
  const monthly = MONTHLY_REMEDIES[monthElem] ?? MONTHLY_REMEDIES['Wood'];
  const yearly  = YEARLY_REMEDIES[yearElem]  ?? YEARLY_REMEDIES['Fire'];
  const items   = LUCKY_ITEMS[primaryElem]   ?? LUCKY_ITEMS['Wood'];
  const elemColor = ELEM_COLOR[primaryElem] ?? '#8b5cf6';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8f6ff', width: '100%', overflow: 'hidden' }}>
      <Sidebar />
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <Header />
        <main style={{ flex: 1, minWidth: 0, padding: '16px', overflowY: 'auto', boxSizing: 'border-box' }}>
          <h2 style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 800, color: '#2e1065' }}>💎 Remedies & Lucky Charms</h2>
          <p style={{ color: '#9ca3af', fontSize: 13, margin: '0 0 24px' }}>
            Personalised remedies based on your Bazi chart — aligned to today's energy, the current month, and the year.
          </p>

          {/* Primary element banner */}
          <div style={{ backgroundColor: elemColor + '12', border: `1px solid ${elemColor}33`, borderRadius: 12, padding: '14px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ fontSize: 28, color: elemColor }}>✦</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: elemColor }}>Your Primary Remedy Element: {primaryElem}</div>
              <div style={{ fontSize: 12, color: '#9ca3af' }}>All lucky items below are tuned to your Bazi's favorable energy. Day element: {dayElem} · Year: Fire (2026)</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))', gap: 20, marginBottom: 24 }}>
            {/* Daily Remedies */}
            <div style={cardStyle}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#4c1d95', marginBottom: 14 }}>🌅 Today's Remedies ({dayElem} Day)</div>
              {[
                { time: 'Morning', text: daily.morning, color: '#d97706' },
                { time: 'Afternoon', text: daily.afternoon, color: '#dc2626' },
                { time: 'Evening', text: daily.evening, color: '#2563eb' },
              ].map(r => (
                <div key={r.time} style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: r.color, marginBottom: 4 }}>{r.time}</div>
                  <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.6 }}>{r.text}</div>
                </div>
              ))}
              <div style={{ marginTop: 10, padding: '10px 12px', backgroundColor: '#fef2f2', borderRadius: 8, border: '1px solid #fecaca' }}>
                <div style={{ fontSize: 11, color: '#dc2626', fontWeight: 700, marginBottom: 3 }}>⚠️ Avoid Today</div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>{daily.avoid}</div>
              </div>
            </div>

            {/* Monthly Remedies */}
            <div style={cardStyle}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#4c1d95', marginBottom: 14 }}>🌙 Monthly Activations ({monthElem} Month)</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {monthly.map((tip, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <span style={{ fontSize: 16, flexShrink: 0 }}>{'🌿🔆💛🔮🌊'[i] ?? '✦'}</span>
                    <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.6 }}>{tip}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Yearly Remedies */}
          <div style={{ ...cardStyle, marginBottom: 24 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#dc2626', marginBottom: 6 }}>🔥 2026 Annual Remedies — {yearly.theme}</div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
              {yearly.tips.map((tip, i) => (
                <div key={i} style={{ flex: '1 1 220px', backgroundColor: '#fef2f2', borderRadius: 8, padding: '10px 14px', border: '1px solid #fecaca', fontSize: 13, color: '#374151', lineHeight: 1.6 }}>{tip}</div>
              ))}
            </div>
            <div style={{ backgroundColor: '#ede9fe', borderRadius: 8, padding: '10px 14px', border: '1px solid #c4b5fd', fontSize: 13, color: '#6d28d9', fontStyle: 'italic', textAlign: 'center' }}>
              ✨ Annual Affirmation: "{yearly.affirmation}"
            </div>
          </div>

          {/* Lucky Items */}
          <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700, color: '#2e1065' }}>🛍️ Your Lucky Charms & Amulets ({primaryElem} Element)</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 200px), 1fr))', gap: 16, marginBottom: 24 }}>
            {/* Gemstones */}
            <div style={cardStyle}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#4c1d95', marginBottom: 12 }}>💎 Lucky Gemstones</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {items.gemstones.map(g => <ComingSoon key={g.name} name={g.name} benefit={g.benefit} />)}
              </div>
            </div>
            {/* Bracelets */}
            <div style={cardStyle}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#4c1d95', marginBottom: 12 }}>📿 Lucky Bracelets</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {items.bracelets.map(b => <ComingSoon key={b.name} name={b.name} benefit={b.benefit} />)}
              </div>
            </div>
            {/* Amulets */}
            <div style={cardStyle}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#4c1d95', marginBottom: 12 }}>🏮 Lucky Amulets</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {items.amulets.map(a => <ComingSoon key={a.name} name={a.name} benefit={a.benefit} />)}
              </div>
            </div>
          </div>

          {/* Coming soon notice */}
          <div style={{ backgroundColor: '#ede9fe', border: '1px solid #c4b5fd', borderRadius: 12, padding: '16px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#6d28d9', marginBottom: 6 }}>🛒 DragonHour Lucky Shop — Coming Soon</div>
            <div style={{ fontSize: 13, color: '#6b7280' }}>
              We are curating a collection of authentic Bazi-aligned crystals, amulets, and ritual tools hand-selected by our masters.
              Subscribe to get early access and an exclusive founding member discount.
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Remedies;
