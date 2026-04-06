import React, { useState } from 'react';
import { Calendar, momentLocalizer, View, SlotInfo } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import type { Timebox, TimeboxCategory } from '../../types';

const localizer = momentLocalizer(moment);

const CATEGORY_COLORS: Record<TimeboxCategory, string> = {
  Work: '#2563eb',
  Meetings: '#ef4444',
  Breaks: '#facc15',
  Learning: '#22c55e',
  Personal: '#a855f7',
};

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: Timebox;
}

interface TimeboxCalendarProps {
  timeboxes: Timebox[];
  onEventClick: (tb: Timebox) => void;
  onSlotClick: (slotInfo: SlotInfo) => void;
  onEventDrop?: (event: { event: CalendarEvent; start: Date; end: Date }) => void;
}

const TimeboxCalendar: React.FC<TimeboxCalendarProps> = ({
  timeboxes,
  onEventClick,
  onSlotClick,
}) => {
  const [currentView, setCurrentView] = useState<View>('week');
  const [currentDate, setCurrentDate] = useState(new Date());

  const events: CalendarEvent[] = timeboxes.map((tb) => ({
    id: tb.id,
    title: tb.title,
    start: new Date(tb.startTime),
    end: new Date(tb.endTime),
    resource: tb,
  }));

  const eventPropGetter = (event: CalendarEvent) => {
    const category = event.resource.category;
    const color = CATEGORY_COLORS[category] || '#6b7280';
    return {
      style: {
        backgroundColor: color,
        borderColor: color,
        color: category === 'Breaks' ? '#1f2937' : '#ffffff',
        borderRadius: '4px',
        border: 'none',
        opacity: event.resource.status === 'completed' ? 0.7 : 1,
      },
      className: `category-${category}`,
    };
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    onEventClick(event.resource);
  };

  const handleSelectSlot = (slotInfo: SlotInfo) => {
    onSlotClick(slotInfo);
  };

  return (
    <div className="h-full bg-white dark:bg-gray-800 rounded-xl overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentDate(new Date())}
            className="btn-secondary text-sm py-1.5 px-3"
          >
            Today
          </button>
          <button
            onClick={() => {
              const d = new Date(currentDate);
              if (currentView === 'month') d.setMonth(d.getMonth() - 1);
              else if (currentView === 'week') d.setDate(d.getDate() - 7);
              else d.setDate(d.getDate() - 1);
              setCurrentDate(d);
            }}
            className="btn-secondary text-sm py-1.5 px-3"
          >
            ‹
          </button>
          <button
            onClick={() => {
              const d = new Date(currentDate);
              if (currentView === 'month') d.setMonth(d.getMonth() + 1);
              else if (currentView === 'week') d.setDate(d.getDate() + 7);
              else d.setDate(d.getDate() + 1);
              setCurrentDate(d);
            }}
            className="btn-secondary text-sm py-1.5 px-3"
          >
            ›
          </button>
          <span className="font-semibold text-gray-900 dark:text-white ml-2">
            {moment(currentDate).format(currentView === 'month' ? 'MMMM YYYY' : 'MMM D, YYYY')}
          </span>
        </div>
        <div className="flex gap-1">
          {(['month', 'week', 'day', 'agenda'] as View[]).map((view) => (
            <button
              key={view}
              onClick={() => setCurrentView(view)}
              className={`py-1.5 px-3 rounded-lg text-sm font-medium capitalize transition-colors ${
                currentView === view
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {view}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar */}
      <div style={{ height: 'calc(100% - 56px)' }}>
        <Calendar
          localizer={localizer}
          events={events}
          view={currentView}
          onView={setCurrentView}
          date={currentDate}
          onNavigate={setCurrentDate}
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          selectable
          eventPropGetter={eventPropGetter}
          toolbar={false}
          style={{ height: '100%' }}
          popup
        />
      </div>
    </div>
  );
};

export default TimeboxCalendar;
