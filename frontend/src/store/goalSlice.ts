import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { GoalState, Goal } from '../types';
import api from '../services/api';

export const fetchGoals = createAsyncThunk(
  'goals/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<Goal[]>('/goals');
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        return rejectWithValue(axiosError.response?.data?.message || 'Failed to fetch goals');
      }
      return rejectWithValue('Failed to fetch goals');
    }
  }
);

export const createGoal = createAsyncThunk(
  'goals/create',
  async (data: Omit<Goal, 'id' | 'user_id' | 'created_at' | 'updated_at'>, { rejectWithValue }) => {
    try {
      const response = await api.post<Goal>('/goals', data);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        return rejectWithValue(axiosError.response?.data?.message || 'Failed to create goal');
      }
      return rejectWithValue('Failed to create goal');
    }
  }
);

export const updateGoal = createAsyncThunk(
  'goals/update',
  async ({ id, data }: { id: number; data: Partial<Goal> }, { rejectWithValue }) => {
    try {
      const response = await api.put<Goal>(`/goals/${id}`, data);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        return rejectWithValue(axiosError.response?.data?.message || 'Failed to update goal');
      }
      return rejectWithValue('Failed to update goal');
    }
  }
);

export const deleteGoal = createAsyncThunk(
  'goals/delete',
  async (id: number, { rejectWithValue }) => {
    try {
      await api.delete(`/goals/${id}`);
      return id;
    } catch (error: unknown) {
      if (error instanceof Error && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        return rejectWithValue(axiosError.response?.data?.message || 'Failed to delete goal');
      }
      return rejectWithValue('Failed to delete goal');
    }
  }
);

const initialState: GoalState = {
  goals: [],
  isLoading: false,
  error: null,
};

const goalSlice = createSlice({
  name: 'goals',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
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
      })
      .addCase(createGoal.fulfilled, (state, action) => {
        state.goals.push(action.payload);
      })
      .addCase(updateGoal.fulfilled, (state, action) => {
        const index = state.goals.findIndex((g) => g.id === action.payload.id);
        if (index !== -1) {
          state.goals[index] = action.payload;
        }
      })
      .addCase(deleteGoal.fulfilled, (state, action) => {
        state.goals = state.goals.filter((g) => g.id !== action.payload);
      });
  },
});

export default goalSlice.reducer;
