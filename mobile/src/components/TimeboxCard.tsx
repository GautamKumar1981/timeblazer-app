import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Chip } from 'react-native-paper';
import { format } from 'date-fns';
import type { Timebox } from '../types';
import { categoryColors, colors } from '../theme/colors';

interface Props {
  timebox: Timebox;
  onPress?: (timebox: Timebox) => void;
}

const STATUS_CONFIG: Record<
  Timebox['status'],
  { label: string; color: string; bg: string }
> = {
  pending: { label: 'Upcoming', color: '#6b7280', bg: '#f3f4f6' },
  active: { label: 'Active', color: '#10b981', bg: '#d1fae5' },
  completed: { label: 'Done', color: '#3b82f6', bg: '#dbeafe' },
  skipped: { label: 'Skipped', color: '#ef4444', bg: '#fee2e2' },
};

function formatTimeRange(start: string, end: string): string {
  return `${format(new Date(start), 'h:mm a')} – ${format(new Date(end), 'h:mm a')}`;
}

export default function TimeboxCard({ timebox, onPress }: Props) {
  const catColor = categoryColors[timebox.category] ?? colors.primary;
  const status = STATUS_CONFIG[timebox.status];

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={() => onPress?.(timebox)}>
      <Card style={[styles.card, timebox.status === 'active' && styles.cardActive]}>
        <View style={[styles.accent, { backgroundColor: catColor }]} />
        <Card.Content style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title} numberOfLines={1}>
              {timebox.title}
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
              <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
            </View>
          </View>

          <Text style={styles.timeRange}>{formatTimeRange(timebox.startTime, timebox.endTime)}</Text>

          <View style={styles.footer}>
            <Chip
              style={[styles.categoryChip, { backgroundColor: `${catColor}22` }]}
              textStyle={[styles.categoryChipText, { color: catColor }]}
              compact
            >
              {timebox.category}
            </Chip>
            <Text style={styles.duration}>{timebox.duration} min</Text>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 14,
    backgroundColor: colors.surface,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  cardActive: {
    borderWidth: 1.5,
    borderColor: colors.primary,
    elevation: 4,
    shadowOpacity: 0.15,
  },
  accent: {
    width: 4,
    alignSelf: 'stretch',
  },
  content: {
    flex: 1,
    paddingVertical: 12,
    paddingRight: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  timeRange: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 10,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryChip: {
    height: 26,
    borderRadius: 13,
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  duration: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
});
