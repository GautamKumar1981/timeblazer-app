// Central type definitions for the Timeblazer mobile app

export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  timezone: string;
}

export interface Category {
  id: number;
  name: string;
  color: string;
  icon: string;
}

export interface Timebox {
  id: number;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  date: string;
  duration: number; // minutes
  categoryId: number | null;
  category: Category | null;
  isCompleted: boolean;
  priority: 'high' | 'medium' | 'low';
  goalId: number | null;
}

export interface Goal {
  id: number;
  title: string;
  description: string;
  targetDate: string;
  progress: number; // 0-100
  isCompleted: boolean;
  categoryId: number | null;
  category: Category | null;
  milestones: Milestone[];
}

export interface Milestone {
  id: number;
  goalId: number;
  title: string;
  isCompleted: boolean;
  dueDate: string | null;
}

export interface TimerState {
  isRunning: boolean;
  isPaused: boolean;
  activeTimeboxId: number | null;
  elapsedSeconds: number;
  totalSeconds: number;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AppSettings {
  apiUrl: string;
  notificationsEnabled: boolean;
  theme: 'light' | 'dark';
}

export type RootStackParamList = {
  Auth: undefined;
  Login: undefined;
  Register: undefined;
  Main: undefined;
};

export type TabParamList = {
  Dashboard: undefined;
  Calendar: undefined;
  Timer: undefined;
  Goals: undefined;
  Settings: undefined;
};
