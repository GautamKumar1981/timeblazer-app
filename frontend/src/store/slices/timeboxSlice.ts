import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '../../services/api';
import type { Timebox, TimeboxFilters, TimeboxStatus } from '../../types';

interface TimeboxState {
  timeboxes: Timebox[];
  selectedTimebox: Timebox | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: TimeboxState = {
  timeboxes: [],
  selectedTimebox: null,
  isLoading: false,
  error: null,
};

export const fetchTimeboxes = createAsyncThunk(
  'timebox/fetchAll',
  async (filters: TimeboxFilters | undefined, { rejectWithValue }) => {
    try {
      const { data } = await api.timeboxes.getAll(filters);
      return data;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const createTimebox = createAsyncThunk(
  'timebox/create',
  async (data: Partial<Timebox>, { rejectWithValue }) => {
    try {
      const { data: created } = await api.timeboxes.create(data);
      return created;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const updateTimebox = createAsyncThunk(
  'timebox/update',
  async ({ id, data }: { id: string; data: Partial<Timebox> }, { rejectWithValue }) => {
    try {
      const { data: updated } = await api.timeboxes.update(id, data);
      return updated;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const deleteTimebox = createAsyncThunk(
  'timebox/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await api.timeboxes.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const updateTimeboxStatus = createAsyncThunk(
  'timebox/updateStatus',
  async ({ id, status }: { id: string; status: TimeboxStatus }, { rejectWithValue }) => {
    try {
      const { data } = await api.timeboxes.updateStatus(id, status);
      return data;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const completeTimebox = createAsyncThunk(
  'timebox/complete',
  async ({ id, actualDuration }: { id: string; actualDuration: number }, { rejectWithValue }) => {
    try {
      const { data } = await api.timeboxes.complete(id, actualDuration);
      return data;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

const timeboxSlice = createSlice({
  name: 'timebox',
  initialState,
  reducers: {
    setSelectedTimebox: (state, action: PayloadAction<Timebox | null>) => {
      state.selectedTimebox = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch all
    builder
      .addCase(fetchTimeboxes.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTimeboxes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.timeboxes = action.payload;
      })
      .addCase(fetchTimeboxes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create
    builder
      .addCase(createTimebox.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createTimebox.fulfilled, (state, action) => {
        state.isLoading = false;
        state.timeboxes.push(action.payload);
      })
      .addCase(createTimebox.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update
    builder
      .addCase(updateTimebox.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateTimebox.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.timeboxes.findIndex((tb) => tb.id === action.payload.id);
        if (index !== -1) state.timeboxes[index] = action.payload;
        if (state.selectedTimebox?.id === action.payload.id) {
          state.selectedTimebox = action.payload;
        }
      })
      .addCase(updateTimebox.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Delete (optimistic)
    builder
      .addCase(deleteTimebox.pending, (state, action) => {
        state.timeboxes = state.timeboxes.filter((tb) => tb.id !== action.meta.arg);
        if (state.selectedTimebox?.id === action.meta.arg) {
          state.selectedTimebox = null;
        }
      })
      .addCase(deleteTimebox.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Update status
    builder
      .addCase(updateTimeboxStatus.fulfilled, (state, action) => {
        const index = state.timeboxes.findIndex((tb) => tb.id === action.payload.id);
        if (index !== -1) state.timeboxes[index] = action.payload;
        if (state.selectedTimebox?.id === action.payload.id) {
          state.selectedTimebox = action.payload;
        }
      })
      .addCase(updateTimeboxStatus.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Complete
    builder
      .addCase(completeTimebox.fulfilled, (state, action) => {
        const index = state.timeboxes.findIndex((tb) => tb.id === action.payload.id);
        if (index !== -1) state.timeboxes[index] = action.payload;
        if (state.selectedTimebox?.id === action.payload.id) {
          state.selectedTimebox = action.payload;
        }
      })
      .addCase(completeTimebox.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { setSelectedTimebox, clearError } = timeboxSlice.actions;
export default timeboxSlice.reducer;
