import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import timeboxReducer from './slices/timeboxSlice';
import goalsReducer from './slices/goalsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    timeboxes: timeboxReducer,
    goals: goalsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['auth/restore/fulfilled'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
