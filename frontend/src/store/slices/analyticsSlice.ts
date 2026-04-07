import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { analyticsAPI, reviewsAPI } from '../../services/api';
import { DailyStat } from '../../components/Analytics/Chart';

interface CategoryBreakdown {
  category: string;
  minutes: number;
}

export interface AnalyticsData {
  totalTimeboxes: number;
  completedTimeboxes: number;
  totalFocusMinutes: number;
  averageProductivityScore: number;
  dailyStats: DailyStat[];
  categoryBreakdown: CategoryBreakdown[];
}

export interface WeeklyReview {
  weekStartDate: string;
  accomplishments: string;
  challenges: string;
  nextWeekGoals: string;
  productivityRating: number;
}

interface AnalyticsState {
  data: AnalyticsData | null;
  reviews: WeeklyReview[];
  loading: boolean;
  error: string | null;
}

const initialState: AnalyticsState = {
  data: null,
  reviews: [],
  loading: false,
  error: null,
};

export const fetchAnalytics = createAsyncThunk(
  'analytics/fetch',
  async (period: 'weekly' | 'monthly', { rejectWithValue }) => {
    try {
      const response = await analyticsAPI.getSummary(period);
      return response.data as AnalyticsData;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch analytics');
    }
  }
);

export const fetchReviews = createAsyncThunk(
  'analytics/fetchReviews',
  async (_, { rejectWithValue }) => {
    try {
      const response = await reviewsAPI.getAll();
      return response.data as WeeklyReview[];
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch reviews');
    }
  }
);

export const submitReview = createAsyncThunk(
  'analytics/submitReview',
  async (data: Partial<WeeklyReview>, { rejectWithValue }) => {
    try {
      const response = await reviewsAPI.create(data);
      return response.data as WeeklyReview;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || 'Failed to submit review');
    }
  }
);

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    clearError(state) { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAnalytics.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchAnalytics.fulfilled, (state, action: PayloadAction<AnalyticsData>) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchReviews.pending, (state) => { state.loading = true; })
      .addCase(fetchReviews.fulfilled, (state, action: PayloadAction<WeeklyReview[]>) => {
        state.loading = false;
        state.reviews = action.payload;
      })
      .addCase(fetchReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(submitReview.fulfilled, (state, action: PayloadAction<WeeklyReview>) => {
        state.reviews.unshift(action.payload);
      });
  },
});

export const { clearError } = analyticsSlice.actions;
export default analyticsSlice.reducer;
