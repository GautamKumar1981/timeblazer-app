import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../store/store';

// ── Deity lookup by Day Master element ────────────────────────────────────────
const DEITY: Record<string, { name: string; cn: string; title: string; desc: string; colour: string; mantra: string; emoji: string }> = {
  Wood:  { name: 'Guan Yin',     cn: '觀音菩薩', title: 'Bodhisattva of Compassion',      colour: '#22c55e', emoji: '🪷',
           desc: 'Guan Yin hears the cries of the world and responds with infinite compassion. As a Wood Day Master you are guided by her energy of growth, empathy and healing. Call on her when you seek inner peace, forgiveness, or the wisdom to nurture without losing yourself.',
           mantra: 'Om Mani Padme Hum' },
  Fire:  { name: 'Tai Yang',     cn: '太陽星君', title: 'God of the Sun',                 colour: '#ef4444', emoji: '☀️',
           desc: 'Tai Yang is the radiant solar deity who illuminates all paths with clarity and warmth. As a Fire Day Master you carry his energy of leadership, visibility and passion. Meditate with his light to amplify confidence and burn away confusion.',
           mantra: 'Om Suryaya Namaha' },
  Earth: { name: 'Tu Di Gong',   cn: '土地公',   title: 'God of the Earth & Abundance',  colour: '#f59e0b', emoji: '🏯',
           desc: 'Tu Di Gong is the beloved protector of the land, communities, and wealth accumulated through honest effort. As an Earth Day Master you are rooted in his steady, nurturing frequency. Invoke him for stability, property blessings, and grounded abundance.',
           mantra: 'Om Prithiviye Namaha' },
  Metal: { name: 'Guan Yu',      cn: '關聖帝君', title: 'God of Justice & Brotherhood',  colour: '#94a3b8', emoji: '⚔️',
           desc: 'Guan Yu is the righteous warrior deity revered for loyalty, justice and the protection of business and honour. As a Metal Day Master his incorruptible clarity resonates with your soul. Meditate with him for protection, cutting through deception and attracting loyal allies.',
           mantra: 'Om Vajrapani Hum' },
  Water: { name: 'Mazu',         cn: '媽祖',     title: 'Goddess of the Sea & Safe Passage', colour: '#3b82f6', emoji: '🌊',
           desc: 'Mazu is the celestial mother who guides navigators through storms and blesses all who travel life\'s waters with wisdom and protection. As a Water Day Master her depth of intuition and flowing grace align perfectly with your nature. Call on her for inner wisdom, safe travels and emotional healing.',
           mantra: 'Om Tare Tuttare Ture Svaha' },
};

// ── Meditation tracks (Web Audio API generated) ───────────────────────────────
const TRACKS = [
  { id: 1, name: 'Tibetan Singing Bowl',  desc: '432 Hz — deep relaxation & release',     freq: 432,  type: 'bowl'    },
  { id: 2, name: 'Healing Light',          desc: '528 Hz — DNA repair & inner harmony',    freq: 528,  type: 'tone'    },
  { id: 3, name: 'Sacred Om',              desc: '136 Hz — Earth resonance & Om frequency', freq: 136, type: 'tone'    },
  { id: 4, name: 'Gamma Clarity',          desc: '40 Hz — focus, insight & gamma waves',   freq: 40,   type: 'pulse'   },
  { id: 5, name: 'Ocean Waves',            desc: 'Pink noise — calm, flow & presence',     freq: 0,    type: 'ocean'   },
];

const DURATIONS = [5, 10, 15, 20, 30];

// ── Audio engine ──────────────────────────────────────────────────────────────
const useAudio = () => {
  const ctxRef  = useRef<AudioContext | null>(null);
  const nodesRef = useRef<AudioNode[]>([]);

  const stop = useCallback(() => {
    nodesRef.current.forEach(n => { try { (n as OscillatorNode).stop?.(); } catch {} });
    nodesRef.current = [];
    if (ctxRef.current) { ctxRef.current.close(); ctxRef.current = null; }
  }, []);

  const play = useCallback((track: typeof TRACKS[0]) => {
    stop();
    const ctx = new AudioContext();
    ctxRef.current = ctx;
    const master = ctx.createGain();
    master.gain.setValueAtTime(0, ctx.currentTime);
    master.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 3);
    master.connect(ctx.destination);
    nodesRef.current.push(master);

    if (track.type === 'ocean') {
      const buf = ctx.createBuffer(2, ctx.sampleRate * 4, ctx.sampleRate);
      for (let c = 0; c < 2; c++) {
        const data = buf.getChannelData(c);
        for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.6;
      }
      const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true;
      const filter = ctx.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 400;
      const lfo = ctx.createOscillator(); lfo.frequency.value = 0.08;
      const lfoGain = ctx.createGain(); lfoGain.gain.value = 150;
      lfo.connect(lfoGain); lfoGain.connect(filter.frequency);
      src.connect(filter); filter.connect(master); lfo.start(); src.start();
      nodesRef.current.push(src, lfo);
    } else if (track.type === 'bowl') {
      [1, 2, 3].forEach((harmonic, i) => {
        const osc = ctx.createOscillator(); const g = ctx.createGain();
        osc.type = 'sine'; osc.frequency.value = track.freq * harmonic;
        g.gain.setValueAtTime(0.15 / harmonic, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 8);
        osc.connect(g); g.connect(master); osc.start();
        setTimeout(() => { try { osc.stop(); } catch {} }, 8500);
        nodesRef.current.push(osc);
        const interval = setInterval(() => {
          const o2 = ctx.createOscillator(); const g2 = ctx.createGain();
          o2.type = 'sine'; o2.frequency.value = track.freq * harmonic;
          g2.gain.setValueAtTime(0.15 / harmonic, ctx.currentTime);
          g2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 8);
          o2.connect(g2); g2.connect(master); o2.start();
          nodesRef.current.push(o2);
        }, 9000 + i * 1500);
        nodesRef.current.push({ disconnect: () => clearInterval(interval) } as unknown as AudioNode);
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
  }, [stop]);

  useEffect(() => () => stop(), [stop]);
  return { play, stop };
};

// ── Component ─────────────────────────────────────────────────────────────────
const Meditation: React.FC = () => {
  const navigate = useNavigate();
  const { chart } = useAppSelector((s) => s.bazi);
  const dmElem = chart?.day_master?.element ?? 'Water';
  const deity  = DEITY[dmElem] ?? DEITY['Water'];

  const [track,    setTrack]    = useState(TRACKS[0]);
  const [duration, setDuration] = useState(10);
  const [phase,    setPhase]    = useState<'setup' | 'meditating' | 'done'>('setup');
  const [elapsed,  setElapsed]  = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { play, stop } = useAudio();

  const totalSecs = duration * 60;
  const remaining = totalSecs - elapsed;
  const mins = Math.floor(remaining / 60).toString().padStart(2, '0');
  const secs = (remaining % 60).toString().padStart(2, '0');
  const progress = elapsed / totalSecs;

  const startMeditation = () => {
    setPhase('meditating');
    setElapsed(0);
    play(track);
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

  const circumference = 2 * Math.PI * 54;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0916', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff', position: 'relative', padding: 24 }}>
      {/* Back */}
      <button onClick={() => { stopEarly(); navigate('/dashboard'); }} style={{ position: 'absolute', top: 20, left: 20, background: 'rgba(255,255,255,0.07)', border: 'none', color: '#9ca3af', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 14 }}>
        ← Exit
      </button>

      {phase === 'setup' && (
        <div style={{ width: '100%', maxWidth: 560 }}>
          {/* Deity */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ fontSize: 56, marginBottom: 8 }}>{deity.emoji}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: deity.colour, marginBottom: 2 }}>{deity.name}</div>
            <div style={{ fontSize: 14, color: deity.cn, letterSpacing: 2, marginBottom: 6, fontWeight: 700 }}>{deity.cn}</div>
            <div style={{ fontSize: 13, color: '#9ca3af', marginBottom: 12 }}>{deity.title}</div>
            <div style={{ fontSize: 13, color: '#d1d5db', lineHeight: 1.7, marginBottom: 10, maxWidth: 480, margin: '0 auto 12px' }}>{deity.desc}</div>
            <div style={{ fontSize: 12, color: deity.colour + 'cc', fontStyle: 'italic' }}>Mantra: {deity.mantra}</div>
          </div>

          {/* Track selector */}
          <div style={{ backgroundColor: '#16152e', borderRadius: 12, padding: 20, border: '1px solid rgba(139,92,246,0.2)', marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#c4b5fd', marginBottom: 12 }}>🎵 Choose Meditation Sound</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {TRACKS.map(t => (
                <button key={t.id} onClick={() => setTrack(t)} style={{
                  padding: '10px 14px', borderRadius: 8, border: `1px solid ${track.id === t.id ? 'rgba(139,92,246,0.6)' : 'rgba(255,255,255,0.08)'}`,
                  backgroundColor: track.id === t.id ? 'rgba(139,92,246,0.2)' : '#1a1830',
                  color: track.id === t.id ? '#e9d5ff' : '#9ca3af', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left',
                }}>
                  <span style={{ fontSize: 16 }}>{['🔔','✨','🕉️','⚡','🌊'][t.id - 1]}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{t.name}</div>
                    <div style={{ fontSize: 11, opacity: 0.7 }}>{t.desc}</div>
                  </div>
                  {track.id === t.id && <span style={{ marginLeft: 'auto', color: '#8b5cf6' }}>●</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Duration selector */}
          <div style={{ backgroundColor: '#16152e', borderRadius: 12, padding: 20, border: '1px solid rgba(139,92,246,0.2)', marginBottom: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#c4b5fd', marginBottom: 12 }}>⏱ Session Length</div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
              {DURATIONS.map(d => (
                <button key={d} onClick={() => setDuration(d)} style={{
                  padding: '10px 16px', borderRadius: 8, border: `1px solid ${duration === d ? 'rgba(139,92,246,0.6)' : 'rgba(255,255,255,0.08)'}`,
                  backgroundColor: duration === d ? '#7c3aed' : '#1a1830',
                  color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: duration === d ? 700 : 400,
                }}>{d} min</button>
              ))}
            </div>
          </div>

          <button onClick={startMeditation} style={{ width: '100%', padding: '14px 0', backgroundColor: deity.colour, color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 16, fontWeight: 700, letterSpacing: 0.5 }}>
            Begin Meditation 🧘
          </button>
        </div>
      )}

      {phase === 'meditating' && (
        <div style={{ textAlign: 'center', width: '100%', maxWidth: 400 }}>
          <div style={{ fontSize: 36, marginBottom: 6 }}>{deity.emoji}</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: deity.colour, marginBottom: 2 }}>{deity.name}</div>
          <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 32, fontStyle: 'italic' }}>{track.name}</div>

          {/* Circle timer */}
          <div style={{ position: 'relative', width: 140, height: 140, margin: '0 auto 32px' }}>
            <svg width={140} height={140} style={{ transform: 'rotate(-90deg)' }}>
              <circle cx={70} cy={70} r={54} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={6} />
              <circle cx={70} cy={70} r={54} fill="none" stroke={deity.colour} strokeWidth={6}
                strokeDasharray={circumference} strokeDashoffset={circumference * progress}
                strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s linear' }} />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: '#e5e7eb', fontVariantNumeric: 'tabular-nums' }}>{mins}:{secs}</div>
              <div style={{ fontSize: 10, color: '#6b7280' }}>remaining</div>
            </div>
          </div>

          <div style={{ fontSize: 13, color: '#9ca3af', marginBottom: 8, fontStyle: 'italic' }}>"{deity.mantra}"</div>
          <div style={{ fontSize: 12, color: '#4b5563', marginBottom: 32 }}>Breathe deeply. You are held.</div>

          <button onClick={stopEarly} style={{ padding: '10px 28px', backgroundColor: 'rgba(255,255,255,0.08)', color: '#9ca3af', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, cursor: 'pointer', fontSize: 14 }}>
            ⏹ Stop Session
          </button>
        </div>
      )}

      {phase === 'done' && (
        <div style={{ textAlign: 'center', maxWidth: 360 }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>{deity.emoji}</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: deity.colour, marginBottom: 8 }}>Session Complete</div>
          <div style={{ fontSize: 14, color: '#9ca3af', marginBottom: 8 }}>You meditated for {duration} minutes</div>
          <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 28, lineHeight: 1.6, fontStyle: 'italic' }}>
            "{deity.mantra}"<br />May {deity.name}'s blessings flow through your day.
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button onClick={() => setPhase('setup')} style={{ padding: '10px 24px', backgroundColor: '#7c3aed', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>Meditate Again</button>
            <button onClick={() => navigate('/dashboard')} style={{ padding: '10px 24px', backgroundColor: 'rgba(255,255,255,0.08)', color: '#9ca3af', border: 'none', borderRadius: 8, cursor: 'pointer' }}>Dashboard</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Meditation;
