import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { timeboxApi } from '../services/api';
import type { Timebox } from '../types';

interface TimeboxesState {
  items: Timebox[];
  todayItems: Timebox[];
  priorities: Timebox[];
  isLoading: boolean;
  error: string | null;
}

const initialState: TimeboxesState = {
  items: [],
  todayItems: [],
  priorities: [],
  isLoading: false,
  error: null,
};

export const fetchTimeboxes = createAsyncThunk(
  'timeboxes/fetchAll',
  async (date: string | undefined, { rejectWithValue }) => {
    try {
      return await timeboxApi.getAll(date);
    } catch {
      return rejectWithValue('Failed to fetch timeboxes');
    }
  }
);

export const fetchTodayTimeboxes = createAsyncThunk(
  'timeboxes/fetchToday',
  async (_, { rejectWithValue }) => {
    try {
      return await timeboxApi.getToday();
    } catch {
      return rejectWithValue('Failed to fetch today timeboxes');
    }
  }
);

export const fetchPriorities = createAsyncThunk(
  'timeboxes/fetchPriorities',
  async (_, { rejectWithValue }) => {
    try {
      return await timeboxApi.getPriorities();
    } catch {
      return rejectWithValue('Failed to fetch priorities');
    }
  }
);

export const completeTimebox = createAsyncThunk(
  'timeboxes/complete',
  async (id: number, { rejectWithValue }) => {
    try {
      return await timeboxApi.complete(id);
    } catch {
      return rejectWithValue('Failed to complete timebox');
    }
  }
);

export const deleteTimebox = createAsyncThunk(
  'timeboxes/delete',
  async (id: number, { rejectWithValue }) => {
    try {
      await timeboxApi.delete(id);
      return id;
    } catch {
      return rejectWithValue('Failed to delete timebox');
    }
  }
);

const timeboxesSlice = createSlice({
  name: 'timeboxes',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
    updateTimebox(state, action: PayloadAction<Timebox>) {
      const idx = state.items.findIndex((t: Timebox) => t.id === action.payload.id);
      if (idx !== -1) state.items[idx] = action.payload;
      const todayIdx = state.todayItems.findIndex((t: Timebox) => t.id === action.payload.id);
      if (todayIdx !== -1) state.todayItems[todayIdx] = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTimeboxes.pending, (state) => { state.isLoading = true; })
      .addCase(fetchTimeboxes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchTimeboxes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(fetchTodayTimeboxes.fulfilled, (state, action) => {
        state.todayItems = action.payload;
      });

    builder
      .addCase(fetchPriorities.fulfilled, (state, action) => {
        state.priorities = action.payload;
      });

    builder
      .addCase(completeTimebox.fulfilled, (state, action) => {
        const idx = state.items.findIndex((t: Timebox) => t.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
        const todayIdx = state.todayItems.findIndex((t: Timebox) => t.id === action.payload.id);
        if (todayIdx !== -1) state.todayItems[todayIdx] = action.payload;
      });

    builder
      .addCase(deleteTimebox.fulfilled, (state, action) => {
        state.items = state.items.filter((t: Timebox) => t.id !== action.payload);
        state.todayItems = state.todayItems.filter((t: Timebox) => t.id !== action.payload);
      });
  },
});

export const { clearError, updateTimebox } = timeboxesSlice.actions;
export default timeboxesSlice.reducer;
