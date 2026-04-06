export type TimeboxCategory = 'Work' | 'Meetings' | 'Breaks' | 'Learning' | 'Personal';
export type TimeboxStatus = 'pending' | 'active' | 'completed' | 'skipped';
export type GoalPriority = 'low' | 'medium' | 'high' | 'critical';

export interface User {
  id: string;
  email: string;
  name: string;
  timezone: string;
  preferences: UserPreferences;
  createdAt: string;
  updatedAt: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  notifications: boolean;
  workStartTime: string;
  workEndTime: string;
  defaultTimeboxDuration: number;
}

export interface Timebox {
  id: string;
  userId: string;
  title: string;
  description?: string;
  category: TimeboxCategory;
  startTime: string;
  endTime: string;
  duration: number;
  status: TimeboxStatus;
  date: string;
  goalId?: string;
  completedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Goal {
  id: string;
  userId: string;
  title: string;
  description?: string;
  priority: GoalPriority;
  targetDate: string;
  progress: number;
  isCompleted: boolean;
  milestones: Milestone[];
  createdAt: string;
  updatedAt: string;
}

export interface Milestone {
  id: string;
  title: string;
  isCompleted: boolean;
  targetDate?: string;
}

export interface DailyPriority {
  id: string;
  userId: string;
  date: string;
  text: string;
  isCompleted: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface AnalyticsData {
  date: string;
  totalTimeboxes: number;
  completedTimeboxes: number;
  skippedTimeboxes: number;
  totalFocusTime: number;
  categoryBreakdown: Record<TimeboxCategory, number>;
  completionRate: number;
}

export interface WeeklyReview {
  id: string;
  userId: string;
  weekStartDate: string;
  weekEndDate: string;
  wins: string[];
  challenges: string[];
  nextWeekGoals: string[];
  overallRating: number;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

export interface TimeboxState {
  items: Timebox[];
  selectedDate: string;
  isLoading: boolean;
  error: string | null;
  activeTimebox: Timebox | null;
}

export interface GoalsState {
  items: Goal[];
  priorities: DailyPriority[];
  isLoading: boolean;
  error: string | null;
}
