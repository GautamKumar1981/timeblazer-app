import React, { useState } from 'react';
import {
  startOfMonth, endOfMonth, eachDayOfInterval, format,
  isSameMonth, isSameDay, addMonths, subMonths, getDay
} from 'date-fns';
import { Timebox } from '../../store/slices/timeboxSlice';
import styles from './Calendar.module.css';

interface CalendarProps {
  timeboxes: Timebox[];
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  onTimeboxClick: (timebox: Timebox) => void;
  onSlotClick: (date: Date) => void;
}

function Calendar({ timeboxes, selectedDate, onDateSelect, onTimeboxClick, onSlotClick }: CalendarProps) {
  const [viewMonth, setViewMonth] = useState(new Date());

  const days = eachDayOfInterval({
    start: startOfMonth(viewMonth),
    end: endOfMonth(viewMonth),
  });

  const firstDayOfWeek = getDay(startOfMonth(viewMonth));
  const paddingDays = Array.from({ length: firstDayOfWeek });

  const getTimeboxesForDay = (day: Date) =>
    timeboxes.filter((tb) => isSameDay(new Date(tb.start_time), day));

  return (
    <div className={styles.calendar}>
      <div className={styles.header}>
        <button className={styles.navBtn} onClick={() => setViewMonth(subMonths(viewMonth, 1))}>‹</button>
        <h2 className={styles.monthTitle}>{format(viewMonth, 'MMMM yyyy')}</h2>
        <button className={styles.navBtn} onClick={() => setViewMonth(addMonths(viewMonth, 1))}>›</button>
      </div>
      <div className={styles.weekdays}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <div key={d} className={styles.weekday}>{d}</div>
        ))}
      </div>
      <div className={styles.grid}>
        {paddingDays.map((_, i) => (
          <div key={`pad-${i}`} className={styles.emptyCell} />
        ))}
        {days.map((day) => {
          const dayTimeboxes = getTimeboxesForDay(day);
          const isSelected = isSameDay(day, selectedDate);
          const isToday = isSameDay(day, new Date());
          return (
            <div
              key={day.toISOString()}
              className={`${styles.cell} ${isSelected ? styles.selected : ''} ${isToday ? styles.today : ''} ${!isSameMonth(day, viewMonth) ? styles.otherMonth : ''}`}
              onClick={() => { onDateSelect(day); onSlotClick(day); }}
            >
              <span className={styles.dayNumber}>{format(day, 'd')}</span>
              <div className={styles.timeboxList}>
                {dayTimeboxes.slice(0, 3).map((tb) => (
                  <div
                    key={tb.id}
                    className={styles.timeboxChip}
                    style={{ backgroundColor: tb.color || 'var(--primary)' }}
                    onClick={(e) => { e.stopPropagation(); onTimeboxClick(tb); }}
                    title={tb.title}
                  >
                    {tb.title}
                  </div>
                ))}
                {dayTimeboxes.length > 3 && (
                  <div className={styles.more}>+{dayTimeboxes.length - 3} more</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Calendar;
