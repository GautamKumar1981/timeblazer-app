import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';

interface MobileTimerProps {
  totalSeconds: number;
  elapsedSeconds: number;
  isRunning: boolean;
  isPaused: boolean;
  timeboxTitle?: string;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
}

function formatCountdown(remaining: number): string {
  const m = Math.floor(remaining / 60);
  const s = remaining % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export const MobileTimer: React.FC<MobileTimerProps> = ({
  totalSeconds,
  elapsedSeconds,
  isRunning,
  isPaused,
  timeboxTitle,
  onStart,
  onPause,
  onResume,
  onStop,
}) => {
  const remaining = Math.max(0, totalSeconds - elapsedSeconds);
  const progress = totalSeconds > 0 ? elapsedSeconds / totalSeconds : 0;

  // Pulse animation when running
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isRunning) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.04, duration: 1000, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
  }, [isRunning, pulseAnim]);

  // Draw circular progress using SVG-like approach with Views
  const RADIUS = 100;
  const circumference = 2 * Math.PI * RADIUS;
  const filled = circumference * progress;

  const progressColor = progress > 0.85 ? '#EF4444' : progress > 0.6 ? '#F59E0B' : '#4F46E5';

  const isIdle = !isRunning && !isPaused;

  return (
    <View style={styles.container}>
      {timeboxTitle && (
        <Text style={styles.timeboxTitle} numberOfLines={2}>
          {timeboxTitle}
        </Text>
      )}

      {/* Circular progress ring */}
      <Animated.View style={[styles.ringWrapper, { transform: [{ scale: pulseAnim }] }]}>
        <View style={[styles.ring, { borderColor: '#E5E7EB' }]}>
          {/* Filled arc overlay */}
          <View
            style={[
              styles.ringFill,
              {
                borderColor: progressColor,
                // Approximate visual progress with border rotation trick
                transform: [{ rotate: `${progress * 360}deg` }],
                opacity: progress > 0 ? 1 : 0,
              },
            ]}
          />
          <View style={styles.ringInner}>
            <Text style={[styles.countdownText, { color: progressColor }]}>
              {formatCountdown(remaining)}
            </Text>
            {totalSeconds > 0 && (
              <Text style={styles.totalText}>
                / {Math.floor(totalSeconds / 60)} min
              </Text>
            )}
            {isIdle && totalSeconds === 0 && (
              <Text style={styles.idleText}>Ready</Text>
            )}
            {isPaused && <Text style={styles.pausedLabel}>PAUSED</Text>}
          </View>
        </View>
      </Animated.View>

      {/* Progress bar */}
      <View style={styles.progressBarContainer}>
        <View
          style={[
            styles.progressBarFill,
            { width: `${Math.min(100, progress * 100)}%` as unknown as number, backgroundColor: progressColor },
          ]}
        />
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        {isIdle && (
          <TouchableOpacity style={[styles.btn, styles.startBtn]} onPress={onStart}>
            <Text style={styles.btnText}>▶ Start</Text>
          </TouchableOpacity>
        )}

        {isRunning && (
          <>
            <TouchableOpacity style={[styles.btn, styles.pauseBtn]} onPress={onPause}>
              <Text style={[styles.btnText, styles.pauseBtnText]}>⏸ Pause</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, styles.stopBtn]} onPress={onStop}>
              <Text style={[styles.btnText, styles.stopBtnText]}>⏹ Stop</Text>
            </TouchableOpacity>
          </>
        )}

        {isPaused && (
          <>
            <TouchableOpacity style={[styles.btn, styles.startBtn]} onPress={onResume}>
              <Text style={styles.btnText}>▶ Resume</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, styles.stopBtn]} onPress={onStop}>
              <Text style={[styles.btnText, styles.stopBtnText]}>⏹ Stop</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  timeboxTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 24,
  },
  ringWrapper: {
    marginBottom: 20,
  },
  ring: {
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 10,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  ringFill: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 10,
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  ringInner: {
    alignItems: 'center',
  },
  countdownText: {
    fontSize: 44,
    fontWeight: '700',
    letterSpacing: 2,
  },
  totalText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
  },
  idleText: {
    fontSize: 18,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  pausedLabel: {
    fontSize: 12,
    color: '#F59E0B',
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: 4,
  },
  progressBarContainer: {
    width: '80%',
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 32,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  controls: {
    flexDirection: 'row',
    gap: 12,
  },
  btn: {
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 30,
    minWidth: 120,
    alignItems: 'center',
  },
  startBtn: {
    backgroundColor: '#4F46E5',
  },
  pauseBtn: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  stopBtn: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  btnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  pauseBtnText: {
    color: '#92400E',
  },
  stopBtnText: {
    color: '#991B1B',
  },
});
