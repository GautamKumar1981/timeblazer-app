import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { TabParamList } from '../types';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchTodayTimeboxes } from '../store/timeboxesSlice';
import { startTimer, pauseTimer, resumeTimer, stopTimer, tick } from '../store/timerSlice';
import { MobileTimer } from '../components/MobileTimer';

type Props = BottomTabScreenProps<TabParamList, 'Timer'>;

export const TimerScreen: React.FC<Props> = () => {
  const dispatch = useAppDispatch();
  const timer = useAppSelector((s) => s.timer);
  const { todayItems } = useAppSelector((s) => s.timeboxes);

  // Ticker
  useEffect(() => {
    if (!timer.isRunning) return;
    const interval = setInterval(() => {
      dispatch(tick());
    }, 1000);
    return () => clearInterval(interval);
  }, [timer.isRunning, dispatch]);

  // Auto-stop when completed
  useEffect(() => {
    if (timer.isRunning && timer.elapsedSeconds >= timer.totalSeconds && timer.totalSeconds > 0) {
      dispatch(stopTimer());
      Alert.alert('⏰ Time Up!', 'Your timebox is complete. Great work!', [{ text: 'OK' }]);
    }
  }, [timer.elapsedSeconds, timer.totalSeconds, timer.isRunning, dispatch]);

  useEffect(() => {
    dispatch(fetchTodayTimeboxes());
  }, [dispatch]);

  const activeTimebox = todayItems.find((t) => t.id === timer.activeTimeboxId);

  const pendingTimeboxes = todayItems.filter((t) => !t.isCompleted);

  const handleSelectTimebox = (id: number, durationMinutes: number) => {
    if (timer.isRunning || timer.isPaused) {
      Alert.alert(
        'Timer Active',
        'Stop the current timer before starting a new one.',
        [{ text: 'OK' }]
      );
      return;
    }
    dispatch(startTimer({ timeboxId: id, durationMinutes }));
  };

  const handleStart = () => {
    if (pendingTimeboxes.length > 0 && timer.activeTimeboxId === null) {
      const first = pendingTimeboxes[0];
      dispatch(startTimer({ timeboxId: first.id, durationMinutes: first.duration }));
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.screenTitle}>Timer</Text>

        {/* Timer widget */}
        <View style={styles.timerCard}>
          <MobileTimer
            totalSeconds={timer.totalSeconds}
            elapsedSeconds={timer.elapsedSeconds}
            isRunning={timer.isRunning}
            isPaused={timer.isPaused}
            timeboxTitle={activeTimebox?.title}
            onStart={handleStart}
            onPause={() => dispatch(pauseTimer())}
            onResume={() => dispatch(resumeTimer())}
            onStop={() => dispatch(stopTimer())}
          />
        </View>

        {/* Active timebox details */}
        {activeTimebox && (
          <View style={styles.activeCard}>
            <Text style={styles.activeLabel}>Active Timebox</Text>
            <Text style={styles.activeTitle}>{activeTimebox.title}</Text>
            {activeTimebox.description ? (
              <Text style={styles.activeDesc}>{activeTimebox.description}</Text>
            ) : null}
            <View style={styles.activeRow}>
              <View style={styles.activeBadge}>
                <Text style={styles.activeBadgeText}>
                  {activeTimebox.startTime} – {activeTimebox.endTime}
                </Text>
              </View>
              <View style={[styles.activeBadge, styles.durationBadge]}>
                <Text style={styles.activeBadgeText}>{activeTimebox.duration} min</Text>
              </View>
            </View>
          </View>
        )}

        {/* Pending timeboxes to pick */}
        {!timer.isRunning && !timer.isPaused && pendingTimeboxes.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📋 Pick a Timebox to Start</Text>
            {pendingTimeboxes.map((t) => (
              <TouchableOpacity
                key={t.id}
                style={styles.pickCard}
                onPress={() => handleSelectTimebox(t.id, t.duration)}
                activeOpacity={0.8}
              >
                <View style={styles.pickLeft}>
                  <Text style={styles.pickTitle}>{t.title}</Text>
                  <Text style={styles.pickTime}>
                    {t.startTime} – {t.endTime} · {t.duration} min
                  </Text>
                </View>
                <View style={styles.playBtn}>
                  <Text style={styles.playIcon}>▶</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {todayItems.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyText}>No timeboxes scheduled for today</Text>
            <Text style={styles.emptyHint}>Add timeboxes in the Calendar tab</Text>
          </View>
        )}
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
  timerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  activeCard: {
    backgroundColor: '#EEF2FF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  activeLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6366F1',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  activeTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  activeDesc: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 10,
  },
  activeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  activeBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  durationBadge: {
    backgroundColor: '#C7D2FE',
  },
  activeBadgeText: {
    fontSize: 12,
    color: '#4F46E5',
    fontWeight: '600',
  },
  section: { marginBottom: 20 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  pickCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  pickLeft: { flex: 1 },
  pickTitle: { fontSize: 15, fontWeight: '600', color: '#111827', marginBottom: 3 },
  pickTime: { fontSize: 12, color: '#9CA3AF' },
  playBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: { color: '#FFFFFF', fontSize: 14 },
  emptyState: { alignItems: 'center', paddingVertical: 48 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 16, color: '#6B7280', fontWeight: '500', marginBottom: 4 },
  emptyHint: { fontSize: 14, color: '#9CA3AF' },
});
