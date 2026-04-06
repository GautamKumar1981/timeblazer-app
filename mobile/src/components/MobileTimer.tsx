import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import type { Timebox } from '../types';
import { categoryColors, colors } from '../theme/colors';

interface Props {
  timebox: Timebox;
  onComplete: () => void;
  onAddFiveMinutes: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const RING_SIZE = 250;
const STROKE_WIDTH = 12;
const RADIUS = (RING_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h, m, s].map((v) => String(v).padStart(2, '0')).join(':');
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function MobileTimer({ timebox, onComplete, onAddFiveMinutes }: Props) {
  const totalSeconds = timebox.duration * 60;
  const [secondsLeft, setSecondsLeft] = useState(() => {
    const end = new Date(timebox.endTime).getTime();
    const now = Date.now();
    return Math.max(0, Math.floor((end - now) / 1000));
  });

  const progress = useRef(new Animated.Value(secondsLeft / totalSeconds)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.04, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  }, [pulseAnim]);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        const next = Math.max(0, prev - 1);
        Animated.timing(progress, {
          toValue: next / totalSeconds,
          duration: 900,
          useNativeDriver: false,
        }).start();
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [totalSeconds, progress]);

  const strokeDashoffset = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [CIRCUMFERENCE, 0],
  });

  const categoryColor = categoryColors[timebox.category] ?? colors.primary;

  const handleAddFive = useCallback(() => {
    setSecondsLeft((prev) => prev + 300);
    onAddFiveMinutes();
  }, [onAddFiveMinutes]);

  return (
    <View style={styles.container}>
      <Text style={styles.taskTitle} numberOfLines={2}>
        {timebox.title}
      </Text>

      <Animated.View style={[styles.ringWrapper, { transform: [{ scale: pulseAnim }] }]}>
        <Svg width={RING_SIZE} height={RING_SIZE}>
          {/* Background ring */}
          <Circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RADIUS}
            stroke={colors.timerRingBg}
            strokeWidth={STROKE_WIDTH}
            fill="transparent"
          />
          {/* Progress ring */}
          <AnimatedCircle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RADIUS}
            stroke={categoryColor}
            strokeWidth={STROKE_WIDTH}
            fill="transparent"
            strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            rotation="-90"
            origin={`${RING_SIZE / 2}, ${RING_SIZE / 2}`}
          />
        </Svg>

        <View style={styles.timerCenter}>
          <Text style={styles.timerText}>{formatTime(secondsLeft)}</Text>
          <Text style={styles.timerLabel}>remaining</Text>
        </View>
      </Animated.View>

      <View style={[styles.categoryBadge, { backgroundColor: `${categoryColor}33` }]}>
        <View style={[styles.categoryDot, { backgroundColor: categoryColor }]} />
        <Text style={[styles.categoryText, { color: categoryColor }]}>{timebox.category}</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.addTimeBtn} onPress={handleAddFive}>
          <Text style={styles.addTimeBtnText}>+ 5 min</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.completeBtn} onPress={onComplete}>
          <Text style={styles.completeBtnText}>✓ Complete Early</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.timerBackground,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  taskTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textOnDark,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 30,
    paddingHorizontal: 16,
  },
  ringWrapper: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  timerCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerText: {
    fontSize: 48,
    fontWeight: '800',
    color: colors.textOnDark,
    letterSpacing: 2,
    fontVariant: ['tabular-nums'],
  },
  timerLabel: {
    fontSize: 13,
    color: colors.textSecondaryOnDark,
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 40,
    gap: 8,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  actions: {
    flexDirection: 'row',
    gap: 16,
    width: '100%',
    paddingHorizontal: 8,
  },
  addTimeBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.primary,
    backgroundColor: 'transparent',
  },
  addTimeBtnText: {
    color: colors.primaryLight,
    fontSize: 16,
    fontWeight: '600',
  },
  completeBtn: {
    flex: 2,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    backgroundColor: colors.primary,
  },
  completeBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
