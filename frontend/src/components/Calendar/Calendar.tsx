import React, { useState } from 'react';
import { Timebox } from '../../store/slices/timeboxSlice';

interface CalendarProps {
  timeboxes: Timebox[];
  selectedDate: string;
  onDayClick: (date: string) => void;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const CalendarGrid: React.FC<CalendarProps> = ({ timeboxes, selectedDate, onDayClick }) => {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const toDateStr = (day: number) => `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const today = new Date().toISOString().split('T')[0];

  const boxCountByDay: Record<string, number> = {};
  timeboxes.forEach((tb) => {
    boxCountByDay[tb.date] = (boxCountByDay[tb.date] || 0) + 1;
  });

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

  return (
    <div style={{ backgroundColor: '#fff', borderRadius: '10px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <button onClick={prevMonth} style={{ background: 'none', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '5px 10px', cursor: 'pointer', fontSize: '16px' }}>‹</button>
        <span style={{ fontWeight: 700, fontSize: '16px', color: '#1f2937' }}>
          {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </span>
        <button onClick={nextMonth} style={{ background: 'none', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '5px 10px', cursor: 'pointer', fontSize: '16px' }}>›</button>
      </div>

      {/* Day labels */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: '8px' }}>
        {DAYS.map((d) => (
          <div key={d} style={{ textAlign: 'center', fontSize: '12px', color: '#9ca3af', fontWeight: 600, padding: '4px 0' }}>{d}</div>
        ))}
      </div>

      {/* Date cells */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
        {cells.map((day, idx) => {
          if (day === null) return <div key={`empty-${idx}`} />;
          const dateStr = toDateStr(day);
          const count = boxCountByDay[dateStr] || 0;
          const isSelected = dateStr === selectedDate;
          const isToday = dateStr === today;

          return (
            <div
              key={dateStr}
              onClick={() => onDayClick(dateStr)}
              style={{
                padding: '6px 4px', borderRadius: '8px', cursor: 'pointer', textAlign: 'center', minHeight: '52px',
                backgroundColor: isSelected ? '#4f46e5' : isToday ? '#ede9fe' : 'transparent',
                color: isSelected ? '#fff' : '#1f2937',
                border: isToday && !isSelected ? '1.5px solid #4f46e5' : '1.5px solid transparent',
                transition: 'background 0.15s',
              }}
            >
              <div style={{ fontSize: '14px', fontWeight: isToday || isSelected ? 700 : 400 }}>{day}</div>
              {count > 0 && (
                <div style={{ display: 'flex', gap: '2px', justifyContent: 'center', marginTop: '4px', flexWrap: 'wrap' }}>
                  {Array.from({ length: Math.min(count, 3) }).map((_, i) => (
                    <div key={i} style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: isSelected ? 'rgba(255,255,255,0.8)' : '#6366f1' }} />
                  ))}
                  {count > 3 && <span style={{ fontSize: '9px', color: isSelected ? 'rgba(255,255,255,0.8)' : '#9ca3af' }}>+{count - 3}</span>}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarGrid;
