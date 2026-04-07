import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Timebox } from '../store/store';

const STATUS_COLORS: Record<Timebox['status'], string> = {
  pending: '#8888AA',
  in_progress: '#4A90E2',
  completed: '#27AE60',
  skipped: '#E74C3C',
};

const STATUS_LABELS: Record<Timebox['status'], string> = {
  pending: 'Pending',
  in_progress: 'In Progress',
  completed: 'Done',
  skipped: 'Skipped',
};

function formatTimeRange(start: string, end: string): string {
  const fmt = (t: string) => {
    const d = new Date(t);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  return `${fmt(start)} – ${fmt(end)}`;
}

interface TimeboxCardProps {
  timebox: Timebox;
  onPress: (timebox: Timebox) => void;
  onStatusChange: (timebox: Timebox, status: Timebox['status']) => void;
}

const TimeboxCard: React.FC<TimeboxCardProps> = ({
  timebox,
  onPress,
  onStatusChange,
}) => {
  const statusColor = STATUS_COLORS[timebox.status];
  const borderColor = timebox.color ?? statusColor;

  return (
    <TouchableOpacity
      style={[styles.card, { borderLeftColor: borderColor }]}
      onPress={() => onPress(timebox)}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={1}>
          {timebox.title}
        </Text>
        <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
      </View>

      <Text style={styles.timeRange}>
        {formatTimeRange(timebox.startTime, timebox.endTime)}
      </Text>

      {timebox.category && (
        <Text style={styles.category}>{timebox.category}</Text>
      )}

      <View style={styles.footer}>
        <Text style={[styles.statusLabel, { color: statusColor }]}>
          {STATUS_LABELS[timebox.status]}
        </Text>
        {timebox.status === 'pending' && (
          <TouchableOpacity
            style={styles.startBtn}
            onPress={() => onStatusChange(timebox, 'in_progress')}
          >
            <Text style={styles.startBtnText}>▶ Start</Text>
          </TouchableOpacity>
        )}
        {timebox.status === 'in_progress' && (
          <TouchableOpacity
            style={[styles.startBtn, styles.doneBtn]}
            onPress={() => onStatusChange(timebox, 'completed')}
          >
            <Text style={styles.startBtnText}>✓ Done</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#16213E',
    borderRadius: 10,
    borderLeftWidth: 4,
    padding: 14,
    marginBottom: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  timeRange: {
    color: '#8888AA',
    fontSize: 13,
    marginBottom: 4,
  },
  category: {
    color: '#4A90E2',
    fontSize: 12,
    marginBottom: 6,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  startBtn: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  doneBtn: {
    backgroundColor: '#27AE60',
  },
  startBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default TimeboxCard;
