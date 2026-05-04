import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../store/store';

// ── Deity data ────────────────────────────────────────────────────────────────
const DEITY: Record<string, {
  name: string; cn: string; title: string; colour: string; emoji: string;
  image: string; desc: string; lore: string; mantra: string; mantraDesc: string;
}> = {
  Wood: {
    name: 'Guan Yin', cn: '觀音菩薩', title: 'Bodhisattva of Compassion',
    colour: '#22c55e', emoji: '🪷',
    image: 'https://upload.wikimedia.org/wikipedia/commons/9/9f/Kuan-yan_bodhisattva%2C_Northern_Sung_dynasty%2C_China%2C_c._1025%2C_wood%2C_Honolulu_Academy_of_Arts.jpg',
    desc: 'Guan Yin hears the cries of all beings and responds with infinite compassion. As a Wood Day Master you are guided by her energy of growth, empathy and healing. Call on her when you seek inner peace, forgiveness, or the wisdom to nurture without losing yourself.',
    lore: 'Guan Yin was once Princess Miao Shan, who refused to abandon her spiritual vows despite her father\'s fury. When he ordered her execution, flowers bloomed from the executioner\'s axe and he fell ill. She journeyed through the underworld and — instead of fleeing — transformed it into a paradise through sheer compassion. She returned to earth as a bodhisattva, vowing never to enter nirvana until every being was freed from suffering. Sailors call on her in storms; mothers pray to her for children; healers invoke her green light. Over ten thousand temples across Asia burn incense perpetually before her white stone image — the boundless mother of mercy who has never once turned away a sincere heart.',
    mantra: 'Om Mani Padme Hum',
    mantraDesc: 'The six-syllable jewel mantra of compassion. Each syllable purifies one of the six afflictions — pride, jealousy, desire, ignorance, greed, hatred.',
  },
  Fire: {
    name: 'Tai Yang', cn: '太陽星君', title: 'God of the Sun',
    colour: '#ef4444', emoji: '☀️',
    image: 'https://upload.wikimedia.org/wikipedia/commons/8/80/Xi_He.JPG',
    desc: 'Tai Yang is the radiant solar deity who illuminates all paths with clarity and warmth. As a Fire Day Master you carry his energy of leadership, visibility and passion. Meditate with his light to amplify confidence and burn away confusion.',
    lore: 'In the ancient chronicles, Tai Yang Gong drove a golden chariot across the heavens, pulled by ten luminous dragons. Legend tells that once ten suns existed — beloved children of the Jade Emperor — who all rose together and scorched the earth to near ruin. Crops withered, seas boiled, and people wept. The divine archer Hou Yi took up his red bow and shot down nine suns, leaving one to warm all life. The surviving sun, humbled and grateful, learned to carry warmth without devastation. Each first and fifteenth of the lunar month, devotees offer red flowers, citrus fruit and lit candles to the Sun God — praying for clarity of vision, the burning away of obstacles, and the luminous success that comes when you step fully into your own light.',
    mantra: 'Om Suryaya Namaha',
    mantraDesc: 'A Vedic-Taoist solar mantra honouring the sun deity. Chanting invokes radiance, divine clarity, and the dissolving of all shadows that obscure your path.',
  },
  Earth: {
    name: 'Tu Di Gong', cn: '土地公', title: 'God of the Earth & Abundance',
    colour: '#f59e0b', emoji: '🏯',
    image: 'https://upload.wikimedia.org/wikipedia/commons/9/9f/Shrine_of_the_Earth_God_-_panoramio.jpg',
    desc: 'Tu Di Gong is the beloved protector of land, communities and wealth built through honest effort. As an Earth Day Master you are rooted in his steady, nurturing frequency. Invoke him for stability, property blessings and grounded abundance.',
    lore: 'Tu Di Gong was once Zhang Fude — a virtuous government official of the Zhou dynasty so devoted to duty and so genuinely kind to ordinary people that even heaven took notice. When he died peacefully at the age of 102, the village\'s Earth Goddess appeared in every villager\'s dream that same night, announcing he would become the new Earth God. Unlike the grand celestial deities enthroned in jade palaces, Tu Di Gong chose the most intimate domain: he guards each village, each plot of soil, each family threshold. Farmers pray to him before planting seed; merchants bow before opening their stores; children leave fruit at his tiny roadside shrines. He lives right there with you — in every weathered stone figure nestled beneath an old banyan tree, receiving incense at dawn.',
    mantra: 'Om Prithiviye Namaha',
    mantraDesc: 'The mantra of sacred earth. Invokes deep groundedness, the blessing of home and land, and the slow-building abundance of honest labour.',
  },
  Metal: {
    name: 'Guan Yu', cn: '關聖帝君', title: 'God of Justice & Brotherhood',
    colour: '#94a3b8', emoji: '⚔️',
    image: 'https://upload.wikimedia.org/wikipedia/commons/e/ec/Guanyu-1.jpg',
    desc: 'Guan Yu is the righteous warrior deity revered for loyalty, justice and the protection of honour. As a Metal Day Master his incorruptible clarity resonates with your soul. Meditate with him for protection, cutting through deception and attracting loyal allies.',
    lore: 'Guan Yu swore a blood oath of brotherhood with Liu Bei and Zhang Fei beneath blooming peach trees during the chaos of the Three Kingdoms era. His Green Dragon Crescent Blade — said to weigh 82 jin — never wavered from righteousness. When captured by the warlord Cao Cao and lavished with gold, rank and the finest horses, he served honourably and returned every gift the moment he learned his brothers lived. He rode the Red Hare, swiftest horse under heaven, and each night studied the Spring and Autumn Annals by candlelight, seeking moral clarity. Today his red-faced image stands in police stations, triad halls, business offices and temple sanctuaries across Asia — because righteousness has no single allegiance. In his presence, deception dissolves and a person\'s true character is revealed for all to see.',
    mantra: 'Om Vajrapani Hum',
    mantraDesc: 'The mantra of Vajrapani, deity of thunderbolt power. Invokes fierce protection, the cutting away of all deception, and the strength of righteous action.',
  },
  Water: {
    name: 'Mazu', cn: '媽祖', title: 'Goddess of the Sea & Safe Passage',
    colour: '#3b82f6', emoji: '🌊',
    image: 'https://upload.wikimedia.org/wikipedia/commons/c/c2/Wood_Statue_of_Mazu_Late_19th_century_CE_Qing_Dynasty_%281644-1911_CE%29_China.jpg',
    desc: 'Mazu is the celestial mother who guides navigators through storms and blesses all who travel life\'s waters. As a Water Day Master her depth of intuition and flowing grace align perfectly with your nature. Call on her for wisdom, safe passage and emotional healing.',
    lore: 'Mazu was born in 960 CE in Fujian province as Lin Mo — a girl so spiritually gifted that she did not cry at birth, so they named her "Mo" meaning the Silent One. By age eight she could recite scriptures by heart; by thirteen she received a gleaming bronze talisman from a white-bearded elder who dissolved into morning mist. One stormy night she fell into a deep trance at her loom, her spirit racing across the churning sea to rescue her drowning father and brothers. Her mother, seized by panic, shook her awake before she could save one brother — and overcome with grief, the young Lin Mo vowed to spend all eternity protecting those who sail. Today over ten thousand Mazu temples stand across China, Taiwan and Southeast Asia. Before every voyage, fishermen burn paper offerings at the water\'s edge, trusting that she flies ahead of typhoons to light the path home.',
    mantra: 'Om Tare Tuttare Ture Svaha',
    mantraDesc: 'The mantra of Tara, protector from ocean dangers. Invokes safe passage through all turbulent waters — the outer seas and the storms within.',
  },
};

// ── Tracks ────────────────────────────────────────────────────────────────────
const TRACKS = [
  { id: 1, name: 'Tibetan Singing Bowl',  desc: '432 Hz — deep relaxation & release',       freq: 432, type: 'bowl'   },
  { id: 2, name: 'Healing Light',          desc: '528 Hz — DNA repair & inner harmony',      freq: 528, type: 'tone'   },
  { id: 3, name: 'Sacred Om',              desc: '136 Hz — Earth resonance & Om frequency',  freq: 136, type: 'tone'   },
  { id: 4, name: 'Gamma Clarity',          desc: '40 Hz  — focus, insight & gamma waves',    freq: 40,  type: 'pulse'  },
  { id: 5, name: 'Ocean Waves',            desc: 'Pink noise — calm, flow & presence',       freq: 0,   type: 'ocean'  },
  { id: 6, name: 'Deity Mantra Chant',     desc: 'Your deity\'s sacred mantra chanted aloud', freq: 0,  type: 'mantra' },
];

const TRACK_ICONS = ['🔔', '✨', '🕉️', '⚡', '🌊', '🙏'];
const DURATIONS   = [5, 10, 15, 20, 30];

// ── Audio engine ──────────────────────────────────────────────────────────────
const useAudio = () => {
  const ctxRef    = useRef<AudioContext | null>(null);
  const nodesRef  = useRef<AudioNode[]>([]);
  const chantRef  = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopMantra = useCallback(() => {
    if (chantRef.current) { clearInterval(chantRef.current); chantRef.current = null; }
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  }, []);

  const stop = useCallback(() => {
    stopMantra();
    nodesRef.current.forEach(n => { try { (n as OscillatorNode).stop?.(); } catch {} });
    nodesRef.current = [];
    if (ctxRef.current) { ctxRef.current.close(); ctxRef.current = null; }
  }, [stopMantra]);

  const playMantra = useCallback((mantraText: string) => {
    if (!('speechSynthesis' in window)) return;
    const speak = () => {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(mantraText);
      u.rate = 0.42; u.pitch = 0.12; u.volume = 0.9;
      window.speechSynthesis.speak(u);
    };
    speak();
    chantRef.current = setInterval(speak, 7000);
  }, []);

  const play = useCallback((track: typeof TRACKS[0], mantraText?: string) => {
    stop();
    if (track.type === 'mantra') { playMantra(mantraText ?? ''); return; }

    const ctx    = new AudioContext();
    ctxRef.current = ctx;
    const master = ctx.createGain();
    master.gain.setValueAtTime(0, ctx.currentTime);
    master.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 3);
    master.connect(ctx.destination);
    nodesRef.current.push(master);

    if (track.type === 'ocean') {
      const buf = ctx.createBuffer(2, ctx.sampleRate * 4, ctx.sampleRate);
      for (let c = 0; c < 2; c++) {
        const d = buf.getChannelData(c);
        for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * 0.6;
      }
      const src    = ctx.createBufferSource(); src.buffer = buf; src.loop = true;
      const filter = ctx.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 400;
      const lfo    = ctx.createOscillator(); lfo.frequency.value = 0.08;
      const lfoG   = ctx.createGain(); lfoG.gain.value = 150;
      lfo.connect(lfoG); lfoG.connect(filter.frequency);
      src.connect(filter); filter.connect(master); lfo.start(); src.start();
      nodesRef.current.push(src, lfo);
    } else if (track.type === 'bowl') {
      [1, 2, 3].forEach((harmonic, i) => {
        const ring = () => {
          const o = ctx.createOscillator(); const g = ctx.createGain();
          o.type = 'sine'; o.frequency.value = track.freq * harmonic;
          g.gain.setValueAtTime(0.15 / harmonic, ctx.currentTime);
          g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 8);
          o.connect(g); g.connect(master); o.start();
          nodesRef.current.push(o);
          setTimeout(() => { try { o.stop(); } catch {} }, 8500);
        };
        ring();
        const iv = setInterval(ring, 9000 + i * 1500);
        nodesRef.current.push({ disconnect: () => clearInterval(iv) } as unknown as AudioNode);
      });
    } else if (track.type === 'pulse') {
      const osc = ctx.createOscillator(); const g = ctx.createGain();
      osc.type = 'sine'; osc.frequency.value = 200;
      const lfo = ctx.createOscillator(); const lfoG = ctx.createGain();
      lfo.frequency.value = track.freq; lfoG.gain.value = 0.08;
      lfo.connect(lfoG); lfoG.connect(g.gain);
      g.gain.value = 0.1; osc.connect(g); g.connect(master); osc.start(); lfo.start();
      nodesRef.current.push(osc, lfo);
    } else {
      const osc = ctx.createOscillator(); const g = ctx.createGain();
      osc.type = 'sine'; osc.frequency.value = track.freq;
      g.gain.value = 0.15; osc.connect(g); g.connect(master); osc.start();
      nodesRef.current.push(osc);
    }
  }, [stop, playMantra]);

  useEffect(() => () => stop(), [stop]);
  return { play, stop };
};

// ── Component ─────────────────────────────────────────────────────────────────
const Meditation: React.FC = () => {
  const navigate  = useNavigate();
  const { chart } = useAppSelector((s) => s.bazi);
  const dmElem    = chart?.day_master?.element ?? 'Water';
  const deity     = DEITY[dmElem] ?? DEITY['Water'];

  const [track,    setTrack]    = useState(TRACKS[0]);
  const [duration, setDuration] = useState(10);
  const [phase,    setPhase]    = useState<'setup' | 'meditating' | 'done'>('setup');
  const [elapsed,  setElapsed]  = useState(0);
  const [showLore, setShowLore] = useState(false);
  const [imgError, setImgError] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { play, stop } = useAudio();

  const totalSecs   = duration * 60;
  const remaining   = totalSecs - elapsed;
  const mins        = Math.floor(remaining / 60).toString().padStart(2, '0');
  const secs        = (remaining % 60).toString().padStart(2, '0');
  const progress    = elapsed / totalSecs;
  const circumference = 2 * Math.PI * 54;

  const startMeditation = () => {
    setPhase('meditating');
    setElapsed(0);
    play(track, deity.mantra);
    timerRef.current = setInterval(() => {
      setElapsed(e => {
        if (e + 1 >= totalSecs) {
          clearInterval(timerRef.current!);
          stop();
          setPhase('done');
          return totalSecs;
        }
        return e + 1;
      });
    }, 1000);
  };

  const stopEarly = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    stop();
    setPhase('setup');
    setElapsed(0);
  };

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const col = deity.colour;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f6ff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', color: '#1f2937', position: 'relative', padding: '24px 16px 48px' }}>
      <button
        onClick={() => { stopEarly(); navigate('/dashboard'); }}
        style={{ position: 'fixed', top: 20, left: 20, background: '#fff', border: '1px solid #e8e3f8', color: '#6b7280', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 14, zIndex: 10 }}
      >
        ← Exit
      </button>

      {/* ── SETUP PHASE ─────────────────────────────────────────────────── */}
      {phase === 'setup' && (
        <div style={{ width: '100%', maxWidth: 580, marginTop: 20 }}>

          {/* Deity hero image */}
          <div style={{ borderRadius: 18, overflow: 'hidden', position: 'relative', marginBottom: 24, border: `1px solid ${col}44` }}>
            {!imgError ? (
              <img
                src={deity.image}
                alt={deity.name}
                onError={() => setImgError(true)}
                style={{ width: '100%', height: 280, objectFit: 'cover', display: 'block' }}
              />
            ) : (
              <div style={{ width: '100%', height: 280, background: `radial-gradient(circle at 40% 50%, ${col}44 0%, #f8f6ff 70%)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 96 }}>{deity.emoji}</span>
              </div>
            )}
            {/* gradient overlay — kept dark so white text remains readable over image */}
            <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 55%)` }} />
            <div style={{ position: 'absolute', bottom: 18, left: 22 }}>
              <div style={{ fontSize: 26, fontWeight: 900, color: '#fff', lineHeight: 1.1 }}>{deity.name}</div>
              <div style={{ fontSize: 20, color: col, fontWeight: 700, letterSpacing: 3, marginTop: 2 }}>{deity.cn}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 4 }}>{deity.title}</div>
            </div>
          </div>

          {/* Description */}
          <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.75, marginBottom: 14, padding: '0 4px' }}>
            {deity.desc}
          </div>

          {/* Folklore toggle */}
          <div style={{ backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, border: `1px solid ${col}33`, boxShadow: '0 2px 8px rgba(124,58,237,0.06)' }}>
            <button
              onClick={() => setShowLore(l => !l)}
              style={{ background: 'none', border: 'none', color: col, cursor: 'pointer', fontSize: 13, fontWeight: 600, padding: 0, display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <span>{showLore ? '▲' : '▼'}</span>
              <span>{showLore ? 'Hide' : 'Read'} Folklore & Origins</span>
            </button>
            {showLore && (
              <div style={{ fontSize: 13, color: '#4c1d95', lineHeight: 1.8, marginTop: 14, borderTop: '1px solid #e8e3f8', paddingTop: 14 }}>
                {deity.lore}
              </div>
            )}
          </div>

          {/* Mantra */}
          <div style={{ backgroundColor: '#fff', borderRadius: 12, padding: '14px 18px', marginBottom: 16, border: `1px solid ${col}33`, display: 'flex', flexDirection: 'column', gap: 6, boxShadow: '0 2px 8px rgba(124,58,237,0.06)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: col, textTransform: 'uppercase', letterSpacing: 0.8 }}>Sacred Mantra</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#2e1065', fontStyle: 'italic', letterSpacing: 1.5 }}>{deity.mantra}</div>
            <div style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.6 }}>{deity.mantraDesc}</div>
          </div>

          {/* Track selector */}
          <div style={{ backgroundColor: '#fff', borderRadius: 12, padding: 18, border: '1px solid #e8e3f8', marginBottom: 14, boxShadow: '0 2px 8px rgba(124,58,237,0.06)' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#4c1d95', marginBottom: 12 }}>🎵 Choose Meditation Sound</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {TRACKS.map((t, idx) => (
                <button key={t.id} onClick={() => setTrack(t)} style={{
                  padding: '10px 14px', borderRadius: 8,
                  border: `1px solid ${track.id === t.id ? '#7c3aed' : '#e8e3f8'}`,
                  backgroundColor: track.id === t.id ? '#ede9fe' : '#f5f3ff',
                  color: track.id === t.id ? '#2e1065' : '#6b7280',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left',
                }}>
                  <span style={{ fontSize: 16 }}>{TRACK_ICONS[idx]}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{t.name}</div>
                    <div style={{ fontSize: 11, opacity: 0.8 }}>{t.id === 6 ? `${deity.mantra} — spoken slowly on loop` : t.desc}</div>
                  </div>
                  {track.id === t.id && <span style={{ color: '#7c3aed' }}>●</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Duration selector */}
          <div style={{ backgroundColor: '#fff', borderRadius: 12, padding: 18, border: '1px solid #e8e3f8', marginBottom: 24, boxShadow: '0 2px 8px rgba(124,58,237,0.06)' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#4c1d95', marginBottom: 12 }}>⏱ Session Length</div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
              {DURATIONS.map(d => (
                <button key={d} onClick={() => setDuration(d)} style={{
                  padding: '10px 16px', borderRadius: 8,
                  border: `1px solid ${duration === d ? '#7c3aed' : '#e8e3f8'}`,
                  backgroundColor: duration === d ? '#7c3aed' : '#f5f3ff',
                  color: duration === d ? '#fff' : '#6b7280', cursor: 'pointer', fontSize: 13, fontWeight: duration === d ? 700 : 400,
                }}>{d} min</button>
              ))}
            </div>
          </div>

          <button onClick={startMeditation} style={{ width: '100%', padding: '15px 0', backgroundColor: col, color: '#fff', border: 'none', borderRadius: 12, cursor: 'pointer', fontSize: 17, fontWeight: 800, letterSpacing: 0.5 }}>
            Begin Meditation 🧘
          </button>
        </div>
      )}

      {/* ── MEDITATING PHASE ─────────────────────────────────────────────── */}
      {phase === 'meditating' && (
        <div style={{ textAlign: 'center', width: '100%', maxWidth: 420, marginTop: 32 }}>
          {/* Deity image (circular) */}
          <div style={{ width: 120, height: 120, borderRadius: '50%', overflow: 'hidden', margin: '0 auto 16px', border: `3px solid ${col}`, boxShadow: `0 0 32px ${col}66` }}>
            {!imgError ? (
              <img src={deity.image} alt={deity.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={() => setImgError(true)} />
            ) : (
              <div style={{ width: '100%', height: '100%', background: `radial-gradient(circle, ${col}44, #f8f6ff)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48 }}>
                {deity.emoji}
              </div>
            )}
          </div>

          <div style={{ fontSize: 15, fontWeight: 700, color: col, marginBottom: 2 }}>{deity.name}  {deity.cn}</div>
          <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 28, fontStyle: 'italic' }}>{track.name}</div>

          {/* Circular timer */}
          <div style={{ position: 'relative', width: 148, height: 148, margin: '0 auto 28px' }}>
            <svg width={148} height={148} style={{ transform: 'rotate(-90deg)' }}>
              <circle cx={74} cy={74} r={54} fill="none" stroke="#e8e3f8" strokeWidth={7} />
              <circle cx={74} cy={74} r={54} fill="none" stroke={col} strokeWidth={7}
                strokeDasharray={circumference}
                strokeDashoffset={circumference * progress}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 1s linear' }} />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontSize: 30, fontWeight: 900, color: '#1f2937', fontVariantNumeric: 'tabular-nums' }}>{mins}:{secs}</div>
              <div style={{ fontSize: 10, color: '#6b7280' }}>remaining</div>
            </div>
          </div>

          <div style={{ fontSize: 16, color: col, marginBottom: 6, fontStyle: 'italic', fontWeight: 600, letterSpacing: 1 }}>"{deity.mantra}"</div>
          <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>{deity.mantraDesc}</div>
          <div style={{ fontSize: 12, color: '#374151', marginBottom: 32 }}>Breathe deeply. You are held.</div>

          <button onClick={stopEarly} style={{ padding: '11px 32px', backgroundColor: '#fff', color: '#6b7280', border: '1px solid #e8e3f8', borderRadius: 8, cursor: 'pointer', fontSize: 14 }}>
            ⏹ Stop Session
          </button>
        </div>
      )}

      {/* ── DONE PHASE ───────────────────────────────────────────────────── */}
      {phase === 'done' && (
        <div style={{ textAlign: 'center', maxWidth: 400, marginTop: 48 }}>
          <div style={{ width: 100, height: 100, borderRadius: '50%', overflow: 'hidden', margin: '0 auto 20px', border: `3px solid ${col}`, boxShadow: `0 0 40px ${col}66` }}>
            {!imgError ? (
              <img src={deity.image} alt={deity.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={() => setImgError(true)} />
            ) : (
              <div style={{ width: '100%', height: '100%', background: `radial-gradient(circle, ${col}44, #f8f6ff)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>
                {deity.emoji}
              </div>
            )}
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: col, marginBottom: 8 }}>Session Complete</div>
          <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 12 }}>You meditated for {duration} minutes with {deity.name}</div>
          <div style={{ fontSize: 13, color: '#374151', marginBottom: 28, lineHeight: 1.7, fontStyle: 'italic', padding: '0 12px' }}>
            "{deity.mantra}"<br />
            May {deity.name}'s blessings flow through all you do today.
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button onClick={() => setPhase('setup')} style={{ padding: '11px 26px', backgroundColor: '#7c3aed', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700 }}>Meditate Again</button>
            <button onClick={() => navigate('/dashboard')} style={{ padding: '11px 26px', backgroundColor: '#fff', color: '#6b7280', border: '1px solid #e8e3f8', borderRadius: 8, cursor: 'pointer' }}>Dashboard</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Meditation;
