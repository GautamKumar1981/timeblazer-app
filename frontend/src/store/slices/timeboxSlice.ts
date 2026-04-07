import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Timebox {
  id: string;
  user_id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  category: string;
  color: string;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  actual_duration: number | null;
}

interface TimeboxState {
  timeboxes: Timebox[];
  currentTimebox: Timebox | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: TimeboxState = {
  timeboxes: [],
  currentTimebox: null,
  isLoading: false,
  error: null,
};

const timeboxSlice = createSlice({
  name: 'timebox',
  initialState,
  reducers: {
    setTimeboxes(state, action: PayloadAction<Timebox[]>) {
      state.timeboxes = action.payload;
    },
    addTimebox(state, action: PayloadAction<Timebox>) {
      state.timeboxes.push(action.payload);
    },
    updateTimebox(state, action: PayloadAction<Timebox>) {
      const index = state.timeboxes.findIndex(t => t.id === action.payload.id);
      if (index !== -1) {
        state.timeboxes[index] = action.payload;
      }
    },
    removeTimebox(state, action: PayloadAction<string>) {
      state.timeboxes = state.timeboxes.filter(t => t.id !== action.payload);
    },
    setCurrentTimebox(state, action: PayloadAction<Timebox | null>) {
      state.currentTimebox = action.payload;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
  },
});

export const {
  setTimeboxes,
  addTimebox,
  updateTimebox,
  removeTimebox,
  setCurrentTimebox,
  setLoading,
  setError,
} = timeboxSlice.actions;

export default timeboxSlice.reducer;
