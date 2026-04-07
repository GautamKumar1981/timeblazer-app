import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { TabParamList } from '../types';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchTodayTimeboxes, fetchPriorities, completeTimebox } from '../store/timeboxesSlice';
import { TimeboxCard } from '../components/TimeboxCard';

type Props = BottomTabScreenProps<TabParamList, 'Dashboard'>;

export const DashboardScreen: React.FC<Props> = () => {
  const dispatch = useAppDispatch();
  const { todayItems, priorities, isLoading } = useAppSelector((s) => s.timeboxes);
  const { user } = useAppSelector((s) => s.auth);

  const load = useCallback(() => {
    dispatch(fetchTodayTimeboxes());
    dispatch(fetchPriorities());
  }, [dispatch]);

  useEffect(() => {
    load();
  }, [load]);

  const completed = todayItems.filter((t) => t.isCompleted).length;
  const totalMinutes = todayItems.reduce((acc, t) => acc + t.duration, 0);

  const handleComplete = (id: number) => {
    dispatch(completeTimebox(id));
  };

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={load} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting()},</Text>
            <Text style={styles.userName}>{user?.fullName ?? user?.username ?? 'there'} 👋</Text>
          </View>
          <View style={styles.dateBadge}>
            <Text style={styles.dateText}>
              {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </Text>
          </View>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <StatCard label="Scheduled" value={String(todayItems.length)} icon="📅" color="#4F46E5" />
          <StatCard label="Completed" value={String(completed)} icon="✅" color="#10B981" />
          <StatCard label="Minutes" value={String(totalMinutes)} icon="⏱" color="#F59E0B" />
        </View>

        {/* Progress bar */}
        {todayItems.length > 0 && (
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.sectionLabel}>Today's Progress</Text>
              <Text style={styles.progressPct}>
                {Math.round((completed / todayItems.length) * 100)}%
              </Text>
            </View>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${(completed / todayItems.length) * 100}%` as unknown as number },
                ]}
              />
            </View>
          </View>
        )}

        {/* Top priorities */}
        {priorities.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎯 Top Priorities</Text>
            {priorities.slice(0, 3).map((t) => (
              <TimeboxCard
                key={t.id}
                timebox={t}
                onComplete={handleComplete}
              />
            ))}
          </View>
        )}

        {/* Today's schedule */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Today's Schedule</Text>
          {isLoading && todayItems.length === 0 ? (
            <ActivityIndicator color="#4F46E5" style={styles.loader} />
          ) : todayItems.length === 0 ? (
            <EmptyState message="No timeboxes scheduled for today" />
          ) : (
            todayItems.map((t) => (
              <TimeboxCard
                key={t.id}
                timebox={t}
                onComplete={handleComplete}
              />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

interface StatCardProps {
  label: string;
  value: string;
  icon: string;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, color }) => (
  <View style={[styles.statCard, { borderTopColor: color }]}>
    <Text style={styles.statIcon}>{icon}</Text>
    <Text style={[styles.statValue, { color }]}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const EmptyState: React.FC<{ message: string }> = ({ message }) => (
  <View style={styles.emptyState}>
    <Text style={styles.emptyIcon}>📭</Text>
    <Text style={styles.emptyText}>{message}</Text>
  </View>
);

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8FAFC' },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingBottom: 32 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: 16,
    paddingBottom: 20,
  },
  greeting: { fontSize: 14, color: '#6B7280' },
  userName: { fontSize: 22, fontWeight: '700', color: '#111827' },
  dateBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  dateText: { fontSize: 13, fontWeight: '600', color: '#4F46E5' },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderTopWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  statIcon: { fontSize: 20, marginBottom: 4 },
  statValue: { fontSize: 22, fontWeight: '700' },
  statLabel: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  progressSection: { marginBottom: 20 },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  sectionLabel: { fontSize: 13, color: '#6B7280', fontWeight: '500' },
  progressPct: { fontSize: 13, color: '#4F46E5', fontWeight: '700' },
  progressTrack: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4F46E5',
    borderRadius: 4,
  },
  section: { marginBottom: 24 },
  sectionTitle: {
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
