import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { goalsAPI } from '../../services/api';

export interface Goal {
  _id: string;
  title: string;
  description?: string;
  deadline?: string;
  targetValue: number;
  currentValue: number;
  category: string;
  status: 'active' | 'completed' | 'paused';
  userId: string;
}

interface GoalsState {
  goals: Goal[];
  loading: boolean;
  error: string | null;
}

const initialState: GoalsState = {
  goals: [],
  loading: false,
  error: null,
};

export const fetchGoals = createAsyncThunk(
  'goals/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await goalsAPI.getAll();
      return response.data as Goal[];
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch goals');
    }
  }
);

export const createGoal = createAsyncThunk(
  'goals/create',
  async (data: Partial<Goal>, { rejectWithValue }) => {
    try {
      const response = await goalsAPI.create(data);
      return response.data as Goal;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || 'Failed to create goal');
    }
  }
);

export const updateGoal = createAsyncThunk(
  'goals/update',
  async ({ id, data }: { id: string; data: Partial<Goal> }, { rejectWithValue }) => {
    try {
      const response = await goalsAPI.update(id, data);
      return response.data as Goal;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || 'Failed to update goal');
    }
  }
);

export const deleteGoal = createAsyncThunk(
  'goals/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await goalsAPI.delete(id);
      return id;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || 'Failed to delete goal');
    }
  }
);

const goalsSlice = createSlice({
  name: 'goals',
  initialState,
  reducers: {
    clearError(state) { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGoals.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchGoals.fulfilled, (state, action: PayloadAction<Goal[]>) => {
        state.loading = false;
        state.goals = action.payload;
      })
      .addCase(fetchGoals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createGoal.fulfilled, (state, action: PayloadAction<Goal>) => {
        state.goals.unshift(action.payload);
      })
      .addCase(updateGoal.fulfilled, (state, action: PayloadAction<Goal>) => {
        const idx = state.goals.findIndex((g) => g._id === action.payload._id);
        if (idx >= 0) state.goals[idx] = action.payload;
      })
      .addCase(deleteGoal.fulfilled, (state, action: PayloadAction<string>) => {
        state.goals = state.goals.filter((g) => g._id !== action.payload);
      });
  },
});

export const { clearError } = goalsSlice.actions;
export default goalsSlice.reducer;
