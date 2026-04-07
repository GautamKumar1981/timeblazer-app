import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { format } from 'date-fns';
import { RootState } from '../store/store';
import { setTimeboxes, addTimebox, updateTimebox, removeTimebox, Timebox } from '../store/slices/timeboxSlice';
import { api } from '../services/api';
import Calendar from '../components/Calendar/Calendar';
import TimeboxCard from '../components/Timebox/TimeboxCard';
import styles from './CalendarPage.module.css';

const CATEGORIES = ['Work', 'Personal', 'Health', 'Learning', 'Social', 'Other'];
const COLORS = ['#4A90E2', '#7B68EE', '#27AE60', '#F39C12', '#E74C3C', '#1ABC9C'];

const emptyForm = {
  title: '',
  description: '',
  start_time: '',
  end_time: '',
  category: 'Work',
  color: '#4A90E2',
};

function CalendarPage() {
  const dispatch = useDispatch();
  const { timeboxes } = useSelector((state: RootState) => state.timebox);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [editingTimebox, setEditingTimebox] = useState<Timebox | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const res = await api.timeboxes.getTimeboxes();
        dispatch(setTimeboxes(res.data.timeboxes || res.data));
      } catch {}
    };
    fetchAll();
  }, [dispatch]);

  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
  const selectedTimeboxes = timeboxes.filter(
    (tb) => format(new Date(tb.start_time), 'yyyy-MM-dd') === selectedDateStr
  );

  const openCreate = (date: Date) => {
    const base = format(date, "yyyy-MM-dd'T'HH:mm");
    setForm({ ...emptyForm, start_time: base, end_time: base });
    setEditingTimebox(null);
    setError(null);
    setShowModal(true);
  };

  const openEdit = (tb: Timebox) => {
    setForm({
      title: tb.title,
      description: tb.description,
      start_time: tb.start_time.slice(0, 16),
      end_time: tb.end_time.slice(0, 16),
      category: tb.category,
      color: tb.color,
    });
    setEditingTimebox(tb);
    setError(null);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    try {
      if (editingTimebox) {
        const res = await api.timeboxes.updateTimebox(editingTimebox.id, form);
        dispatch(updateTimebox(res.data));
      } else {
        const res = await api.timeboxes.createTimebox(form);
        dispatch(addTimebox(res.data));
      }
      setShowModal(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save timebox.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.timeboxes.deleteTimebox(id);
      dispatch(removeTimebox(id));
    } catch {}
  };

  const handleStatusChange = async (id: string, status: Timebox['status']) => {
    try {
      const res = await api.timeboxes.updateStatus(id, status);
      dispatch(updateTimebox(res.data));
    } catch {}
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>📅 Calendar</h1>
        <button className="btn btn-primary" onClick={() => openCreate(selectedDate)}>
          + New Timebox
        </button>
      </div>

      <div className={styles.layout}>
        <div className={styles.calendarWrapper}>
          <Calendar
            timeboxes={timeboxes}
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
            onTimeboxClick={openEdit}
            onSlotClick={openCreate}
          />
        </div>
        <div className={styles.sidePanel}>
          <div className={styles.sidePanelHeader}>
            <h2>{format(selectedDate, 'EEEE, MMM d')}</h2>
            <span className={styles.count}>{selectedTimeboxes.length} timeboxes</span>
          </div>
          {selectedTimeboxes.length === 0 ? (
            <div className={styles.empty}>No timeboxes for this day</div>
          ) : (
            <div className={styles.list}>
              {selectedTimeboxes.map((tb) => (
                <TimeboxCard
                  key={tb.id}
                  timebox={tb}
                  onEdit={openEdit}
                  onDelete={handleDelete}
                  onStatusChange={handleStatusChange}
                  onStart={() => {}}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingTimebox ? 'Edit Timebox' : 'New Timebox'}</h2>
              <button onClick={() => setShowModal(false)}>✕</button>
            </div>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                  placeholder="Timebox title"
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2}
                  placeholder="Optional description"
                />
              </div>
              <div className={styles.timeRow}>
                <div className="form-group">
                  <label>Start Time</label>
                  <input
                    type="datetime-local"
                    value={form.start_time}
                    onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>End Time</label>
                  <input
                    type="datetime-local"
                    value={form.end_time}
                    onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className={styles.timeRow}>
                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                  >
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Color</label>
                  <div className={styles.colorPicker}>
                    {COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        className={`${styles.colorSwatch} ${form.color === c ? styles.colorSelected : ''}`}
                        style={{ backgroundColor: c }}
                        onClick={() => setForm({ ...form, color: c })}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className={styles.modalActions}>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CalendarPage;
