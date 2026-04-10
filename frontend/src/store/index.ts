import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import timeboxReducer from './timeboxSlice';
import goalReducer from './goalSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    timeboxes: timeboxReducer,
    goals: goalReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
