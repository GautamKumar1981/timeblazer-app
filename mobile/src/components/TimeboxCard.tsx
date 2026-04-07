import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import type { Timebox } from '../types';

interface TimeboxCardProps {
  timebox: Timebox;
  onComplete?: (id: number) => void;
  onDelete?: (id: number) => void;
  onPress?: (timebox: Timebox) => void;
}

const PRIORITY_COLORS: Record<string, string> = {
  high: '#EF4444',
  medium: '#F59E0B',
  low: '#10B981',
};

function formatTime(timeStr: string): string {
  if (!timeStr) return '';
  const [hours, minutes] = timeStr.split(':');
  const h = parseInt(hours, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 === 0 ? 12 : h % 12;
  return `${displayH}:${minutes} ${ampm}`;
}

export const TimeboxCard: React.FC<TimeboxCardProps> = ({
  timebox,
  onComplete,
  onDelete,
  onPress,
}) => {
  const priorityColor = PRIORITY_COLORS[timebox.priority] ?? '#6B7280';
  const categoryColor = timebox.category?.color ?? '#6366F1';

  return (
    <TouchableOpacity
      style={[styles.card, timebox.isCompleted && styles.cardCompleted]}
      onPress={() => onPress?.(timebox)}
      activeOpacity={0.8}
    >
      <View style={[styles.priorityBar, { backgroundColor: priorityColor }]} />

      <View style={styles.content}>
        <View style={styles.header}>
          <Text
            style={[styles.title, timebox.isCompleted && styles.titleCompleted]}
            numberOfLines={1}
          >
            {timebox.title}
          </Text>
          {timebox.category && (
            <View style={[styles.categoryBadge, { backgroundColor: categoryColor + '22' }]}>
              <Text style={[styles.categoryText, { color: categoryColor }]}>
                {timebox.category.name}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.timeRow}>
          <Text style={styles.timeText}>
            {formatTime(timebox.startTime)} – {formatTime(timebox.endTime)}
          </Text>
          <Text style={styles.durationText}>{timebox.duration} min</Text>
        </View>

        {timebox.description ? (
          <Text style={styles.description} numberOfLines={2}>
            {timebox.description}
          </Text>
        ) : null}
      </View>

      <View style={styles.actions}>
        {!timebox.isCompleted && onComplete && (
          <TouchableOpacity
            style={[styles.actionBtn, styles.completeBtn]}
            onPress={() => onComplete(timebox.id)}
          >
            <Text style={styles.actionIcon}>✓</Text>
          </TouchableOpacity>
        )}
        {onDelete && (
          <TouchableOpacity
            style={[styles.actionBtn, styles.deleteBtn]}
            onPress={() => onDelete(timebox.id)}
          >
            <Text style={styles.actionIcon}>✕</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  cardCompleted: {
    opacity: 0.6,
    backgroundColor: '#F9FAFB',
  },
  priorityBar: {
    width: 4,
  },
  content: {
    flex: 1,
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    marginRight: 8,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: '#9CA3AF',
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '500',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  timeText: {
    fontSize: 12,
    color: '#6B7280',
  },
  durationText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  description: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  actions: {
    justifyContent: 'center',
    paddingRight: 8,
    gap: 6,
  },
  actionBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  completeBtn: {
    backgroundColor: '#D1FAE5',
  },
  deleteBtn: {
    backgroundColor: '#FEE2E2',
  },
  actionIcon: {
    fontSize: 13,
    fontWeight: '700',
  },
});
