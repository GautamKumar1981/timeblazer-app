import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../services/api';
import type { AnalyticsData, PatternData } from '../../types';

interface AnalyticsState {
  weeklyData: AnalyticsData | null;
  monthlyData: AnalyticsData | null;
  patterns: PatternData | null;
  streaks: { streakDays: number; longestStreak: number } | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AnalyticsState = {
  weeklyData: null,
  monthlyData: null,
  patterns: null,
  streaks: null,
  isLoading: false,
  error: null,
};

export const fetchWeeklyAnalytics = createAsyncThunk(
  'analytics/fetchWeekly',
  async (weekStart: string, { rejectWithValue }) => {
    try {
      const { data } = await api.analytics.getWeek(weekStart);
      return data;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const fetchMonthlyAnalytics = createAsyncThunk(
  'analytics/fetchMonthly',
  async ({ month, year }: { month: number; year: number }, { rejectWithValue }) => {
    try {
      const { data } = await api.analytics.getMonth(month, year);
      return data;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const fetchPatterns = createAsyncThunk(
  'analytics/fetchPatterns',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.analytics.getPatterns();
      return data;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const fetchStreaks = createAsyncThunk(
  'analytics/fetchStreaks',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.analytics.getStreaks();
      return data;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Weekly analytics
    builder
      .addCase(fetchWeeklyAnalytics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchWeeklyAnalytics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.weeklyData = action.payload;
      })
      .addCase(fetchWeeklyAnalytics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Monthly analytics
    builder
      .addCase(fetchMonthlyAnalytics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMonthlyAnalytics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.monthlyData = action.payload;
      })
      .addCase(fetchMonthlyAnalytics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Patterns
    builder
      .addCase(fetchPatterns.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPatterns.fulfilled, (state, action) => {
        state.isLoading = false;
        state.patterns = action.payload;
      })
      .addCase(fetchPatterns.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Streaks
    builder
      .addCase(fetchStreaks.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchStreaks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.streaks = action.payload;
      })
      .addCase(fetchStreaks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = analyticsSlice.actions;
export default analyticsSlice.reducer;
