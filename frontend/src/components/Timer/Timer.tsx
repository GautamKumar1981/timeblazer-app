import React, { useState, useEffect, useRef, useCallback } from 'react';

interface TimerProps {
  durationMinutes: number;
  running: boolean;
  onStart: () => void;
  onPause: () => void;
  onStop: () => void;
  onComplete: () => void;
}

const Timer: React.FC<TimerProps> = ({ durationMinutes, running, onStart, onPause, onStop, onComplete }) => {
  const totalSeconds = durationMinutes * 60;
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setSecondsLeft(totalSeconds);
  }, [totalSeconds]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            onComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, onComplete]);

  const handleReset = useCallback(() => {
    onStop();
    setSecondsLeft(totalSeconds);
  }, [onStop, totalSeconds]);

  const mins = Math.floor(secondsLeft / 60).toString().padStart(2, '0');
  const secs = (secondsLeft % 60).toString().padStart(2, '0');
  const progress = (secondsLeft / totalSeconds) * 100;

  // SVG ring
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress / 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Progress Ring */}
      <div style={{ position: 'relative', width: '220px', height: '220px', marginBottom: '28px' }}>
        <svg width="220" height="220" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="110" cy="110" r={radius} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="10" />
          <circle
            cx="110" cy="110" r={radius} fill="none"
            stroke={secondsLeft < 60 ? '#ef4444' : '#6366f1'}
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.9s ease' }}
          />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '48px', fontWeight: 700, fontVariantNumeric: 'tabular-nums', letterSpacing: '-2px' }}>
            {mins}:{secs}
          </span>
          <span style={{ fontSize: '13px', color: '#94a3b8', marginTop: '2px' }}>{durationMinutes} min session</span>
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '14px' }}>
        <button
          onClick={running ? onPause : onStart}
          style={{ padding: '12px 32px', backgroundColor: '#6366f1', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '16px' }}
        >
          {running ? '⏸ Pause' : secondsLeft === totalSeconds ? '▶ Start' : '▶ Resume'}
        </button>
        <button
          onClick={handleReset}
          style={{ padding: '12px 20px', backgroundColor: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '15px' }}
        >
          ↺ Reset
        </button>
      </div>

      <button
        onClick={onComplete}
        style={{ marginTop: '16px', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '13px', textDecoration: 'underline' }}
      >
        Mark as done early
      </button>
    </div>
  );
};

export default Timer;
