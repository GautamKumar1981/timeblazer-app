import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { subscriptionAPI } from '../../services/api';

export interface SubscriptionState {
  trial_start: string | null;
  trial_end: string | null;
  trial_days_remaining: number;
  is_trial_active: boolean;
  subscribed_until: string | null;
  is_subscribed: boolean;
  has_premium_access: boolean;
  is_cancelled: boolean;
  price_gbp: number;
}

interface SliceState {
  data: SubscriptionState | null;
  loading: boolean;
  error: string | null;
}

const initialState: SliceState = { data: null, loading: false, error: null };

export const fetchSubscriptionStatus = createAsyncThunk(
  'subscription/fetchStatus',
  async (_, { rejectWithValue }) => {
    try {
      return (await subscriptionAPI.getStatus()).data.subscription as SubscriptionState;
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: string } } };
      return rejectWithValue(err.response?.data?.error || 'Failed to fetch subscription');
    }
  }
);

const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState,
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchSubscriptionStatus.pending, (state) => { state.loading = true; })
     .addCase(fetchSubscriptionStatus.fulfilled, (state, a: PayloadAction<SubscriptionState>) => {
       state.loading = false; state.data = a.payload;
     })
     .addCase(fetchSubscriptionStatus.rejected, (state, a) => {
       state.loading = false; state.error = a.payload as string;
     });
  },
});

export default subscriptionSlice.reducer;
