import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import timeboxesReducer from './timeboxesSlice';
import goalsReducer from './goalsSlice';
import timerReducer from './timerSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    timeboxes: timeboxesReducer,
    goals: goalsReducer,
    timer: timerReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
