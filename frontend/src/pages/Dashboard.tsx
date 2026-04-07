import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { format } from 'date-fns';
import { RootState } from '../store/store';
import { setTimeboxes, updateTimebox, Timebox } from '../store/slices/timeboxSlice';
import { api } from '../services/api';
import TimeboxCard from '../components/Timebox/TimeboxCard';
import Timer from '../components/Timer/Timer';
import styles from './Dashboard.module.css';

interface Priority {
  id: string;
  title: string;
  order: number;
}

function Dashboard() {
  const dispatch = useDispatch();
  const { timeboxes, isLoading } = useSelector((state: RootState) => state.timebox);
  const { user } = useSelector((state: RootState) => state.auth);
  const [priorities, setPriorities] = useState<Priority[]>([]);
  const [activeTimebox, setActiveTimebox] = useState<Timebox | null>(null);
  const [streaks, setStreaks] = useState<{ current: number; best: number } | null>(null);

  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');

  const todayTimeboxes = timeboxes.filter((tb) => {
    const tbDate = format(new Date(tb.start_time), 'yyyy-MM-dd');
    return tbDate === todayStr;
  });

  const completedToday = todayTimeboxes.filter((tb) => tb.status === 'completed').length;
  const completionRate = todayTimeboxes.length > 0
    ? Math.round((completedToday / todayTimeboxes.length) * 100)
    : 0;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tbRes, prRes, streakRes] = await Promise.all([
          api.timeboxes.getTimeboxes({ date: todayStr }),
          api.priorities.getToday(),
          api.analytics.getStreaks(),
        ]);
        dispatch(setTimeboxes(tbRes.data.timeboxes || tbRes.data));
        setPriorities(prRes.data.priorities || prRes.data || []);
        setStreaks(streakRes.data);
      } catch {
        // Silently handle errors; components show empty state
      }
    };
    fetchData();
  }, [dispatch, todayStr]);

  const handleStatusChange = async (id: string, status: Timebox['status']) => {
    try {
      const res = await api.timeboxes.updateStatus(id, status);
      dispatch(updateTimebox(res.data));
    } catch {}
  };

  const handleDelete = async (id: string) => {
    try {
      await api.timeboxes.deleteTimebox(id);
      dispatch(setTimeboxes(timeboxes.filter((t) => t.id !== id)));
    } catch {}
  };

  const handleTimerComplete = async () => {
    if (activeTimebox) {
      await handleStatusChange(activeTimebox.id, 'completed');
      setActiveTimebox(null);
    }
  };

  return (
    <div className={styles.dashboard}>
      <div className={styles.welcomeHeader}>
        <div>
          <h1 className={styles.greeting}>
            Good {today.getHours() < 12 ? 'morning' : today.getHours() < 17 ? 'afternoon' : 'evening'},{' '}
            {user?.name?.split(' ')[0] ?? 'there'} 👋
          </h1>
          <p className={styles.dateStr}>{format(today, 'EEEE, MMMM d, yyyy')}</p>
        </div>
        <div className={styles.stats}>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{completionRate}%</div>
            <div className={styles.statLabel}>Completion</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{todayTimeboxes.length}</div>
            <div className={styles.statLabel}>Timeboxes</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{streaks?.current ?? 0} 🔥</div>
            <div className={styles.statLabel}>Streak</div>
          </div>
        </div>
      </div>

      {activeTimebox && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>🎯 Active Focus</h2>
          <Timer
            timebox={activeTimebox}
            onComplete={handleTimerComplete}
            onPause={(elapsed) => setActiveTimebox(null)}
          />
        </section>
      )}

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>🎯 Today's Priorities</h2>
        {priorities.length === 0 ? (
          <div className={styles.emptyState}>No priorities set for today. Plan your top 3 tasks!</div>
        ) : (
          <ol className={styles.priorityList}>
            {priorities.slice(0, 3).map((p, i) => (
              <li key={p.id} className={styles.priorityItem}>
                <span className={styles.priorityNum}>{i + 1}</span>
                <span>{p.title}</span>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>📅 Today's Schedule</h2>
        {isLoading ? (
          <div className="loading-spinner">Loading...</div>
        ) : todayTimeboxes.length === 0 ? (
          <div className={styles.emptyState}>No timeboxes for today. Head to the Calendar to plan your day!</div>
        ) : (
          <div className={styles.timeboxGrid}>
            {todayTimeboxes.map((tb) => (
              <TimeboxCard
                key={tb.id}
                timebox={tb}
                onEdit={() => {}}
                onDelete={handleDelete}
                onStatusChange={handleStatusChange}
                onStart={(t) => setActiveTimebox(t)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Dashboard;
