import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '../../services/api';
import type { Goal } from '../../types';

interface GoalsState {
  goals: Goal[];
  selectedGoal: Goal | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: GoalsState = {
  goals: [],
  selectedGoal: null,
  isLoading: false,
  error: null,
};

export const fetchGoals = createAsyncThunk('goals/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.goals.getAll();
    return data;
  } catch (error) {
    return rejectWithValue((error as Error).message);
  }
});

export const createGoal = createAsyncThunk(
  'goals/create',
  async (data: Partial<Goal>, { rejectWithValue }) => {
    try {
      const { data: created } = await api.goals.create(data);
      return created;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const updateGoal = createAsyncThunk(
  'goals/update',
  async ({ id, data }: { id: string; data: Partial<Goal> }, { rejectWithValue }) => {
    try {
      const { data: updated } = await api.goals.update(id, data);
      return updated;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const deleteGoal = createAsyncThunk(
  'goals/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await api.goals.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

const goalsSlice = createSlice({
  name: 'goals',
  initialState,
  reducers: {
    setSelectedGoal: (state, action: PayloadAction<Goal | null>) => {
      state.selectedGoal = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch all
    builder
      .addCase(fetchGoals.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchGoals.fulfilled, (state, action) => {
        state.isLoading = false;
        state.goals = action.payload;
      })
      .addCase(fetchGoals.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create
    builder
      .addCase(createGoal.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createGoal.fulfilled, (state, action) => {
        state.isLoading = false;
        state.goals.push(action.payload);
      })
      .addCase(createGoal.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update
    builder
      .addCase(updateGoal.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateGoal.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.goals.findIndex((g) => g.id === action.payload.id);
        if (index !== -1) state.goals[index] = action.payload;
        if (state.selectedGoal?.id === action.payload.id) {
          state.selectedGoal = action.payload;
        }
      })
      .addCase(updateGoal.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Delete
    builder
      .addCase(deleteGoal.pending, (state, action) => {
        state.goals = state.goals.filter((g) => g.id !== action.meta.arg);
        if (state.selectedGoal?.id === action.meta.arg) {
          state.selectedGoal = null;
        }
      })
      .addCase(deleteGoal.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { setSelectedGoal, clearError } = goalsSlice.actions;
export default goalsSlice.reducer;
