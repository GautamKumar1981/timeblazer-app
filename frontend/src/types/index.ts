export interface User {
  id: string;
  email: string;
  name: string;
  timezone: string;
  theme: 'light' | 'dark';
  profilePictureUrl?: string;
}

export type TimeboxCategory = 'Work' | 'Meetings' | 'Breaks' | 'Learning' | 'Personal';
export type TimeboxStatus = 'not_started' | 'in_progress' | 'completed' | 'overrun';

export interface Timebox {
  id: string;
  userId: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  category: TimeboxCategory;
  color: string;
  status: TimeboxStatus;
  estimatedDuration: number;
  actualDuration?: number;
  notes?: string;
  createdAt: string;
}

export type GoalPriority = 'high' | 'medium' | 'low';
export type GoalStatus = 'active' | 'completed' | 'cancelled';

export interface Milestone {
  id: string;
  title: string;
  completed: boolean;
}

export interface Goal {
  id: string;
  userId: string;
  title: string;
  description?: string;
  targetDate: string;
  priority: GoalPriority;
  status: GoalStatus;
  milestones?: Milestone[];
  daysRemaining: number;
  createdAt: string;
}

export interface DailyPriority {
  id: string;
  userId: string;
  date: string;
  priority1?: string;
  priority2?: string;
  priority3?: string;
  completionStatus: { p1: boolean; p2: boolean; p3: boolean };
}

export interface AnalyticsData {
  totalTimeboxes: number;
  completedCount: number;
  accuracyPercentage: number;
  totalProductiveHours: number;
  interruptions: number;
  streakDays: number;
}

export interface WeeklyDataPoint {
  date: string;
  completionRate: number;
  productiveHours: number;
  accuracy: number;
}

export interface CategoryBreakdown {
  category: TimeboxCategory;
  count: number;
  hours: number;
}

export interface PatternData {
  busiestDay: string;
  mostProductiveHour: number;
  weeklyData: WeeklyDataPoint[];
  categoryBreakdown: CategoryBreakdown[];
}

export interface WeeklyReview {
  id: string;
  weekStartDate: string;
  weekEndDate: string;
  completionRate: number;
  keyInsights?: string[];
  wins?: string[];
  improvements?: string[];
  nextWeekFocus?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface TimeboxFilters {
  startDate?: string;
  endDate?: string;
  category?: TimeboxCategory;
  status?: TimeboxStatus;
}

export interface ParkingLotItem {
  id: string;
  text: string;
  createdAt: string;
}
