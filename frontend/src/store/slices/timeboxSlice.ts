import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { timeboxAPI } from '../../services/api';

export interface Timebox {
  _id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  category: string;
  description?: string;
  completed: boolean;
  userId: string;
}

interface TimeboxState {
  timeboxes: Timebox[];
  loading: boolean;
  error: string | null;
}

const initialState: TimeboxState = {
  timeboxes: [],
  loading: false,
  error: null,
};

export const fetchTimeboxes = createAsyncThunk(
  'timebox/fetchAll',
  async (params: { date?: string; startDate?: string; endDate?: string } | undefined, { rejectWithValue }) => {
    try {
      const response = await timeboxAPI.getAll(params);
      return response.data as Timebox[];
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch timeboxes');
    }
  }
);

export const createTimebox = createAsyncThunk(
  'timebox/create',
  async (data: Partial<Timebox>, { rejectWithValue }) => {
    try {
      const response = await timeboxAPI.create(data);
      return response.data as Timebox;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || 'Failed to create timebox');
    }
  }
);

export const updateTimebox = createAsyncThunk(
  'timebox/update',
  async ({ id, data }: { id: string; data: Partial<Timebox> }, { rejectWithValue }) => {
    try {
      const response = await timeboxAPI.update(id, data);
      return response.data as Timebox;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || 'Failed to update timebox');
    }
  }
);

export const deleteTimebox = createAsyncThunk(
  'timebox/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await timeboxAPI.delete(id);
      return id;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || 'Failed to delete timebox');
    }
  }
);

const timeboxSlice = createSlice({
  name: 'timebox',
  initialState,
  reducers: {
    clearError(state) { state.error = null; },
    upsertTimebox(state, action: PayloadAction<Timebox>) {
      const idx = state.timeboxes.findIndex((t) => t._id === action.payload._id);
      if (idx >= 0) state.timeboxes[idx] = action.payload;
      else state.timeboxes.unshift(action.payload);
    },
    removeTimebox(state, action: PayloadAction<string>) {
      state.timeboxes = state.timeboxes.filter((t) => t._id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTimeboxes.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchTimeboxes.fulfilled, (state, action: PayloadAction<Timebox[]>) => {
        state.loading = false;
        state.timeboxes = action.payload;
      })
      .addCase(fetchTimeboxes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createTimebox.fulfilled, (state, action: PayloadAction<Timebox>) => {
        state.timeboxes.unshift(action.payload);
      })
      .addCase(updateTimebox.fulfilled, (state, action: PayloadAction<Timebox>) => {
        const idx = state.timeboxes.findIndex((t) => t._id === action.payload._id);
        if (idx >= 0) state.timeboxes[idx] = action.payload;
      })
      .addCase(deleteTimebox.fulfilled, (state, action: PayloadAction<string>) => {
        state.timeboxes = state.timeboxes.filter((t) => t._id !== action.payload);
      });
  },
});

export const { clearError, upsertTimebox, removeTimebox } = timeboxSlice.actions;
export default timeboxSlice.reducer;
