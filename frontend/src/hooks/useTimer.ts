import { useState, useEffect, useCallback } from 'react';

interface UseTimerResult {
  timeRemaining: number;
  isRunning: boolean;
  percentage: number;
  formattedTime: string;
}

function formatTime(seconds: number): string {
  const absSeconds = Math.max(0, seconds);
  const h = Math.floor(absSeconds / 3600);
  const m = Math.floor((absSeconds % 3600) / 60);
  const s = absSeconds % 60;
  return [h, m, s].map((v) => String(v).padStart(2, '0')).join(':');
}

export function useTimer(startTime: string, endTime: string): UseTimerResult {
  const calculateState = useCallback(() => {
    const now = Date.now();
    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();
    const totalDuration = end - start;
    const elapsed = now - start;
    const remaining = Math.max(0, Math.floor((end - now) / 1000));
    const percentage =
      totalDuration > 0 ? Math.min(100, Math.max(0, (elapsed / totalDuration) * 100)) : 0;
    const isRunning = now >= start && now < end;

    return { timeRemaining: remaining, isRunning, percentage };
  }, [startTime, endTime]);

  const [state, setState] = useState(calculateState);

  useEffect(() => {
    const tick = () => setState(calculateState());
    tick();

    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [calculateState]);

  return {
    ...state,
    formattedTime: formatTime(state.timeRemaining),
  };
}
