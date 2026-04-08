import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { goalApi } from '../services/api';
import type { Goal } from '../types';

interface GoalsState {
  items: Goal[];
  isLoading: boolean;
  error: string | null;
}

const initialState: GoalsState = {
  items: [],
  isLoading: false,
  error: null,
};

export const fetchGoals = createAsyncThunk('goals/fetchAll', async (_, { rejectWithValue }) => {
  try {
    return await goalApi.getAll();
  } catch {
    return rejectWithValue('Failed to fetch goals');
  }
});

export const deleteGoal = createAsyncThunk('goals/delete', async (id: number, { rejectWithValue }) => {
  try {
    await goalApi.delete(id);
    return id;
  } catch {
    return rejectWithValue('Failed to delete goal');
  }
});

const goalsSlice = createSlice({
  name: 'goals',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
    updateGoal(state, action: PayloadAction<Goal>) {
      const idx = state.items.findIndex((g: Goal) => g.id === action.payload.id);
      if (idx !== -1) state.items[idx] = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGoals.pending, (state) => { state.isLoading = true; })
      .addCase(fetchGoals.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchGoals.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(deleteGoal.fulfilled, (state, action) => {
        state.items = state.items.filter((g: Goal) => g.id !== action.payload);
      });
  },
});

export const { clearError, updateGoal } = goalsSlice.actions;
export default goalsSlice.reducer;
