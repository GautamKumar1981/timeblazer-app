import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { timeboxesAPI } from '../services/api';
import {
  RootState,
  setCurrentTimebox,
  setTimeboxes,
  Timebox,
} from '../store/store';

function formatMmSs(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function durationSeconds(timebox: Timebox): number {
  const start = new Date(timebox.startTime).getTime();
  const end = new Date(timebox.endTime).getTime();
  return Math.max(0, Math.round((end - start) / 1000));
}

const TimerScreen: React.FC = () => {
  const dispatch = useDispatch();
  const timeboxes = useSelector((s: RootState) => s.timeboxes.items);
  const current = useSelector((s: RootState) => s.timeboxes.currentTimebox);

  const [isRunning, setIsRunning] = useState(false);
  const [remaining, setRemaining] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const remainingRef = useRef(0);

  // Sync remaining when current timebox changes
  useEffect(() => {
    if (current) {
      const dur = durationSeconds(current);
      setTotalDuration(dur);
      setRemaining(dur);
      remainingRef.current = dur;
    }
    setIsRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, [current]);

  // Load today's timeboxes on mount
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    void timeboxesAPI.getTimeboxes(today).then((res) => {
      dispatch(setTimeboxes(res.data?.timeboxes ?? res.data ?? []));
    });
  }, [dispatch]);

  const start = useCallback(() => {
    if (!current || remaining <= 0) return;
    setIsRunning(true);
    intervalRef.current = setInterval(() => {
      remainingRef.current -= 1;
      const next = remainingRef.current;
      setRemaining(next);
      if (next <= 0) {
        clearInterval(intervalRef.current!);
        setIsRunning(false);
        void timeboxesAPI.updateStatus(current.id, 'completed');
      }
    }, 1000);
  }, [current, remaining]);

  const pause = useCallback(() => {
    setIsRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  const stop = useCallback(() => {
    setIsRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (current) {
      const dur = durationSeconds(current);
      setRemaining(dur);
      remainingRef.current = dur;
    }
  }, [current]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const progress =
    totalDuration > 0 ? Math.min(1 - remaining / totalDuration, 1) : 0;
  const progressPercent = Math.round(progress * 100);

  const today = new Date().toISOString().split('T')[0];
  const todayTimeboxes = timeboxes.filter(
    (t) => t.date === today || t.startTime.startsWith(today),
  );

  return (
    <View style={styles.container}>
      {/* Timer area */}
      <View style={styles.timerArea}>
        <Text style={styles.timerTitle}>
          {current ? current.title : 'No active timebox'}
        </Text>
        {current?.category && (
          <Text style={styles.timerCategory}>{current.category}</Text>
        )}

        <View style={styles.clockRing}>
          <Text style={styles.timeDisplay}>{formatMmSs(remaining)}</Text>
          <Text style={styles.progressPercent}>{progressPercent}%</Text>
        </View>

        {/* Progress bar */}
        <View style={styles.progressBar}>
          <View
            style={[styles.progressFill, { width: `${progressPercent}%` }]}
          />
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity
            style={[styles.controlBtn, styles.stopBtn]}
            onPress={stop}
            disabled={!current}
          >
            <Text style={styles.controlBtnText}>⏹</Text>
          </TouchableOpacity>

          {isRunning ? (
            <TouchableOpacity
              style={[styles.controlBtn, styles.pauseBtn]}
              onPress={pause}
            >
              <Text style={styles.controlBtnText}>⏸</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.controlBtn, styles.startBtn]}
              onPress={start}
              disabled={!current}
            >
              <Text style={styles.controlBtnText}>▶</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Timebox selector */}
      <View style={styles.selectorContainer}>
        <Text style={styles.selectorTitle}>Today's Timeboxes</Text>
        <ScrollView showsVerticalScrollIndicator={false}>
          {todayTimeboxes.length === 0 && (
            <Text style={styles.emptyText}>No timeboxes today.</Text>
          )}
          {todayTimeboxes.map((tb) => {
            const isSelected = current?.id === tb.id;
            return (
              <TouchableOpacity
                key={tb.id}
                style={[styles.tbItem, isSelected && styles.tbItemSelected]}
                onPress={() => dispatch(setCurrentTimebox(tb))}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.tbStatusDot,
                    {
                      backgroundColor:
                        tb.status === 'completed'
                          ? '#27AE60'
                          : tb.status === 'in_progress'
                          ? '#4A90E2'
                          : '#8888AA',
                    },
                  ]}
                />
                <View style={styles.tbInfo}>
                  <Text
                    style={[
                      styles.tbTitle,
                      isSelected && styles.tbTitleSelected,
                    ]}
                    numberOfLines={1}
                  >
                    {tb.title}
                  </Text>
                  <Text style={styles.tbDuration}>
                    {Math.round(durationSeconds(tb) / 60)} min
                  </Text>
                </View>
                {isSelected && <Text style={styles.selectedMark}>✓</Text>}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A2E',
  },
  timerArea: {
    flex: 0.55,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A4A',
  },
  timerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  timerCategory: {
    color: '#4A90E2',
    fontSize: 13,
    marginBottom: 16,
  },
  clockRing: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 6,
    borderColor: '#4A90E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    backgroundColor: '#16213E',
  },
  timeDisplay: {
    color: '#FFFFFF',
    fontSize: 40,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  progressPercent: {
    color: '#8888AA',
    fontSize: 14,
    marginTop: 4,
  },
  progressBar: {
    width: '80%',
    height: 4,
    backgroundColor: '#2A2A4A',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 24,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4A90E2',
    borderRadius: 2,
  },
  controls: {
    flexDirection: 'row',
    gap: 20,
  },
  controlBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startBtn: {
    backgroundColor: '#27AE60',
  },
  pauseBtn: {
    backgroundColor: '#F39C12',
  },
  stopBtn: {
    backgroundColor: '#E74C3C',
  },
  controlBtnText: {
    fontSize: 22,
    color: '#FFFFFF',
  },
  selectorContainer: {
    flex: 0.45,
    padding: 16,
  },
  selectorTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 10,
  },
  emptyText: {
    color: '#8888AA',
    textAlign: 'center',
    marginTop: 20,
  },
  tbItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16213E',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  tbItemSelected: {
    borderWidth: 1,
    borderColor: '#4A90E2',
  },
  tbStatusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  tbInfo: {
    flex: 1,
  },
  tbTitle: {
    color: '#CCCCDD',
    fontSize: 14,
    fontWeight: '500',
  },
  tbTitleSelected: {
    color: '#FFFFFF',
  },
  tbDuration: {
    color: '#8888AA',
    fontSize: 12,
    marginTop: 2,
  },
  selectedMark: {
    color: '#4A90E2',
    fontWeight: '700',
    fontSize: 16,
  },
});

export default TimerScreen;
