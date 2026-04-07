import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../store/store';
import { Timebox } from '../store/slices/timeboxSlice';
import { api } from '../services/api';
import { format } from 'date-fns';
import styles from './FocusMode.module.css';

function FocusMode() {
  const navigate = useNavigate();
  const { timeboxes } = useSelector((state: RootState) => state.timebox);
  const [activeTimebox, setActiveTimebox] = useState<Timebox | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const todayStr = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    const fetchToday = async () => {
      try {
        const res = await api.timeboxes.getTimeboxes({ date: todayStr });
        const items: Timebox[] = res.data.timeboxes || res.data;
        const inProgress = items.find((tb) => tb.status === 'in_progress')
          || items.find((tb) => tb.status === 'pending');
        if (inProgress) {
          setActiveTimebox(inProgress);
          const endMs = new Date(inProgress.end_time).getTime();
          const remaining = Math.max(0, Math.floor((endMs - Date.now()) / 1000));
          setSecondsLeft(remaining);
        }
      } catch {}
    };
    if (timeboxes.length > 0) {
      const inProgress = timeboxes.find((tb) => tb.status === 'in_progress')
        || timeboxes.find((tb) => tb.status === 'pending' && format(new Date(tb.start_time), 'yyyy-MM-dd') === todayStr);
      if (inProgress) {
        setActiveTimebox(inProgress);
        const endMs = new Date(inProgress.end_time).getTime();
        setSecondsLeft(Math.max(0, Math.floor((endMs - Date.now()) / 1000)));
      }
    } else {
      fetchToday();
    }
  }, [timeboxes, todayStr]);

  const stopTimer = useCallback(() => {
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
            stopTimer();
            setIsRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      stopTimer();
    }
    return stopTimer;
  }, [isRunning, stopTimer]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setIsRunning((r) => !r);
      }
      if (e.code === 'Escape') {
        navigate(-1);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [navigate]);

  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return h > 0 ? `${h}:${m}:${s}` : `${m}:${s}`;
  };

  return (
    <div className={styles.focusPage}>
      <button className={styles.exitBtn} onClick={() => navigate(-1)}>✕ Exit</button>
      <div className={styles.content}>
        {activeTimebox ? (
          <>
            <div className={styles.category} style={{ backgroundColor: activeTimebox.color || '#4A90E2' }}>
              {activeTimebox.category}
            </div>
            <h1 className={styles.taskTitle}>{activeTimebox.title}</h1>
            <div className={styles.timerDisplay}>{formatTime(secondsLeft)}</div>
            <div className={styles.controls}>
              <button
                className={`${styles.controlBtn} ${isRunning ? styles.pauseBtn : styles.startBtn}`}
                onClick={() => setIsRunning((r) => !r)}
              >
                {isRunning ? '⏸ Pause' : '▶ Start'}
              </button>
            </div>
            <div className={styles.shortcuts}>
              <span>Space = Pause/Resume</span>
              <span>Esc = Exit</span>
            </div>
          </>
        ) : (
          <div className={styles.noTask}>
            <div className={styles.noTaskIcon}>🎯</div>
            <h2>No active timebox</h2>
            <p>Go to the Dashboard to start a timebox</p>
            <button className={styles.backBtn} onClick={() => navigate('/dashboard')}>
              Go to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default FocusMode;
