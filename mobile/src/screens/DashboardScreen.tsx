import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { analyticsAPI, prioritiesAPI, timeboxesAPI } from '../services/api';
import { RootState, setTimeboxes, Timebox } from '../store/store';
import TimeboxCard from '../components/TimeboxCard';

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function todayLabel(): string {
  return new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

interface Priority {
  id: string;
  title: string;
  completed: boolean;
}

interface WeeklyStats {
  completionRate: number;
  streak: number;
}

const DashboardScreen: React.FC = () => {
  const dispatch = useDispatch();
  const user = useSelector((s: RootState) => s.auth.user);
  const timeboxes = useSelector((s: RootState) => s.timeboxes.items);

  const [priorities, setPriorities] = useState<Priority[]>([]);
  const [stats, setStats] = useState<WeeklyStats>({ completionRate: 0, streak: 0 });
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const [tbRes, prRes, statsRes] = await Promise.allSettled([
        timeboxesAPI.getTimeboxes(today),
        prioritiesAPI.getToday(),
        analyticsAPI.getWeekly(),
      ]);

      if (tbRes.status === 'fulfilled') {
        dispatch(setTimeboxes(tbRes.value.data?.timeboxes ?? tbRes.value.data ?? []));
      }
      if (prRes.status === 'fulfilled') {
        setPriorities(prRes.value.data?.priorities ?? prRes.value.data ?? []);
      }
      if (statsRes.status === 'fulfilled') {
        setStats(statsRes.value.data ?? { completionRate: 0, streak: 0 });
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [dispatch]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    void loadData();
  }, [loadData]);

  const handleStatusChange = useCallback(
    async (timebox: Timebox, status: Timebox['status']) => {
      try {
        await timeboxesAPI.updateStatus(timebox.id, status);
        const today = new Date().toISOString().split('T')[0];
        const res = await timeboxesAPI.getTimeboxes(today);
        dispatch(setTimeboxes(res.data?.timeboxes ?? res.data ?? []));
      } catch {
        // silently ignore
      }
    },
    [dispatch],
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

  const todayTimeboxes = timeboxes.filter((t) => {
    const today = new Date().toISOString().split('T')[0];
    return t.date === today || t.startTime.startsWith(today);
  });

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#4A90E2"
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>
          {greeting()}, {user?.name ?? 'there'} 👋
        </Text>
        <Text style={styles.dateLabel}>{todayLabel()}</Text>
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.completionRate}%</Text>
          <Text style={styles.statLabel}>Completion</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>🔥 {stats.streak}</Text>
          <Text style={styles.statLabel}>Day Streak</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{todayTimeboxes.length}</Text>
          <Text style={styles.statLabel}>Timeboxes</Text>
        </View>
      </View>

      {/* Top priorities */}
      {priorities.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎯 Today's Priorities</Text>
          {priorities.slice(0, 3).map((p, i) => (
            <View key={p.id} style={styles.priorityItem}>
              <Text style={styles.priorityIndex}>{i + 1}</Text>
              <Text
                style={[styles.priorityText, p.completed && styles.priorityDone]}
              >
                {p.title}
              </Text>
              {p.completed && <Text style={styles.checkmark}>✓</Text>}
            </View>
          ))}
        </View>
      )}

      {/* Today's timeboxes */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⏱ Today's Timeboxes</Text>
        {todayTimeboxes.length === 0 ? (
          <Text style={styles.emptyText}>No timeboxes scheduled for today.</Text>
        ) : (
          todayTimeboxes.map((tb) => (
            <TimeboxCard
              key={tb.id}
              timebox={tb}
              onPress={() => {}}
              onStatusChange={handleStatusChange}
            />
          ))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A2E',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  centered: {
    flex: 1,
    backgroundColor: '#1A1A2E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    marginBottom: 20,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  dateLabel: {
    color: '#8888AA',
    fontSize: 13,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#16213E',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  statValue: {
    color: '#4A90E2',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    color: '#8888AA',
    fontSize: 11,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  priorityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16213E',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  priorityIndex: {
    color: '#4A90E2',
    fontWeight: '700',
    fontSize: 16,
    width: 24,
  },
  priorityText: {
    color: '#FFFFFF',
    flex: 1,
    fontSize: 14,
  },
  priorityDone: {
    textDecorationLine: 'line-through',
    color: '#8888AA',
  },
  checkmark: {
    color: '#27AE60',
    fontWeight: '700',
    fontSize: 16,
  },
  emptyText: {
    color: '#8888AA',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
});

export default DashboardScreen;
