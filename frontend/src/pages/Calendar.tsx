import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/store';
import { fetchTimeboxes, createTimebox, updateTimebox } from '../store/slices/timeboxSlice';
import Header from '../components/Common/Header';
import Sidebar from '../components/Common/Sidebar';
import CalendarGrid from '../components/Calendar/Calendar';
import { Timebox } from '../store/slices/timeboxSlice';

const Calendar: React.FC = () => {
  const dispatch = useAppDispatch();
  const { timeboxes } = useAppSelector((state) => state.timebox);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<Timebox | null>(null);
  const [form, setForm] = useState({ title: '', startTime: '09:00', endTime: '10:00', category: 'work', description: '' });

  useEffect(() => {
    dispatch(fetchTimeboxes(undefined));
  }, [dispatch]);

  const selectedBoxes = timeboxes.filter((tb) => tb.date === selectedDate);

  const handleDayClick = (date: string) => {
    setSelectedDate(date);
    setShowForm(false);
    setEditTarget(null);
  };

  const handleEdit = (tb: Timebox) => {
    setEditTarget(tb);
    setForm({ title: tb.title, startTime: tb.startTime, endTime: tb.endTime, category: tb.category, description: tb.description || '' });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editTarget) {
      await dispatch(updateTimebox({ id: editTarget._id, data: { ...form, date: selectedDate } }));
    } else {
      await dispatch(createTimebox({ ...form, date: selectedDate }));
    }
    setShowForm(false);
    setEditTarget(null);
    setForm({ title: '', startTime: '09:00', endTime: '10:00', category: 'work', description: '' });
  };

  const inputStyle: React.CSSProperties = { width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box', marginBottom: '10px' };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header />
        <main style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
          <h2 style={{ margin: '0 0 20px', fontSize: '22px', fontWeight: 700, color: '#1f2937' }}>📅 Calendar</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px' }}>
            <CalendarGrid timeboxes={timeboxes} selectedDate={selectedDate} onDayClick={handleDayClick} />

            <div>
              <div style={{ backgroundColor: '#fff', borderRadius: '10px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600 }}>
                    {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </h3>
                  <button
                    onClick={() => { setShowForm(!showForm); setEditTarget(null); setForm({ title: '', startTime: '09:00', endTime: '10:00', category: 'work', description: '' }); }}
                    style={{ backgroundColor: '#4f46e5', color: '#fff', border: 'none', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer', fontSize: '13px' }}
                  >
                    + Add
                  </button>
                </div>

                {showForm && (
                  <form onSubmit={handleSubmit} style={{ marginBottom: '16px', borderBottom: '1px solid #f3f4f6', paddingBottom: '16px' }}>
                    <input style={inputStyle} placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input style={{ ...inputStyle, flex: 1 }} type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} />
                      <input style={{ ...inputStyle, flex: 1 }} type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} />
                    </div>
                    <select style={inputStyle} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                      {['work', 'personal', 'health', 'learning', 'other'].map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: '60px' } as React.CSSProperties} placeholder="Description (optional)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button type="submit" style={{ flex: 1, padding: '8px', backgroundColor: '#4f46e5', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>
                        {editTarget ? 'Update' : 'Create'}
                      </button>
                      <button type="button" onClick={() => { setShowForm(false); setEditTarget(null); }} style={{ flex: 1, padding: '8px', backgroundColor: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                {selectedBoxes.length === 0 ? (
                  <p style={{ color: '#9ca3af', fontSize: '13px' }}>No timeboxes for this day.</p>
                ) : (
                  selectedBoxes.map((tb) => (
                    <div key={tb._id} style={{ padding: '10px', borderLeft: '3px solid #4f46e5', marginBottom: '10px', backgroundColor: '#f9fafb', borderRadius: '0 6px 6px 0' }}>
                      <div style={{ fontWeight: 600, fontSize: '14px', color: '#1f2937' }}>{tb.title}</div>
                      <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>{tb.startTime} – {tb.endTime}</div>
                      <button onClick={() => handleEdit(tb)} style={{ marginTop: '6px', fontSize: '12px', background: 'none', border: 'none', color: '#4f46e5', cursor: 'pointer', padding: 0 }}>Edit</button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Calendar;
