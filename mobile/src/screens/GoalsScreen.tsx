import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { TabParamList, Goal } from '../types';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchGoals, deleteGoal } from '../store/goalsSlice';

type Props = BottomTabScreenProps<TabParamList, 'Goals'>;

function daysUntil(targetDate: string): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(targetDate);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function formatTargetDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

const GoalCard: React.FC<{
  goal: Goal;
  onDelete: (id: number) => void;
}> = ({ goal, onDelete }) => {
  const days = daysUntil(goal.targetDate);
  const isOverdue = days < 0;
  const isUrgent = days >= 0 && days <= 7;
  const progressColor = goal.isCompleted ? '#10B981' : goal.progress >= 70 ? '#4F46E5' : goal.progress >= 40 ? '#F59E0B' : '#EF4444';
  const categoryColor = goal.category?.color ?? '#6366F1';
  const completedMilestones = goal.milestones?.filter((m) => m.isCompleted).length ?? 0;
  const totalMilestones = goal.milestones?.length ?? 0;

  const handleDelete = () => {
    Alert.alert('Delete Goal', `Delete "${goal.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => onDelete(goal.id) },
    ]);
  };

  return (
    <View style={[styles.goalCard, goal.isCompleted && styles.goalCardCompleted]}>
      {/* Top row */}
      <View style={styles.goalHeader}>
        <View style={styles.goalTitleRow}>
          {goal.isCompleted && <Text style={styles.checkIcon}>✅ </Text>}
          <Text
            style={[styles.goalTitle, goal.isCompleted && styles.goalTitleCompleted]}
            numberOfLines={2}
          >
            {goal.title}
          </Text>
        </View>
        <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn}>
          <Text style={styles.deleteBtnText}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Description */}
      {goal.description ? (
        <Text style={styles.goalDesc} numberOfLines={2}>{goal.description}</Text>
      ) : null}

      {/* Progress bar */}
      <View style={styles.progressRow}>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${goal.progress}%` as unknown as number, backgroundColor: progressColor },
            ]}
          />
        </View>
        <Text style={[styles.progressPct, { color: progressColor }]}>{goal.progress}%</Text>
      </View>

      {/* Milestones summary */}
      {totalMilestones > 0 && (
        <Text style={styles.milestonesText}>
          🏁 {completedMilestones}/{totalMilestones} milestones
        </Text>
      )}

      {/* Footer */}
      <View style={styles.goalFooter}>
        {goal.category && (
          <View style={[styles.categoryBadge, { backgroundColor: categoryColor + '22' }]}>
            <Text style={[styles.categoryText, { color: categoryColor }]}>
              {goal.category.name}
            </Text>
          </View>
        )}

        <View style={[
          styles.dDayBadge,
          isOverdue && styles.dDayOverdue,
          isUrgent && !isOverdue && styles.dDayUrgent,
        ]}>
          <Text style={[
            styles.dDayText,
            isOverdue && styles.dDayTextOverdue,
            isUrgent && !isOverdue && styles.dDayTextUrgent,
          ]}>
            {isOverdue
              ? `${Math.abs(days)}d overdue`
              : days === 0
              ? 'Due today!'
              : `D-${days}`}
          </Text>
        </View>

        <Text style={styles.targetDate}>{formatTargetDate(goal.targetDate)}</Text>
      </View>
    </View>
  );
};

export const GoalsScreen: React.FC<Props> = () => {
  const dispatch = useAppDispatch();
  const { items, isLoading } = useAppSelector((s) => s.goals);

  const load = useCallback(() => {
    dispatch(fetchGoals());
  }, [dispatch]);

  useEffect(() => { load(); }, [load]);

  const activeGoals = items.filter((g) => !g.isCompleted);
  const completedGoals = items.filter((g) => g.isCompleted);

  const handleDelete = (id: number) => dispatch(deleteGoal(id));

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={load} />}
      >
        <Text style={styles.screenTitle}>Goals</Text>

        {/* Summary badges */}
        <View style={styles.summaryRow}>
          <View style={[styles.summaryBadge, { backgroundColor: '#EEF2FF' }]}>
            <Text style={[styles.summaryValue, { color: '#4F46E5' }]}>{activeGoals.length}</Text>
            <Text style={styles.summaryLabel}>Active</Text>
          </View>
          <View style={[styles.summaryBadge, { backgroundColor: '#D1FAE5' }]}>
            <Text style={[styles.summaryValue, { color: '#10B981' }]}>{completedGoals.length}</Text>
            <Text style={styles.summaryLabel}>Completed</Text>
          </View>
          <View style={[styles.summaryBadge, { backgroundColor: '#FEF3C7' }]}>
            <Text style={[styles.summaryValue, { color: '#F59E0B' }]}>
              {items.filter((g) => daysUntil(g.targetDate) <= 7 && !g.isCompleted).length}
            </Text>
            <Text style={styles.summaryLabel}>Due Soon</Text>
          </View>
        </View>

        {isLoading && items.length === 0 ? (
          <ActivityIndicator color="#4F46E5" style={styles.loader} />
        ) : items.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🎯</Text>
            <Text style={styles.emptyText}>No goals yet</Text>
            <Text style={styles.emptyHint}>Add goals to track your progress</Text>
          </View>
        ) : (
          <>
            {activeGoals.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>🎯 Active Goals</Text>
                {activeGoals.map((g) => (
                  <GoalCard key={g.id} goal={g} onDelete={handleDelete} />
                ))}
              </View>
            )}

            {completedGoals.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>✅ Completed Goals</Text>
                {completedGoals.map((g) => (
                  <GoalCard key={g.id} goal={g} onDelete={handleDelete} />
                ))}
              </View>
            )}
          </>
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
  summaryRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  summaryBadge: {
    flex: 1,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  summaryValue: { fontSize: 22, fontWeight: '700' },
  summaryLabel: { fontSize: 11, color: '#6B7280', marginTop: 2 },
  loader: { marginTop: 24 },
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  goalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },
  goalCardCompleted: {
    opacity: 0.75,
    backgroundColor: '#F9FAFB',
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  goalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  checkIcon: { fontSize: 14 },
  goalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
  },
  goalTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#9CA3AF',
  },
  deleteBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteBtnText: { fontSize: 12, color: '#EF4444', fontWeight: '700' },
  goalDesc: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 10,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  progressTrack: {
    flex: 1,
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressPct: {
    fontSize: 13,
    fontWeight: '700',
    minWidth: 36,
    textAlign: 'right',
  },
  milestonesText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 10,
  },
  goalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  categoryText: { fontSize: 11, fontWeight: '600' },
  dDayBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  dDayOverdue: { backgroundColor: '#FEE2E2' },
  dDayUrgent: { backgroundColor: '#FEF3C7' },
  dDayText: { fontSize: 12, fontWeight: '700', color: '#4F46E5' },
  dDayTextOverdue: { color: '#EF4444' },
  dDayTextUrgent: { color: '#D97706' },
  targetDate: { fontSize: 11, color: '#9CA3AF', marginLeft: 'auto' },
  emptyState: { alignItems: 'center', paddingVertical: 48 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 16, color: '#6B7280', fontWeight: '500', marginBottom: 4 },
  emptyHint: { fontSize: 14, color: '#9CA3AF' },
});
