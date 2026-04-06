import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import timeboxReducer from './slices/timeboxSlice';
import goalsReducer from './slices/goalsSlice';
import analyticsReducer from './slices/analyticsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    timebox: timeboxReducer,
    goals: goalsReducer,
    analytics: analyticsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
