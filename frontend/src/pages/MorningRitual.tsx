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

const ELEM_PRIORITY_EXAMPLES: Record<string, { category: string; items: string[] }[]> = {
  Wood: [
    { category: 'Growth & Learning', items: ['Read 30 pages of the strategy book', 'Complete one online course module', 'Research three competitors and summarise findings', 'Identify one new skill to develop this quarter'] },
    { category: 'Planning & Vision', items: ['Draft the 90-day roadmap for the project', 'Write the first outline of the proposal', 'Define the team goals for this month', 'Map out milestones for the upcoming launch'] },
    { category: 'Creative Building', items: ['Start the new feature branch and first commit', 'Write the introduction section of the report', 'Sketch the initial wireframes for the new flow', 'Begin the first prototype of the idea'] },
  ],
  Fire: [
    { category: 'Presentations & Pitches', items: ['Deliver the client presentation', 'Prepare and rehearse the investor pitch', 'Record the product demo video', 'Present the Q2 results to the team'] },
    { category: 'Networking & Communication', items: ['Follow up with 5 key contacts from last week', 'Send the project update email to stakeholders', 'Schedule and lead the team stand-up', 'Reach out to a mentor or collaborator'] },
    { category: 'Visibility & Leadership', items: ['Publish the blog post or LinkedIn update', 'Lead the all-hands meeting', 'Give feedback to two team members', 'Finalise the marketing campaign brief'] },
  ],
  Earth: [
    { category: 'Organisation & Admin', items: ['Clean up and organise the project folders', 'Review and respond to all pending emails', 'Update the task board and close completed items', 'Set up the recurring weekly meeting schedule'] },
    { category: 'Finance & Budgeting', items: ['Update the weekly budget tracker', 'Reconcile last month\'s expenses', 'Review the vendor invoices', 'Prepare the monthly financial summary'] },
    { category: 'Process & Documentation', items: ['Document the new onboarding workflow', 'Write the standard operating procedure for the process', 'Create the FAQ for the support team', 'Archive and label the completed project files'] },
  ],
  Metal: [
    { category: 'Analysis & Review', items: ['Analyse last week\'s sales data and note trends', 'Review the Q2 performance report', 'Audit the codebase for security gaps', 'Evaluate the top three vendor proposals'] },
    { category: 'Quality & Precision', items: ['QA test the new feature before release', 'Proofread and finalise the client contract', 'Review the design specs against requirements', 'Check and fix all critical bugs in the backlog'] },
    { category: 'Decision Making', items: ['Make the final call on the vendor selection', 'Decide and document the technical architecture', 'Prioritise the next sprint backlog', 'Resolve the pending team conflict or decision'] },
  ],
  Water: [
    { category: 'Brainstorming & Ideas', items: ['Brainstorm 10 solutions to the UX problem', 'Create a mind map for the product vision', 'Explore three alternative approaches to the challenge', 'Write a "what if" scenario for the business strategy'] },
    { category: 'Creative Projects', items: ['Sketch the new design concepts', 'Draft the creative brief for the campaign', 'Write the first chapter or section of the content', 'Develop the storyboard for the video'] },
    { category: 'Reflection & Intuition', items: ['Journal for 20 minutes on what\'s working and what isn\'t', 'Review feedback received and find the patterns', 'Meditate on the core problem before acting', 'Write down the insights from the last project'] },
  ],
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
  const [suggestionIdx, setSuggestionIdx] = useState<number | null>(null);

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
        try { await prioritiesAPI.set(todayStr, validPriorities.map(p => p.text)); }
        catch (e) { console.error('Priority save failed:', e); }
      }
      for (const tb of timeboxes.filter(t => t.title.trim())) {
        const [startH, startM] = tb.start.split(':');
        const [endH, endM] = tb.end.split(':');
        const base = new Date(); base.setHours(0, 0, 0, 0);
        const startTime = new Date(base.getTime() + parseInt(startH) * 3600000 + parseInt(startM) * 60000);
        const endTime = new Date(base.getTime() + parseInt(endH) * 3600000 + parseInt(endM) * 60000);
        try {
          await timeboxAPI.create({
            title: tb.title,
            start_time: startTime.toISOString(),
            end_time: endTime.toISOString(),
            element_type: tb.element_type,
            color: ELEM_COLOR[tb.element_type] ?? '#7c3aed',
          });
        } catch (e) { console.error('Timebox save failed:', e); }
      }
    } finally {
      setSaving(false);
      setDone(true);
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
              {/* Suggestion popup */}
              {suggestionIdx !== null && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
                  onClick={() => setSuggestionIdx(null)}>
                  <div style={{ backgroundColor: '#fff', borderRadius: 18, padding: 28, maxWidth: 520, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.25)', maxHeight: '80vh', overflowY: 'auto' }}
                    onClick={(e) => e.stopPropagation()}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                      <div>
                        <div style={{ fontSize: 16, fontWeight: 800, color: '#2e1065' }}>
                          {ELEM_ICON[dmElem]} Ideas for Priority {suggestionIdx + 1}
                        </div>
                        <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 3 }}>
                          Aligned with {dmElem} energy — tap any to use it
                        </div>
                      </div>
                      <button onClick={() => setSuggestionIdx(null)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#9ca3af', lineHeight: 1 }}>✕</button>
                    </div>
                    {(ELEM_PRIORITY_EXAMPLES[dmElem] ?? ELEM_PRIORITY_EXAMPLES['Water']).map((group) => (
                      <div key={group.category} style={{ marginBottom: 18 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: dmColor, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 8 }}>{group.category}</div>
                        {group.items.map((item) => (
                          <button key={item} onClick={() => {
                            const np = [...priorities];
                            np[suggestionIdx!] = { text: item };
                            setPriorities(np);
                            setSuggestionIdx(null);
                          }} style={{
                            display: 'block', width: '100%', textAlign: 'left', padding: '9px 14px', marginBottom: 6,
                            backgroundColor: '#f5f3ff', border: `1px solid ${dmColor}33`, borderRadius: 8,
                            cursor: 'pointer', fontSize: 13, color: '#1f2937', lineHeight: 1.45,
                          }}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = `${dmColor}18`; (e.currentTarget as HTMLButtonElement).style.borderColor = dmColor; }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#f5f3ff'; (e.currentTarget as HTMLButtonElement).style.borderColor = `${dmColor}33`; }}
                          >{item}</button>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}

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
                    <button onClick={() => setSuggestionIdx(i)} style={{
                      padding: '8px 12px', backgroundColor: `${dmColor}12`, color: dmColor,
                      border: `1px solid ${dmColor}44`, borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600, flexShrink: 0, whiteSpace: 'nowrap',
                    }}>💡 Ideas</button>
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
              {/* Guideline card */}
              <div style={{ backgroundColor: '#ede9fe', borderRadius: 12, padding: '14px 18px', marginBottom: 18, border: '1px solid #c4b5fd' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#4c1d95', marginBottom: 8 }}>How to use Timeboxes</div>
                <div style={{ fontSize: 13, color: '#5b21b6', lineHeight: 1.65 }}>
                  <strong>Timeboxing</strong> means committing a fixed block of time to a specific task — no multitasking, no open-ended scrolling.
                  Each box you create locks you into deep focus for that window.
                </div>
                <ul style={{ margin: '10px 0 0', paddingLeft: 18, fontSize: 13, color: '#5b21b6', lineHeight: 1.8 }}>
                  <li>Match each task to one of your top 3 priorities from the previous step.</li>
                  <li>Tag with an <strong>element</strong> that reflects the task type — e.g. Fire for presentations, Water for creative work.</li>
                  <li>Keep each block between 25 and 90 minutes. Protect the time like a meeting.</li>
                  <li>Timeboxes without a title are skipped — you can also skip this step and complete the ritual.</li>
                </ul>
              </div>

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
