import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { TabParamList } from '../types';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchTimeboxes, completeTimebox } from '../store/timeboxesSlice';
import { TimeboxCard } from '../components/TimeboxCard';

type Props = BottomTabScreenProps<TabParamList, 'Calendar'>;

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function toISODate(d: Date): string {
  return d.toISOString().split('T')[0];
}

export const CalendarScreen: React.FC<Props> = () => {
  const dispatch = useAppDispatch();
  const { items, isLoading } = useAppSelector((s) => s.timeboxes);

  const today = new Date();
  const [selectedDate, setSelectedDate] = useState<string>(toISODate(today));
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const load = useCallback((date: string) => {
    dispatch(fetchTimeboxes(date));
  }, [dispatch]);

  useEffect(() => {
    load(selectedDate);
  }, [selectedDate, load]);

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const calendarCells: (number | null)[] = [
    ...Array<null>(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  };

  const selectDay = (day: number) => {
    const date = toISODate(new Date(viewYear, viewMonth, day));
    setSelectedDate(date);
  };

  const filteredTimeboxes = items.filter((t) => t.date === selectedDate);

  const handleComplete = (id: number) => dispatch(completeTimebox(id));

  const selectedLabel = new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={() => load(selectedDate)} />}
      >
        <Text style={styles.screenTitle}>Calendar</Text>

        {/* Month navigator */}
        <View style={styles.monthNav}>
          <TouchableOpacity style={styles.navBtn} onPress={prevMonth}>
            <Text style={styles.navBtnText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.monthLabel}>
            {MONTHS[viewMonth]} {viewYear}
          </Text>
          <TouchableOpacity style={styles.navBtn} onPress={nextMonth}>
            <Text style={styles.navBtnText}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Day headers */}
        <View style={styles.dayHeaders}>
          {DAYS.map((d) => (
            <Text key={d} style={styles.dayHeader}>{d}</Text>
          ))}
        </View>

        {/* Calendar grid */}
        <View style={styles.grid}>
          {calendarCells.map((day, idx) => {
            if (day === null) return <View key={`empty-${idx}`} style={styles.cell} />;
            const dateStr = toISODate(new Date(viewYear, viewMonth, day));
            const isSelected = dateStr === selectedDate;
            const isToday = dateStr === toISODate(today);
            const hasEvents = items.some((t) => t.date === dateStr);

            return (
              <TouchableOpacity
                key={dateStr}
                style={[
                  styles.cell,
                  isSelected && styles.cellSelected,
                  isToday && !isSelected && styles.cellToday,
                ]}
                onPress={() => selectDay(day)}
              >
                <Text
                  style={[
                    styles.cellText,
                    isSelected && styles.cellTextSelected,
                    isToday && !isSelected && styles.cellTextToday,
                  ]}
                >
                  {day}
                </Text>
                {hasEvents && (
                  <View style={[styles.dot, isSelected && styles.dotSelected]} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Selected date timeboxes */}
        <View style={styles.dateSection}>
          <Text style={styles.dateSectionTitle}>{selectedLabel}</Text>

          {isLoading ? (
            <ActivityIndicator color="#4F46E5" style={styles.loader} />
          ) : filteredTimeboxes.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📭</Text>
              <Text style={styles.emptyText}>No timeboxes for this day</Text>
            </View>
          ) : (
            filteredTimeboxes.map((t) => (
              <TimeboxCard key={t.id} timebox={t} onComplete={handleComplete} />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8FAFC' },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingBottom: 32 },
  screenTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    paddingTop: 16,
    marginBottom: 16,
  },
  monthNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  navBtn: { padding: 6 },
  navBtnText: { fontSize: 24, color: '#4F46E5', fontWeight: '700' },
  monthLabel: { fontSize: 16, fontWeight: '700', color: '#111827' },
  dayHeaders: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  dayHeader: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
    paddingVertical: 6,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  cell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  cellSelected: { backgroundColor: '#4F46E5' },
  cellToday: { backgroundColor: '#EEF2FF' },
  cellText: { fontSize: 14, color: '#374151', fontWeight: '500' },
  cellTextSelected: { color: '#FFFFFF', fontWeight: '700' },
  cellTextToday: { color: '#4F46E5', fontWeight: '700' },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#4F46E5',
    marginTop: 2,
  },
  dotSelected: { backgroundColor: '#C7D2FE' },
  dateSection: {},
  dateSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  loader: { marginTop: 24 },
  emptyState: { alignItems: 'center', paddingVertical: 32 },
  emptyIcon: { fontSize: 36, marginBottom: 8 },
  emptyText: { fontSize: 14, color: '#9CA3AF' },
});
