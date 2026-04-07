import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { TimerState } from '../types';

const initialState: TimerState = {
  isRunning: false,
  isPaused: false,
  activeTimeboxId: null,
  elapsedSeconds: 0,
  totalSeconds: 0,
};

const timerSlice = createSlice({
  name: 'timer',
  initialState,
  reducers: {
    startTimer(state, action: PayloadAction<{ timeboxId: number; durationMinutes: number }>) {
      state.isRunning = true;
      state.isPaused = false;
      state.activeTimeboxId = action.payload.timeboxId;
      state.totalSeconds = action.payload.durationMinutes * 60;
      state.elapsedSeconds = 0;
    },

    pauseTimer(state) {
      state.isPaused = true;
      state.isRunning = false;
    },

    resumeTimer(state) {
      state.isPaused = false;
      state.isRunning = true;
    },

    stopTimer(state) {
      state.isRunning = false;
      state.isPaused = false;
      state.activeTimeboxId = null;
      state.elapsedSeconds = 0;
      state.totalSeconds = 0;
    },

    tick(state) {
      if (state.isRunning && state.elapsedSeconds < state.totalSeconds) {
        state.elapsedSeconds += 1;
      }
    },

    setElapsed(state, action: PayloadAction<number>) {
      state.elapsedSeconds = action.payload;
    },
  },
});

export const { startTimer, pauseTimer, resumeTimer, stopTimer, tick, setElapsed } = timerSlice.actions;
export default timerSlice.reducer;
