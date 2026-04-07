import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Milestone {
  id: string;
  title: string;
  completed: boolean;
}

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  description: string;
  target_date: string;
  priority: 'low' | 'medium' | 'high';
  status: 'active' | 'completed' | 'paused';
  progress: number;
  milestones: Milestone[];
}

interface GoalsState {
  goals: Goal[];
  isLoading: boolean;
  error: string | null;
}

const initialState: GoalsState = {
  goals: [],
  isLoading: false,
  error: null,
};

const goalsSlice = createSlice({
  name: 'goals',
  initialState,
  reducers: {
    setGoals(state, action: PayloadAction<Goal[]>) {
      state.goals = action.payload;
    },
    addGoal(state, action: PayloadAction<Goal>) {
      state.goals.push(action.payload);
    },
    updateGoal(state, action: PayloadAction<Goal>) {
      const index = state.goals.findIndex(g => g.id === action.payload.id);
      if (index !== -1) {
        state.goals[index] = action.payload;
      }
    },
    removeGoal(state, action: PayloadAction<string>) {
      state.goals = state.goals.filter(g => g.id !== action.payload);
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
  },
});

export const { setGoals, addGoal, updateGoal, removeGoal, setLoading, setError } = goalsSlice.actions;
export default goalsSlice.reducer;
