import React, { useEffect, useState } from 'react';
import { format, startOfWeek, addWeeks, subWeeks } from 'date-fns';
import { api } from '../services/api';
import styles from './WeeklyReview.module.css';

interface ReviewData {
  id?: string;
  week_start: string;
  completion_rate: number;
  total_timeboxes: number;
  completed: number;
  skipped: number;
  wins: string[];
  improvements: string[];
  insights: string;
}

function WeeklyReview() {
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [review, setReview] = useState<ReviewData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [wins, setWins] = useState<string[]>(['']);
  const [improvements, setImprovements] = useState<string[]>(['']);
  const [insights, setInsights] = useState('');

  useEffect(() => {
    const fetchReview = async () => {
      setIsLoading(true);
      try {
        const weekStr = format(weekStart, 'yyyy-MM-dd');
        const res = await api.reviews.getWeeklyReview(weekStr);
        const data: ReviewData = res.data;
        setReview(data);
        setWins(data.wins?.length ? data.wins : ['']);
        setImprovements(data.improvements?.length ? data.improvements : ['']);
        setInsights(data.insights ?? '');
      } catch {
        setReview(null);
        setWins(['']);
        setImprovements(['']);
        setInsights('');
      } finally {
        setIsLoading(false);
      }
    };
    fetchReview();
  }, [weekStart]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setMessage(null);
    try {
      const res = await api.reviews.generateWeeklyReview();
      const data: ReviewData = res.data;
      setReview(data);
      setWins(data.wins?.length ? data.wins : ['']);
      setImprovements(data.improvements?.length ? data.improvements : ['']);
      setInsights(data.insights ?? '');
      setMessage({ type: 'success', text: 'Review generated!' });
    } catch {
      setMessage({ type: 'error', text: 'Failed to generate review.' });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!review?.id) return;
    setIsSaving(true);
    setMessage(null);
    try {
      await api.reviews.updateWeeklyReview(review.id, {
        wins: wins.filter(Boolean),
        improvements: improvements.filter(Boolean),
        insights,
      });
      setMessage({ type: 'success', text: 'Review saved!' });
    } catch {
      setMessage({ type: 'error', text: 'Failed to save review.' });
    } finally {
      setIsSaving(false);
    }
  };

  const updateListItem = (
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>,
    index: number,
    value: string
  ) => {
    const updated = [...list];
    updated[index] = value;
    setList(updated);
  };

  const addListItem = (list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>) => {
    setList([...list, '']);
  };

  const removeListItem = (list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>, index: number) => {
    setList(list.filter((_, i) => i !== index));
  };

  const weekEnd = addWeeks(weekStart, 1);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>📋 Weekly Review</h1>
        <div className={styles.weekNav}>
          <button className={styles.navBtn} onClick={() => setWeekStart(subWeeks(weekStart, 1))}>‹</button>
          <span className={styles.weekLabel}>
            {format(weekStart, 'MMM d')} – {format(weekEnd, 'MMM d, yyyy')}
          </span>
          <button className={styles.navBtn} onClick={() => setWeekStart(addWeeks(weekStart, 1))}>›</button>
        </div>
      </div>

      {message && (
        <div className={message.type === 'success' ? 'success-message' : 'error-message'}>
          {message.text}
        </div>
      )}

      {isLoading ? (
        <div className="loading-spinner">Loading...</div>
      ) : (
        <>
          {review && (
            <div className={styles.statsRow}>
              <div className="card">
                <div className={styles.statVal}>{review.completion_rate ?? 0}%</div>
                <div className={styles.statLbl}>Completion Rate</div>
              </div>
              <div className="card">
                <div className={styles.statVal}>{review.total_timeboxes ?? 0}</div>
                <div className={styles.statLbl}>Total Timeboxes</div>
              </div>
              <div className="card">
                <div className={styles.statVal}>{review.completed ?? 0}</div>
                <div className={styles.statLbl}>Completed</div>
              </div>
              <div className="card">
                <div className={styles.statVal}>{review.skipped ?? 0}</div>
                <div className={styles.statLbl}>Skipped</div>
              </div>
            </div>
          )}

          <div className={styles.reviewBody}>
            <div className={styles.listSection}>
              <h3 className={styles.listTitle}>🏆 Wins</h3>
              {wins.map((w, i) => (
                <div key={i} className={styles.listRow}>
                  <input
                    type="text"
                    value={w}
                    placeholder={`Win #${i + 1}`}
                    onChange={(e) => updateListItem(wins, setWins, i, e.target.value)}
                    className={styles.listInput}
                  />
                  <button className={styles.removeBtn} onClick={() => removeListItem(wins, setWins, i)}>✕</button>
                </div>
              ))}
              <button className={styles.addBtn} onClick={() => addListItem(wins, setWins)}>+ Add Win</button>
            </div>

            <div className={styles.listSection}>
              <h3 className={styles.listTitle}>🔧 Improvements</h3>
              {improvements.map((imp, i) => (
                <div key={i} className={styles.listRow}>
                  <input
                    type="text"
                    value={imp}
                    placeholder={`Improvement #${i + 1}`}
                    onChange={(e) => updateListItem(improvements, setImprovements, i, e.target.value)}
                    className={styles.listInput}
                  />
                  <button className={styles.removeBtn} onClick={() => removeListItem(improvements, setImprovements, i)}>✕</button>
                </div>
              ))}
              <button className={styles.addBtn} onClick={() => addListItem(improvements, setImprovements)}>+ Add Improvement</button>
            </div>

            <div className={styles.insightsSection}>
              <h3 className={styles.listTitle}>💡 Insights</h3>
              <textarea
                value={insights}
                onChange={(e) => setInsights(e.target.value)}
                rows={5}
                placeholder="Reflect on your week..."
                className={styles.insightsArea}
              />
            </div>
          </div>

          <div className={styles.actions}>
            <button className="btn btn-outline" onClick={handleGenerate} disabled={isGenerating}>
              {isGenerating ? 'Generating...' : '✨ Generate Review'}
            </button>
            <button className="btn btn-primary" onClick={handleSave} disabled={isSaving || !review?.id}>
              {isSaving ? 'Saving...' : '💾 Save Review'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default WeeklyReview;
