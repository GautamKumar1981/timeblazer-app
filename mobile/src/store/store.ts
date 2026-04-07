import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';

// ─── Interfaces ────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Timebox {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  date: string;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  category?: string;
  color?: string;
  goalId?: string;
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
  targetDate: string;
  priority: 'high' | 'medium' | 'low';
  progress: number;
  isCompleted: boolean;
  createdAt: string;
}

// ─── Auth Slice ────────────────────────────────────────────────────────────────

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

const initialAuthState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState: initialAuthState,
  reducers: {
    setCredentials(state, action: PayloadAction<{ user: User; token: string }>) {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
    },
    logout(state) {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    },
  },
});

// ─── Timeboxes Slice ───────────────────────────────────────────────────────────

interface TimeboxesState {
  items: Timebox[];
  currentTimebox: Timebox | null;
}

const initialTimeboxesState: TimeboxesState = {
  items: [],
  currentTimebox: null,
};

const timeboxesSlice = createSlice({
  name: 'timeboxes',
  initialState: initialTimeboxesState,
  reducers: {
    setTimeboxes(state, action: PayloadAction<Timebox[]>) {
      state.items = action.payload;
    },
    setCurrentTimebox(state, action: PayloadAction<Timebox | null>) {
      state.currentTimebox = action.payload;
    },
    addTimebox(state, action: PayloadAction<Timebox>) {
      state.items.push(action.payload);
    },
    updateTimebox(state, action: PayloadAction<Timebox>) {
      const idx = state.items.findIndex((t) => t.id === action.payload.id);
      if (idx !== -1) {
        state.items[idx] = action.payload;
      }
      if (state.currentTimebox?.id === action.payload.id) {
        state.currentTimebox = action.payload;
      }
    },
  },
});

// ─── Goals Slice ───────────────────────────────────────────────────────────────

interface GoalsState {
  items: Goal[];
  isLoading: boolean;
}

const initialGoalsState: GoalsState = {
  items: [],
  isLoading: false,
};

const goalsSlice = createSlice({
  name: 'goals',
  initialState: initialGoalsState,
  reducers: {
    setGoals(state, action: PayloadAction<Goal[]>) {
      state.items = action.payload;
      state.isLoading = false;
    },
    addGoal(state, action: PayloadAction<Goal>) {
      state.items.push(action.payload);
    },
    updateGoal(state, action: PayloadAction<Goal>) {
      const idx = state.items.findIndex((g) => g.id === action.payload.id);
      if (idx !== -1) {
        state.items[idx] = action.payload;
      }
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
  },
});

// ─── Store ─────────────────────────────────────────────────────────────────────

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    timeboxes: timeboxesSlice.reducer,
    goals: goalsSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const { setCredentials, logout } = authSlice.actions;
export const { setTimeboxes, setCurrentTimebox, addTimebox, updateTimebox } =
  timeboxesSlice.actions;
export const { setGoals, addGoal, updateGoal, setLoading } = goalsSlice.actions;
