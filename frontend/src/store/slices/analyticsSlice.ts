import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface DailyData {
  day: string;
  completion_rate: number;
  total: number;
  completed: number;
}

export interface HourlyPatterns {
  hourly?: Record<string, number>;
  by_category?: Record<string, number>;
}

export interface Streaks {
  current: number;
  best: number;
  weekly_completion_rate: number;
  monthly_completion_rate: number;
}

interface AnalyticsState {
  weeklyData: DailyData[];
  monthlyData: DailyData[];
  patterns: HourlyPatterns | null;
  streaks: Streaks | null;
  isLoading: boolean;
}

const initialState: AnalyticsState = {
  weeklyData: [],
  monthlyData: [],
  patterns: null,
  streaks: null,
  isLoading: false,
};

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    setWeeklyData(state, action: PayloadAction<DailyData[]>) {
      state.weeklyData = action.payload;
    },
    setMonthlyData(state, action: PayloadAction<DailyData[]>) {
      state.monthlyData = action.payload;
    },
    setPatterns(state, action: PayloadAction<HourlyPatterns>) {
      state.patterns = action.payload;
    },
    setStreaks(state, action: PayloadAction<Streaks>) {
      state.streaks = action.payload;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
  },
});

export const { setWeeklyData, setMonthlyData, setPatterns, setStreaks, setLoading } = analyticsSlice.actions;
export default analyticsSlice.reducer;
