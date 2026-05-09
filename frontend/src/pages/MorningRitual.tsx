import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../store/store';
import { fetchToday } from '../store/slices/baziSlice';
import { timeboxAPI, prioritiesAPI } from '../services/api';
import Sidebar from '../components/Common/Sidebar';
import Header from '../components/Common/Header';

const ELEM_COLOR: Record<string, string> = {
  Wood: '#16a34a', Fire: '#dc2626', Earth: '#d97706', Metal: '#6b7280', Water: '#2563eb',
};
const ELEM_ICON: Record<string, string> = {
  Wood: '🌱', Fire: '🔥', Earth: '⛰️', Metal: '⚙️', Water: '💧',
};
const ELEM_TASK_TYPES: Record<string, string[]> = {
  Wood: ['Growth & Learning', 'Planning', 'Creative Writing', 'Research'],
  Fire: ['Presentations', 'Networking', 'Sales & Pitches', 'Team Meetings'],
  Earth: ['Admin & Organisation', 'Budgeting', 'Process Improvement', 'Documentation'],
  Metal: ['Analysis', 'Quality Review', 'Decision Making', 'Precision Work'],
  Water: ['Brainstorming', 'Creative Projects', 'Reflection & Journaling', 'Intuitive Work'],
};

const STEP_LABELS = ['Energy Check', 'Top 3 Priorities', 'Schedule Timeboxes', 'Ready'];

interface Priority { text: string }
interface Timebox { title: string; start: string; end: string; element_type: string }

const MorningRitual: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { today } = useAppSelector((s) => s.bazi);
  const { user } = useAppSelector((s) => s.auth);

  const [step, setStep] = useState(0);
  const [priorities, setPriorities] = useState<Priority[]>([{ text: '' }, { text: '' }, { text: '' }]);
  const [timeboxes, setTimeboxes] = useState<Timebox[]>([]);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => { dispatch(fetchToday()); }, [dispatch]);

  const forecast = today?.forecast;
  const dmElem = today?.day_master?.element ?? 'Water';
  const dmColor = ELEM_COLOR[dmElem] ?? '#7c3aed';
  const favElems: string[] = today?.favorable_elements ?? [];
  const topHours = forecast?.hours?.filter((h: any) => h.score >= 75).slice(0, 3) ?? [];

  const todayStr = new Date().toISOString().split('T')[0];
  const greeting = new Date().getHours() < 12 ? 'Good morning' : 'Good afternoon';

  const addTimebox = () => {
    const now = new Date();
    const hh = now.getHours().toString().padStart(2, '0');
    const mm = now.getMinutes().toString().padStart(2, '0');
    const start = `${hh}:${mm}`;
    const endDate = new Date(now.getTime() + 60 * 60 * 1000);
    const eh = endDate.getHours().toString().padStart(2, '0');
    const em = endDate.getMinutes().toString().padStart(2, '0');
    setTimeboxes([...timeboxes, { title: '', start, end: `${eh}:${em}`, element_type: dmElem }]);
  };

  const saveAll = async () => {
    setSaving(true);
    try {
      const validPriorities = priorities.filter(p => p.text.trim());
      if (validPriorities.length > 0) {
        await prioritiesAPI.set(todayStr, validPriorities.map(p => p.text));
      }
      for (const tb of timeboxes.filter(t => t.title.trim())) {
        const [startH, startM] = tb.start.split(':');
        const [endH, endM] = tb.end.split(':');
        const base = new Date(); base.setHours(0, 0, 0, 0);
        const startTime = new Date(base.getTime() + parseInt(startH) * 3600000 + parseInt(startM) * 60000);
        const endTime = new Date(base.getTime() + parseInt(endH) * 3600000 + parseInt(endM) * 60000);
        await timeboxAPI.create({
          title: tb.title,
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          element_type: tb.element_type,
          color: ELEM_COLOR[tb.element_type] ?? '#7c3aed',
        });
      }
      setDone(true);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  if (done) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8f6ff' }}>
        <Sidebar />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Header />
          <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
            <div style={{ fontSize: 72, marginBottom: 20 }}>🌅</div>
            <h2 style={{ color: '#2e1065', fontSize: 26, fontWeight: 800, margin: '0 0 12px', textAlign: 'center' }}>
              You're set for today, {user?.name}!
            </h2>
            <p style={{ color: '#6b7280', fontSize: 15, maxWidth: 420, textAlign: 'center', margin: '0 0 32px' }}>
              Your priorities and timeboxes are scheduled. Flow with the energy of the day.
            </p>
            <div style={{ display: 'flex', gap: 14 }}>
              <button onClick={() => navigate('/dashboard')} style={{ padding: '12px 28px', backgroundColor: '#7c3aed', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 15, fontWeight: 700 }}>
                Go to Dashboard
              </button>
              <button onClick={() => navigate('/calendar')} style={{ padding: '12px 28px', backgroundColor: '#ede9fe', color: '#6d28d9', border: '1px solid #c4b5fd', borderRadius: 10, cursor: 'pointer', fontSize: 15, fontWeight: 600 }}>
                View Calendar
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8f6ff' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header />
        <main style={{ flex: 1, padding: '32px 40px', overflowY: 'auto', maxWidth: 760, margin: '0 auto', width: '100%' }}>

          {/* Header */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 13, color: '#9ca3af', fontWeight: 600, marginBottom: 4 }}>
              {new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
            <h2 style={{ margin: 0, fontSize: 26, fontWeight: 900, color: '#2e1065' }}>
              {greeting}, {user?.name} ☀️
            </h2>
            <p style={{ color: '#6b7280', margin: '6px 0 0', fontSize: 14 }}>Your guided morning ritual — align your day with your energy.</p>
          </div>

          {/* Step indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 32 }}>
            {STEP_LABELS.map((label, i) => (
              <React.Fragment key={label}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    backgroundColor: i <= step ? '#7c3aed' : '#e8e3f8',
                    color: i <= step ? '#fff' : '#a78bfa',
                    fontWeight: 700, fontSize: 13,
                  }}>{i < step ? '✓' : i + 1}</div>
                  <div style={{ fontSize: 10, color: i === step ? '#7c3aed' : '#9ca3af', fontWeight: i === step ? 700 : 400, whiteSpace: 'nowrap' }}>{label}</div>
                </div>
                {i < STEP_LABELS.length - 1 && (
                  <div style={{ flex: 1, height: 2, backgroundColor: i < step ? '#7c3aed' : '#e8e3f8', margin: '0 4px', marginBottom: 22 }} />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Step 0: Energy Check */}
          {step === 0 && (
            <div>
              <div style={{ backgroundColor: '#fff', borderRadius: 16, padding: 24, border: '1px solid #e8e3f8', marginBottom: 20 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#2e1065', marginBottom: 16 }}>⚡ Today's Bazi Energy</div>
                <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 160, backgroundColor: `${dmColor}11`, borderRadius: 10, padding: '14px 18px', border: `1px solid ${dmColor}33` }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: dmColor, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 6 }}>Day Master</div>
                    <div style={{ fontSize: 22, fontWeight: 900, color: dmColor }}>{ELEM_ICON[dmElem]} {dmElem}</div>
                    <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>{today?.day_master?.en ?? ''}</div>
                  </div>
                  {forecast && (
                    <div style={{ flex: 1, minWidth: 160, backgroundColor: '#f5f3ff', borderRadius: 10, padding: '14px 18px', border: '1px solid #e8e3f8' }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 6 }}>Today's Rating</div>
                      <div style={{ fontSize: 22, fontWeight: 900, color: forecast.color ?? '#7c3aed' }}>{forecast.rating}</div>
                      <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>Score: {Math.round(forecast.score)}/100</div>
                    </div>
                  )}
                  {favElems.length > 0 && (
                    <div style={{ flex: 1, minWidth: 160, backgroundColor: '#f0fdf4', borderRadius: 10, padding: '14px 18px', border: '1px solid #bbf7d0' }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 6 }}>Favorable Elements</div>
                      <div style={{ fontSize: 18, display: 'flex', gap: 6 }}>{favElems.map((e: string) => <span key={e}>{ELEM_ICON[e]}</span>)}</div>
                      <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>{favElems.join(' · ')}</div>
                    </div>
                  )}
                </div>

                {topHours.length > 0 && (
                  <div style={{ marginTop: 18 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#2e1065', marginBottom: 10 }}>⏰ Peak Energy Windows Today</div>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                      {topHours.map((h: any) => (
                        <div key={h.branch_index} style={{ backgroundColor: '#f5f3ff', borderRadius: 8, padding: '8px 14px', border: '1px solid #e8e3f8', fontSize: 13 }}>
                          <div style={{ fontWeight: 700, color: '#2e1065' }}>{h.time_label}</div>
                          <div style={{ color: '#7c3aed', fontSize: 11 }}>Score: {Math.round(h.score)}/100</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {dmElem && ELEM_TASK_TYPES[dmElem] && (
                  <div style={{ marginTop: 18, backgroundColor: `${dmColor}08`, borderRadius: 10, padding: '12px 16px', border: `1px solid ${dmColor}22` }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: dmColor, marginBottom: 6 }}>
                      {ELEM_ICON[dmElem]} Best task types for {dmElem} energy today:
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {ELEM_TASK_TYPES[dmElem].map(t => (
                        <span key={t} style={{ fontSize: 12, backgroundColor: '#fff', borderRadius: 6, padding: '4px 10px', border: `1px solid ${dmColor}44`, color: '#374151' }}>{t}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <button onClick={() => setStep(1)} style={{ padding: '12px 32px', backgroundColor: '#7c3aed', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 15, fontWeight: 700 }}>
                Set Today's Priorities →
              </button>
            </div>
          )}

          {/* Step 1: Priorities */}
          {step === 1 && (
            <div>
              <div style={{ backgroundColor: '#fff', borderRadius: 16, padding: 24, border: '1px solid #e8e3f8', marginBottom: 20 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#2e1065', marginBottom: 6 }}>🎯 Top 3 Priorities for Today</div>
                <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 18px' }}>
                  What are the 3 most important things you want to accomplish today?
                  Choose work that aligns with {ELEM_ICON[dmElem]} {dmElem} energy.
                </p>
                {priorities.map((p, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: '#ede9fe', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>{i + 1}</div>
                    <input
                      style={{ flex: 1, padding: '10px 14px', border: '1px solid #e2d9f3', borderRadius: 8, fontSize: 14, color: '#1f2937', outline: 'none' }}
                      placeholder={`Priority ${i + 1}${i === 0 ? ' (most important)' : ''}`}
                      value={p.text}
                      onChange={(e) => { const np = [...priorities]; np[i] = { text: e.target.value }; setPriorities(np); }}
                    />
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={() => setStep(0)} style={{ padding: '12px 24px', backgroundColor: '#f5f3ff', color: '#6d28d9', border: '1px solid #c4b5fd', borderRadius: 10, cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>← Back</button>
                <button onClick={() => setStep(2)} style={{ padding: '12px 32px', backgroundColor: '#7c3aed', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 15, fontWeight: 700 }}>Schedule Timeboxes →</button>
              </div>
            </div>
          )}

          {/* Step 2: Timeboxes */}
          {step === 2 && (
            <div>
              <div style={{ backgroundColor: '#fff', borderRadius: 16, padding: 24, border: '1px solid #e8e3f8', marginBottom: 20 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#2e1065', marginBottom: 6 }}>⏱ Schedule Your Timeboxes</div>
                <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 18px' }}>
                  Block time for your priorities. Tag each with an element to track alignment.
                </p>

                {timeboxes.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '24px 0', color: '#9ca3af', fontSize: 14 }}>
                    No timeboxes yet. Add one to schedule your day.
                  </div>
                )}

                {timeboxes.map((tb, i) => (
                  <div key={i} style={{ backgroundColor: '#f5f3ff', borderRadius: 10, padding: 16, marginBottom: 12, border: '1px solid #e8e3f8' }}>
                    <input
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2d9f3', borderRadius: 7, fontSize: 14, marginBottom: 10, boxSizing: 'border-box', outline: 'none' }}
                      placeholder="Task title"
                      value={tb.title}
                      onChange={(e) => { const nt = [...timeboxes]; nt[i] = { ...nt[i], title: e.target.value }; setTimeboxes(nt); }}
                    />
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <label style={{ fontSize: 12, color: '#6b7280', fontWeight: 600 }}>Start</label>
                        <input type="time" value={tb.start} onChange={(e) => { const nt = [...timeboxes]; nt[i] = { ...nt[i], start: e.target.value }; setTimeboxes(nt); }}
                          style={{ padding: '6px 10px', border: '1px solid #e2d9f3', borderRadius: 7, fontSize: 13 }} />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <label style={{ fontSize: 12, color: '#6b7280', fontWeight: 600 }}>End</label>
                        <input type="time" value={tb.end} onChange={(e) => { const nt = [...timeboxes]; nt[i] = { ...nt[i], end: e.target.value }; setTimeboxes(nt); }}
                          style={{ padding: '6px 10px', border: '1px solid #e2d9f3', borderRadius: 7, fontSize: 13 }} />
                      </div>
                      <select
                        value={tb.element_type}
                        onChange={(e) => { const nt = [...timeboxes]; nt[i] = { ...nt[i], element_type: e.target.value }; setTimeboxes(nt); }}
                        style={{ padding: '6px 10px', border: '1px solid #e2d9f3', borderRadius: 7, fontSize: 13, color: ELEM_COLOR[tb.element_type] ?? '#1f2937' }}
                      >
                        {['Wood', 'Fire', 'Earth', 'Metal', 'Water'].map(el => (
                          <option key={el} value={el}>{ELEM_ICON[el]} {el}</option>
                        ))}
                      </select>
                      <button onClick={() => setTimeboxes(timeboxes.filter((_, j) => j !== i))}
                        style={{ padding: '6px 12px', backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: 7, cursor: 'pointer', fontSize: 12 }}>
                        Remove
                      </button>
                    </div>
                  </div>
                ))}

                <button onClick={addTimebox} style={{ width: '100%', padding: '10px 0', backgroundColor: '#f5f3ff', color: '#7c3aed', border: '1px dashed #c4b5fd', borderRadius: 10, cursor: 'pointer', fontSize: 14, fontWeight: 600, marginTop: 4 }}>
                  + Add Timebox
                </button>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={() => setStep(1)} style={{ padding: '12px 24px', backgroundColor: '#f5f3ff', color: '#6d28d9', border: '1px solid #c4b5fd', borderRadius: 10, cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>← Back</button>
                <button onClick={saveAll} disabled={saving} style={{ padding: '12px 32px', backgroundColor: '#7c3aed', color: '#fff', border: 'none', borderRadius: 10, cursor: saving ? 'not-allowed' : 'pointer', fontSize: 15, fontWeight: 700, opacity: saving ? 0.7 : 1 }}>
                  {saving ? 'Saving…' : 'Complete Ritual ✓'}
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default MorningRitual;
