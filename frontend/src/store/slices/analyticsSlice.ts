import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AnalyticsState {
  weeklyData: any[];
  monthlyData: any[];
  patterns: any | null;
  streaks: any | null;
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
    setWeeklyData(state, action: PayloadAction<any[]>) {
      state.weeklyData = action.payload;
    },
    setMonthlyData(state, action: PayloadAction<any[]>) {
      state.monthlyData = action.payload;
    },
    setPatterns(state, action: PayloadAction<any>) {
      state.patterns = action.payload;
    },
    setStreaks(state, action: PayloadAction<any>) {
      state.streaks = action.payload;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
  },
});

export const { setWeeklyData, setMonthlyData, setPatterns, setStreaks, setLoading } = analyticsSlice.actions;
export default analyticsSlice.reducer;
