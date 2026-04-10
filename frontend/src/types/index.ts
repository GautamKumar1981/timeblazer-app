export interface User {
  id: number;
  username: string;
  email: string;
  created_at: string;
}

export interface Timebox {
  id: number;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  user_id: number;
  goal_id?: number;
  created_at: string;
  updated_at: string;
}

export interface Goal {
  id: number;
  title: string;
  description?: string;
  target_date?: string;
  status: 'active' | 'completed' | 'archived';
  progress: number;
  user_id: number;
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface TimeboxState {
  timeboxes: Timebox[];
  isLoading: boolean;
  error: string | null;
}

export interface GoalState {
  goals: Goal[];
  isLoading: boolean;
  error: string | null;
}
