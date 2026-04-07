import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import {
  setWeeklyData, setMonthlyData, setPatterns, setStreaks,
  DailyData, HourlyPatterns, Streaks
} from '../store/slices/analyticsSlice';
import { api } from '../services/api';
import Chart, { ChartDataItem } from '../components/Analytics/Chart';
import styles from './Analytics.module.css';

function Analytics() {
  const dispatch = useDispatch();
  const { weeklyData, monthlyData, patterns, streaks, isLoading } = useSelector(
    (state: RootState) => state.analytics
  );

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [weeklyRes, monthlyRes, patternsRes, streaksRes] = await Promise.all([
          api.analytics.getWeekly(),
          api.analytics.getMonthly(new Date().getMonth() + 1, new Date().getFullYear()),
          api.analytics.getPatterns(),
          api.analytics.getStreaks(),
        ]);
        dispatch(setWeeklyData((weeklyRes.data.data || weeklyRes.data || []) as DailyData[]));
        dispatch(setMonthlyData((monthlyRes.data.data || monthlyRes.data || []) as DailyData[]));
        dispatch(setPatterns(patternsRes.data as HourlyPatterns));
        dispatch(setStreaks(streaksRes.data as Streaks));
      } catch {}
    };
    fetchAll();
  }, [dispatch]);

  const weeklyRate = streaks?.weekly_completion_rate ?? 0;
  const monthlyRate = streaks?.monthly_completion_rate ?? 0;
  const currentStreak = streaks?.current ?? 0;
  const bestStreak = streaks?.best ?? 0;

  const patternData: ChartDataItem[] = patterns?.hourly
    ? Object.entries(patterns.hourly).map(([hour, count]) => ({
        hour: `${hour}:00`,
        completions: count,
      }))
    : [];

  const categoryData: ChartDataItem[] = patterns?.by_category
    ? Object.entries(patterns.by_category).map(([name, count]) => ({ name, value: count }))
    : [];

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>📈 Analytics</h1>

      {isLoading ? (
        <div className="loading-spinner">Loading...</div>
      ) : (
        <>
          <div className={styles.statsGrid}>
            <div className={`${styles.statCard} card`}>
              <div className={styles.statValue}>{weeklyRate}%</div>
              <div className={styles.statLabel}>Weekly Completion</div>
            </div>
            <div className={`${styles.statCard} card`}>
              <div className={styles.statValue}>{monthlyRate}%</div>
              <div className={styles.statLabel}>Monthly Completion</div>
            </div>
            <div className={`${styles.statCard} card`}>
              <div className={styles.statValue}>{currentStreak} 🔥</div>
              <div className={styles.statLabel}>Current Streak</div>
            </div>
            <div className={`${styles.statCard} card`}>
              <div className={styles.statValue}>{bestStreak} ⭐</div>
              <div className={styles.statLabel}>Best Streak</div>
            </div>
          </div>

          <div className={styles.chartsGrid}>
            <Chart
              data={weeklyData}
              type="bar"
              title="Weekly Completion"
              dataKey="completion_rate"
              xAxisKey="day"
            />
            <Chart
              data={patternData}
              type="line"
              title="Productivity by Hour"
              dataKey="completions"
              xAxisKey="hour"
            />
          </div>

          <div className={styles.pieSection}>
            <Chart
              data={categoryData}
              type="pie"
              title="Timeboxes by Category"
              dataKey="value"
              xAxisKey="name"
            />
          </div>
        </>
      )}
    </div>
  );
}

export default Analytics;
