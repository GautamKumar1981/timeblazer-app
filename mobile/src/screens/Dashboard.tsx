import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { format, getDayOfYear, isThisYear } from 'date-fns';
import type { RootState, AppDispatch } from '../store/store';
import { fetchTimeboxes } from '../store/slices/timeboxSlice';
import { fetchPriorities, togglePriority, optimisticTogglePriority } from '../store/slices/goalsSlice';
import TimeboxCard from '../components/TimeboxCard';
import PriorityItem from '../components/PriorityItem';
import { colors } from '../theme/colors';
import type { Timebox } from '../types';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

function getYearProgress(): number {
  const now = new Date();
  const totalDays = isThisYear(new Date(now.getFullYear(), 11, 31)) ? 365 : 366;
  return Math.round((getDayOfYear(now) / totalDays) * 100);
}

export default function Dashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((s: RootState) => s.auth.user);
  const { items: timeboxes, isLoading, activeTimebox } = useSelector(
    (s: RootState) => s.timeboxes
  );
  const { priorities } = useSelector((s: RootState) => s.goals);

  const today = format(new Date(), 'yyyy-MM-dd');
  const yearProgress = getYearProgress();

  const loadData = useCallback(async () => {
    await Promise.all([
      dispatch(fetchTimeboxes(today)),
      dispatch(fetchPriorities(today)),
    ]);
  }, [dispatch, today]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleTogglePriority = useCallback(
    (id: string) => {
      dispatch(optimisticTogglePriority(id));
      dispatch(togglePriority(id));
    },
    [dispatch]
  );

  const upcomingTimeboxes = timeboxes
    .filter((tb) => tb.status === 'pending' || tb.status === 'active')
    .slice(0, 5);

  const firstName = user?.name?.split(' ')[0] ?? 'there';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={loadData} tintColor={colors.primary} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{getGreeting()}, {firstName}!</Text>
          <Text style={styles.date}>{format(new Date(), 'EEEE, MMMM d')}</Text>
        </View>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{firstName[0]?.toUpperCase()}</Text>
        </View>
      </View>

      {/* Year Progress */}
      <View style={styles.card}>
        <View style={styles.yearProgressHeader}>
          <Text style={styles.sectionLabel}>Year Progress</Text>
          <Text style={styles.yearProgressValue}>{yearProgress}%</Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${yearProgress}%` }]} />
        </View>
        <Text style={styles.yearProgressSub}>
          Day {getDayOfYear(new Date())} of {isThisYear(new Date(new Date().getFullYear(), 11, 31)) ? 365 : 366}
        </Text>
      </View>

      {/* Today's Priorities */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Today's Top 3 Priorities</Text>
        {priorities.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No priorities set for today.</Text>
            <Text style={styles.emptySubText}>Set your top 3 priorities to stay focused.</Text>
          </View>
        ) : (
          priorities.slice(0, 3).map((p, i) => (
            <PriorityItem key={p.id} priority={p} onToggle={handleTogglePriority} index={i} />
          ))
        )}
      </View>

      {/* Active Timebox */}
      {activeTimebox && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔥 Now</Text>
          <TimeboxCard timebox={activeTimebox} />
        </View>
      )}

      {/* Today's Schedule */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Today's Schedule</Text>
        {upcomingTimeboxes.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No timeboxes scheduled.</Text>
            <Text style={styles.emptySubText}>Add timeboxes in the Calendar tab.</Text>
          </View>
        ) : (
          upcomingTimeboxes.map((tb: Timebox) => <TimeboxCard key={tb.id} timebox={tb} />)
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    lineHeight: 30,
  },
  date: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  card: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },
  yearProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  yearProgressValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  progressTrack: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  yearProgressSub: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 6,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  emptySubText: {
    fontSize: 13,
    color: colors.textLight,
    marginTop: 4,
    textAlign: 'center',
  },
});
