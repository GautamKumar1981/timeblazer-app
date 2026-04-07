import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Goal } from '../store/store';

const PRIORITY_COLORS: Record<Goal['priority'], string> = {
  high: '#E74C3C',
  medium: '#F39C12',
  low: '#27AE60',
};

const PRIORITY_LABELS: Record<Goal['priority'], string> = {
  high: '🔴 High',
  medium: '🟡 Medium',
  low: '🟢 Low',
};

function dDayText(targetDate: string): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(targetDate);
  target.setHours(0, 0, 0, 0);
  const diffMs = target.getTime() - today.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'D-Day';
  if (diffDays > 0) return `D-${diffDays}`;
  return `D+${Math.abs(diffDays)}`;
}

interface GoalCardProps {
  goal: Goal;
  onPress: (goal: Goal) => void;
}

const GoalCard: React.FC<GoalCardProps> = ({ goal, onPress }) => {
  const priorityColor = PRIORITY_COLORS[goal.priority];
  const ddLabel = dDayText(goal.targetDate);
  const progress = Math.min(Math.max(goal.progress, 0), 100);

  return (
    <TouchableOpacity
      style={[styles.card, goal.isCompleted && styles.completedCard]}
      onPress={() => onPress(goal)}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <Text
          style={[styles.title, goal.isCompleted && styles.completedTitle]}
          numberOfLines={2}
        >
          {goal.isCompleted ? '✓ ' : ''}{goal.title}
        </Text>
        <View style={[styles.dDayBadge, { borderColor: priorityColor }]}>
          <Text style={[styles.dDayText, { color: priorityColor }]}>
            {ddLabel}
          </Text>
        </View>
      </View>

      <Text style={styles.priorityLabel}>{PRIORITY_LABELS[goal.priority]}</Text>

      <View style={styles.progressRow}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${progress}%`, backgroundColor: priorityColor },
            ]}
          />
        </View>
        <Text style={styles.progressText}>{progress}%</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#16213E',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
  },
  completedCard: {
    opacity: 0.6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  completedTitle: {
    textDecorationLine: 'line-through',
    color: '#8888AA',
  },
  dDayBadge: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  dDayText: {
    fontSize: 12,
    fontWeight: '700',
  },
  priorityLabel: {
    color: '#8888AA',
    fontSize: 12,
    marginBottom: 8,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#2A2A4A',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    color: '#8888AA',
    fontSize: 11,
    minWidth: 32,
    textAlign: 'right',
  },
});

export default GoalCard;
