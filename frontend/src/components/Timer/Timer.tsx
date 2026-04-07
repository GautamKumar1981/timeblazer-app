import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Timebox } from '../../store/slices/timeboxSlice';
import styles from './Timer.module.css';

interface TimerProps {
  timebox: Timebox;
  onComplete: () => void;
  onPause: (elapsed: number) => void;
}

function Timer({ timebox, onComplete, onPause }: TimerProps) {
  const endTime = new Date(timebox.end_time).getTime();
  const startTime = new Date(timebox.start_time).getTime();
  const totalSeconds = Math.floor((endTime - startTime) / 1000);

  const [secondsLeft, setSecondsLeft] = useState<number>(() => {
    const remaining = Math.floor((endTime - Date.now()) / 1000);
    return Math.max(0, remaining);
  });
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const elapsedRef = useRef(0);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearTimer();
            setIsRunning(false);
            onComplete();
            return 0;
          }
          elapsedRef.current += 1;
          return prev - 1;
        });
      }, 1000);
    } else {
      clearTimer();
    }
    return clearTimer;
  }, [isRunning, clearTimer, onComplete]);

  const handlePause = () => {
    setIsRunning(false);
    onPause(elapsedRef.current);
  };

  const handleStop = () => {
    setIsRunning(false);
    clearTimer();
    onPause(elapsedRef.current);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const progress = totalSeconds > 0 ? ((totalSeconds - secondsLeft) / totalSeconds) * 100 : 0;
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className={styles.timer}>
      <div className={styles.title}>{timebox.title}</div>
      <div className={styles.category}
        style={{ backgroundColor: timebox.color || 'var(--primary)' }}>
        {timebox.category}
      </div>
      <div className={styles.circleWrapper}>
        <svg className={styles.svg} viewBox="0 0 200 200">
          <circle
            className={styles.bgCircle}
            cx="100" cy="100" r={radius}
            fill="none" strokeWidth="12"
          />
          <circle
            className={styles.progressCircle}
            cx="100" cy="100" r={radius}
            fill="none" strokeWidth="12"
            stroke={timebox.color || 'var(--primary)'}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform="rotate(-90 100 100)"
          />
        </svg>
        <div className={styles.timeDisplay}>{formatTime(secondsLeft)}</div>
      </div>
      <div className={styles.controls}>
        {!isRunning ? (
          <button className={`${styles.btn} ${styles.start}`} onClick={() => setIsRunning(true)}>
            ▶ Start
          </button>
        ) : (
          <button className={`${styles.btn} ${styles.pause}`} onClick={handlePause}>
            ⏸ Pause
          </button>
        )}
        <button className={`${styles.btn} ${styles.stop}`} onClick={handleStop}>
          ⏹ Stop
        </button>
      </div>
    </div>
  );
}

export default Timer;
