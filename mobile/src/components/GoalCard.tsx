import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from 'react-native-paper';
import { differenceInCalendarDays, parseISO, isPast } from 'date-fns';
import type { Goal } from '../types';
import { colors } from '../theme/colors';

interface Props {
  goal: Goal;
  onPress?: (goal: Goal) => void;
}

const PRIORITY_CONFIG: Record<
  Goal['priority'],
  { label: string; color: string; bg: string }
> = {
  low: { label: 'Low', color: '#6b7280', bg: '#f3f4f6' },
  medium: { label: 'Medium', color: '#f59e0b', bg: '#fef3c7' },
  high: { label: 'High', color: '#3b82f6', bg: '#dbeafe' },
  critical: { label: 'Critical', color: '#ef4444', bg: '#fee2e2' },
};

function getDaysLabel(targetDate: string): { text: string; isUrgent: boolean } {
  const target = parseISO(targetDate);
  const days = differenceInCalendarDays(target, new Date());
  const isUrgent = days <= 7;

  if (isPast(target)) return { text: 'Overdue', isUrgent: true };
  if (days === 0) return { text: 'Due today!', isUrgent: true };
  if (days === 1) return { text: '1 day left', isUrgent: true };
  return { text: `${days} days left`, isUrgent };
}

export default function GoalCard({ goal, onPress }: Props) {
  const priority = PRIORITY_CONFIG[goal.priority];
  const daysLabel = getDaysLabel(goal.targetDate);

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={() => onPress?.(goal)}>
      <Card style={styles.card}>
        <Card.Content style={styles.content}>
          <View style={styles.header}>
            <View style={[styles.priorityBadge, { backgroundColor: priority.bg }]}>
              <Text style={[styles.priorityText, { color: priority.color }]}>
                {priority.label}
              </Text>
            </View>
            <View style={[styles.daysChip, daysLabel.isUrgent && styles.daysChipUrgent]}>
              <Text style={[styles.daysText, daysLabel.isUrgent && styles.daysTextUrgent]}>
                {daysLabel.text}
              </Text>
            </View>
          </View>

          <Text style={styles.title} numberOfLines={2}>
            {goal.title}
          </Text>

          {goal.description ? (
            <Text style={styles.description} numberOfLines={2}>
              {goal.description}
            </Text>
          ) : null}

          <View style={styles.progressSection}>
            <View style={styles.progressRow}>
              <Text style={styles.progressLabel}>Progress</Text>
              <Text style={styles.progressValue}>{goal.progress}%</Text>
            </View>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.min(100, goal.progress)}%`,
                    backgroundColor: goal.isCompleted ? colors.success : colors.primary,
                  },
                ]}
              />
            </View>
          </View>

          {goal.isCompleted && (
            <View style={styles.completedBadge}>
              <Text style={styles.completedText}>✓ Completed</Text>
            </View>
          )}
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.surface,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  content: {
    paddingVertical: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  priorityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  daysChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  daysChipUrgent: {
    backgroundColor: '#fee2e2',
  },
  daysText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  daysTextUrgent: {
    color: '#ef4444',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
    lineHeight: 24,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 14,
    lineHeight: 20,
  },
  progressSection: {
    marginTop: 4,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  progressValue: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '700',
  },
  progressTrack: {
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  completedBadge: {
    marginTop: 10,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#d1fae5',
  },
  completedText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#10b981',
  },
});
