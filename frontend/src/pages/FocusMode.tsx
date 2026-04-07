import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/store';
import { fetchTimeboxes, updateTimebox } from '../store/slices/timeboxSlice';
import Timer from '../components/Timer/Timer';

const FocusMode: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { timeboxes } = useAppSelector((state) => state.timebox);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    dispatch(fetchTimeboxes(undefined));
  }, [dispatch]);

  const today = new Date().toISOString().split('T')[0];
  const todayBoxes = timeboxes.filter((tb) => !tb.completed && tb.date === today);
  const current = todayBoxes[selectedIdx] || null;

  const getDurationMinutes = (): number => {
    if (!current) return 25;
    const [sh, sm] = current.startTime.split(':').map(Number);
    const [eh, em] = current.endTime.split(':').map(Number);
    return Math.max(1, (eh * 60 + em) - (sh * 60 + sm));
  };

  const handleComplete = async () => {
    if (current) {
      await dispatch(updateTimebox({ id: current._id, data: { completed: true } }));
      setCompleted(true);
      setRunning(false);
    }
  };

  const categoryColors: Record<string, string> = {
    work: '#4f46e5', personal: '#059669', health: '#dc2626', learning: '#d97706', other: '#7c3aed',
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f172a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff', position: 'relative' }}>
      {/* Exit button */}
      <button
        onClick={() => navigate('/dashboard')}
        style={{ position: 'absolute', top: '20px', left: '20px', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}
      >
        ← Exit Focus
      </button>

      {todayBoxes.length === 0 ? (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>🎉</div>
          <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>All done for today!</h2>
          <p style={{ color: '#94a3b8', marginBottom: '24px' }}>No remaining timeboxes.</p>
          <button onClick={() => navigate('/dashboard')} style={{ padding: '12px 28px', backgroundColor: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '15px' }}>
            Back to Dashboard
          </button>
        </div>
      ) : (
        <div style={{ textAlign: 'center', width: '100%', maxWidth: '520px', padding: '0 20px' }}>
          {/* Timebox selector */}
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '32px', flexWrap: 'wrap' }}>
            {todayBoxes.map((tb, idx) => (
              <button
                key={tb._id}
                onClick={() => { setSelectedIdx(idx); setRunning(false); setCompleted(false); }}
                style={{
                  padding: '6px 14px', borderRadius: '20px', border: '2px solid',
                  borderColor: idx === selectedIdx ? '#6366f1' : 'rgba(255,255,255,0.15)',
                  backgroundColor: idx === selectedIdx ? '#6366f1' : 'transparent',
                  color: '#fff', cursor: 'pointer', fontSize: '13px',
                }}
              >
                {tb.title}
              </button>
            ))}
          </div>

          {current && (
            <>
              <div style={{ marginBottom: '8px' }}>
                <span style={{ backgroundColor: categoryColors[current.category] || '#6b7280', color: '#fff', padding: '3px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, textTransform: 'capitalize' }}>
                  {current.category}
                </span>
              </div>
              <h2 style={{ fontSize: '28px', fontWeight: 700, margin: '10px 0 4px' }}>{current.title}</h2>
              <p style={{ color: '#94a3b8', marginBottom: '32px', fontSize: '15px' }}>{current.startTime} – {current.endTime}</p>
            </>
          )}

          {completed ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '56px', marginBottom: '12px' }}>✅</div>
              <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>Timebox Completed!</h3>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button
                  onClick={() => { if (selectedIdx < todayBoxes.length - 1) { setSelectedIdx(selectedIdx + 1); setCompleted(false); } }}
                  disabled={selectedIdx >= todayBoxes.length - 1}
                  style={{ padding: '10px 24px', backgroundColor: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, opacity: selectedIdx >= todayBoxes.length - 1 ? 0.5 : 1 }}
                >
                  Next →
                </button>
                <button onClick={() => navigate('/dashboard')} style={{ padding: '10px 24px', backgroundColor: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                  Dashboard
                </button>
              </div>
            </div>
          ) : (
            <Timer
              durationMinutes={getDurationMinutes()}
              running={running}
              onStart={() => setRunning(true)}
              onPause={() => setRunning(false)}
              onStop={() => setRunning(false)}
              onComplete={handleComplete}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default FocusMode;
