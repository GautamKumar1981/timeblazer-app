import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { format } from 'date-fns';
import type { GoalsState, Goal, DailyPriority } from '../../types';
import { goalsApi, prioritiesApi } from '../../services/api';

const initialState: GoalsState = {
  items: [],
  priorities: [],
  isLoading: false,
  error: null,
};

export const fetchGoals = createAsyncThunk('goals/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const { data } = await goalsApi.getAll();
    return data;
  } catch (err: unknown) {
    const error = err as { response?: { data?: { message?: string } } };
    return rejectWithValue(error.response?.data?.message ?? 'Failed to load goals');
  }
});

export const createGoal = createAsyncThunk(
  'goals/create',
  async (payload: Partial<Goal>, { rejectWithValue }) => {
    try {
      const { data } = await goalsApi.create(payload);
      return data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message ?? 'Failed to create goal');
    }
  }
);

export const updateGoal = createAsyncThunk(
  'goals/update',
  async ({ id, ...payload }: Partial<Goal> & { id: string }, { rejectWithValue }) => {
    try {
      const { data } = await goalsApi.update(id, payload);
      return data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message ?? 'Failed to update goal');
    }
  }
);

export const deleteGoal = createAsyncThunk(
  'goals/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await goalsApi.delete(id);
      return id;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message ?? 'Failed to delete goal');
    }
  }
);

export const fetchPriorities = createAsyncThunk(
  'goals/fetchPriorities',
  async (date: string, { rejectWithValue }) => {
    try {
      const { data } = await prioritiesApi.getByDate(date);
      return data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message ?? 'Failed to load priorities');
    }
  }
);

export const createPriority = createAsyncThunk(
  'goals/createPriority',
  async (payload: Partial<DailyPriority>, { rejectWithValue }) => {
    try {
      const { data } = await prioritiesApi.create(payload);
      return data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message ?? 'Failed to create priority');
    }
  }
);

export const togglePriority = createAsyncThunk(
  'goals/togglePriority',
  async (id: string, { rejectWithValue }) => {
    try {
      const { data } = await prioritiesApi.toggle(id);
      return data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message ?? 'Failed to toggle priority');
    }
  }
);

const goalsSlice = createSlice({
  name: 'goals',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
    optimisticTogglePriority(state, action: PayloadAction<string>) {
      const item = state.priorities.find((p) => p.id === action.payload);
      if (item) item.isCompleted = !item.isCompleted;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGoals.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchGoals.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchGoals.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    builder.addCase(createGoal.fulfilled, (state, action) => {
      state.items.push(action.payload);
    });

    builder.addCase(updateGoal.fulfilled, (state, action) => {
      const index = state.items.findIndex((g) => g.id === action.payload.id);
      if (index !== -1) state.items[index] = action.payload;
    });

    builder.addCase(deleteGoal.fulfilled, (state, action) => {
      state.items = state.items.filter((g) => g.id !== action.payload);
    });

    builder.addCase(fetchPriorities.fulfilled, (state, action) => {
      state.priorities = action.payload;
    });

    builder.addCase(createPriority.fulfilled, (state, action) => {
      state.priorities.push(action.payload);
    });

    builder.addCase(togglePriority.fulfilled, (state, action) => {
      const index = state.priorities.findIndex((p) => p.id === action.payload.id);
      if (index !== -1) state.priorities[index] = action.payload;
    });
  },
});

export const { clearError, optimisticTogglePriority } = goalsSlice.actions;
export default goalsSlice.reducer;
