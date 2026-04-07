import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface MobileTimerProps {
  durationSeconds: number;
  isRunning: boolean;
  onComplete: () => void;
  onTick: (remaining: number) => void;
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) {
    return [h, m, s].map((v) => String(v).padStart(2, '0')).join(':');
  }
  return [m, s].map((v) => String(v).padStart(2, '0')).join(':');
}

const MobileTimer: React.FC<MobileTimerProps> = ({
  durationSeconds,
  isRunning,
  onComplete,
  onTick,
}) => {
  const remainingRef = useRef(durationSeconds);
  const [remaining, setRemaining] = React.useState(durationSeconds);

  useEffect(() => {
    remainingRef.current = durationSeconds;
    setRemaining(durationSeconds);
  }, [durationSeconds]);

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      remainingRef.current -= 1;
      const next = remainingRef.current;
      setRemaining(next);
      onTick(next);
      if (next <= 0) {
        clearInterval(interval);
        onComplete();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning, onComplete, onTick]);

  const progress = durationSeconds > 0 ? 1 - remaining / durationSeconds : 0;
  const progressPercent = Math.round(progress * 100);

  return (
    <View style={styles.container}>
      <Text style={styles.timeText}>{formatTime(remaining)}</Text>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
      </View>
      <Text style={styles.progressLabel}>{progressPercent}% complete</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  timeText: {
    fontSize: 64,
    fontWeight: '700',
    color: '#4A90E2',
    letterSpacing: 2,
    fontVariant: ['tabular-nums'],
  },
  progressBar: {
    width: '80%',
    height: 6,
    backgroundColor: '#2A2A4A',
    borderRadius: 3,
    marginTop: 16,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4A90E2',
    borderRadius: 3,
  },
  progressLabel: {
    color: '#8888AA',
    fontSize: 13,
    marginTop: 6,
  },
});

export default MobileTimer;
