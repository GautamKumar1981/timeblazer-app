import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { format } from 'date-fns';
import type { TimeboxState, Timebox } from '../../types';
import { timeboxApi } from '../../services/api';

const initialState: TimeboxState = {
  items: [],
  selectedDate: format(new Date(), 'yyyy-MM-dd'),
  isLoading: false,
  error: null,
  activeTimebox: null,
};

export const fetchTimeboxes = createAsyncThunk(
  'timeboxes/fetchAll',
  async (date: string, { rejectWithValue }) => {
    try {
      const { data } = await timeboxApi.getAll(date);
      return data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message ?? 'Failed to load timeboxes');
    }
  }
);

export const createTimebox = createAsyncThunk(
  'timeboxes/create',
  async (payload: Partial<Timebox>, { rejectWithValue }) => {
    try {
      const { data } = await timeboxApi.create(payload);
      return data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message ?? 'Failed to create timebox');
    }
  }
);

export const updateTimebox = createAsyncThunk(
  'timeboxes/update',
  async ({ id, ...payload }: Partial<Timebox> & { id: string }, { rejectWithValue }) => {
    try {
      const { data } = await timeboxApi.update(id, payload);
      return data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message ?? 'Failed to update timebox');
    }
  }
);

export const deleteTimebox = createAsyncThunk(
  'timeboxes/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await timeboxApi.delete(id);
      return id;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message ?? 'Failed to delete timebox');
    }
  }
);

export const completeTimebox = createAsyncThunk(
  'timeboxes/complete',
  async ({ id, notes }: { id: string; notes?: string }, { rejectWithValue }) => {
    try {
      const { data } = await timeboxApi.complete(id, notes);
      return data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message ?? 'Failed to complete timebox');
    }
  }
);

const timeboxSlice = createSlice({
  name: 'timeboxes',
  initialState,
  reducers: {
    setSelectedDate(state, action: PayloadAction<string>) {
      state.selectedDate = action.payload;
    },
    setActiveTimebox(state, action: PayloadAction<Timebox | null>) {
      state.activeTimebox = action.payload;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTimeboxes.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTimeboxes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
        const now = new Date();
        state.activeTimebox =
          action.payload.find((tb) => {
            const start = new Date(tb.startTime);
            const end = new Date(tb.endTime);
            return tb.status === 'active' || (now >= start && now <= end && tb.status === 'pending');
          }) ?? null;
      })
      .addCase(fetchTimeboxes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    builder.addCase(createTimebox.fulfilled, (state, action) => {
      state.items.push(action.payload);
      state.items.sort(
        (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      );
    });

    builder.addCase(updateTimebox.fulfilled, (state, action) => {
      const index = state.items.findIndex((tb) => tb.id === action.payload.id);
      if (index !== -1) state.items[index] = action.payload;
      if (state.activeTimebox?.id === action.payload.id) {
        state.activeTimebox = action.payload;
      }
    });

    builder.addCase(deleteTimebox.fulfilled, (state, action) => {
      state.items = state.items.filter((tb) => tb.id !== action.payload);
      if (state.activeTimebox?.id === action.payload) {
        state.activeTimebox = null;
      }
    });

    builder.addCase(completeTimebox.fulfilled, (state, action) => {
      const index = state.items.findIndex((tb) => tb.id === action.payload.id);
      if (index !== -1) state.items[index] = action.payload;
      if (state.activeTimebox?.id === action.payload.id) {
        state.activeTimebox = null;
      }
    });
  },
});

export const { setSelectedDate, setActiveTimebox, clearError } = timeboxSlice.actions;
export default timeboxSlice.reducer;
