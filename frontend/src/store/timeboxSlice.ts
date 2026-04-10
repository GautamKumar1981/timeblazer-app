import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { TimeboxState, Timebox } from '../types';
import api from '../services/api';

export const fetchTimeboxes = createAsyncThunk(
  'timeboxes/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<Timebox[]>('/timeboxes');
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        return rejectWithValue(axiosError.response?.data?.message || 'Failed to fetch timeboxes');
      }
      return rejectWithValue('Failed to fetch timeboxes');
    }
  }
);

export const createTimebox = createAsyncThunk(
  'timeboxes/create',
  async (data: Omit<Timebox, 'id' | 'user_id' | 'created_at' | 'updated_at'>, { rejectWithValue }) => {
    try {
      const response = await api.post<Timebox>('/timeboxes', data);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        return rejectWithValue(axiosError.response?.data?.message || 'Failed to create timebox');
      }
      return rejectWithValue('Failed to create timebox');
    }
  }
);

export const updateTimebox = createAsyncThunk(
  'timeboxes/update',
  async ({ id, data }: { id: number; data: Partial<Timebox> }, { rejectWithValue }) => {
    try {
      const response = await api.put<Timebox>(`/timeboxes/${id}`, data);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        return rejectWithValue(axiosError.response?.data?.message || 'Failed to update timebox');
      }
      return rejectWithValue('Failed to update timebox');
    }
  }
);

export const deleteTimebox = createAsyncThunk(
  'timeboxes/delete',
  async (id: number, { rejectWithValue }) => {
    try {
      await api.delete(`/timeboxes/${id}`);
      return id;
    } catch (error: unknown) {
      if (error instanceof Error && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        return rejectWithValue(axiosError.response?.data?.message || 'Failed to delete timebox');
      }
      return rejectWithValue('Failed to delete timebox');
    }
  }
);

const initialState: TimeboxState = {
  timeboxes: [],
  isLoading: false,
  error: null,
};

const timeboxSlice = createSlice({
  name: 'timeboxes',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
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
      })
      .addCase(createTimebox.fulfilled, (state, action) => {
        state.timeboxes.push(action.payload);
      })
      .addCase(updateTimebox.fulfilled, (state, action) => {
        const index = state.timeboxes.findIndex((t) => t.id === action.payload.id);
        if (index !== -1) {
          state.timeboxes[index] = action.payload;
        }
      })
      .addCase(deleteTimebox.fulfilled, (state, action) => {
        state.timeboxes = state.timeboxes.filter((t) => t.id !== action.payload);
      });
  },
});

export default timeboxSlice.reducer;
