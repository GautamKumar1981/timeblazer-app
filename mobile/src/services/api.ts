import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import type {
  Timebox,
  Goal,
  DailyPriority,
  User,
  AuthTokens,
  AnalyticsData,
  WeeklyReview,
} from '../types';
import { getTokens, saveTokens, clearStorage } from './storage';

const BASE_URL =
  (process.env.EXPO_PUBLIC_API_URL as string | undefined) ?? 'http://localhost:5000';

const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const tokens = await getTokens();
  if (tokens?.accessToken) {
    config.headers.Authorization = `Bearer ${tokens.accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const tokens = await getTokens();
        if (tokens?.refreshToken) {
          const { data } = await axios.post<AuthTokens>(
            `${BASE_URL}/api/auth/refresh`,
            { refreshToken: tokens.refreshToken }
          );
          await saveTokens(data);
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
          return api(originalRequest);
        }
      } catch {
        await clearStorage();
      }
    }
    return Promise.reject(error);
  }
);

// Auth
export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ user: User; tokens: AuthTokens }>('/api/auth/login', { email, password }),
  register: (name: string, email: string, password: string) =>
    api.post<{ user: User; tokens: AuthTokens }>('/api/auth/register', { name, email, password }),
  logout: () => api.post('/api/auth/logout'),
  me: () => api.get<User>('/api/auth/me'),
};

// Timeboxes
export const timeboxApi = {
  getAll: (date?: string) =>
    api.get<Timebox[]>('/api/timeboxes', { params: date ? { date } : undefined }),
  getById: (id: string) => api.get<Timebox>(`/api/timeboxes/${id}`),
  create: (data: Partial<Timebox>) => api.post<Timebox>('/api/timeboxes', data),
  update: (id: string, data: Partial<Timebox>) => api.put<Timebox>(`/api/timeboxes/${id}`, data),
  delete: (id: string) => api.delete(`/api/timeboxes/${id}`),
  complete: (id: string, notes?: string) =>
    api.post<Timebox>(`/api/timeboxes/${id}/complete`, { notes }),
  skip: (id: string) => api.post<Timebox>(`/api/timeboxes/${id}/skip`),
};

// Goals
export const goalsApi = {
  getAll: () => api.get<Goal[]>('/api/goals'),
  getById: (id: string) => api.get<Goal>(`/api/goals/${id}`),
  create: (data: Partial<Goal>) => api.post<Goal>('/api/goals', data),
  update: (id: string, data: Partial<Goal>) => api.put<Goal>(`/api/goals/${id}`, data),
  delete: (id: string) => api.delete(`/api/goals/${id}`),
};

// Daily Priorities
export const prioritiesApi = {
  getByDate: (date: string) =>
    api.get<DailyPriority[]>('/api/priorities', { params: { date } }),
  create: (data: Partial<DailyPriority>) => api.post<DailyPriority>('/api/priorities', data),
  update: (id: string, data: Partial<DailyPriority>) =>
    api.put<DailyPriority>(`/api/priorities/${id}`, data),
  delete: (id: string) => api.delete(`/api/priorities/${id}`),
  toggle: (id: string) => api.post<DailyPriority>(`/api/priorities/${id}/toggle`),
};

// User
export const userApi = {
  getProfile: () => api.get<User>('/api/users/profile'),
  updateProfile: (data: Partial<User>) => api.put<User>('/api/users/profile', data),
  updatePreferences: (prefs: Partial<User['preferences']>) =>
    api.put<User>('/api/users/preferences', prefs),
};

// Analytics
export const analyticsApi = {
  getDaily: (date: string) => api.get<AnalyticsData>('/api/analytics/daily', { params: { date } }),
  getWeekly: (startDate: string) =>
    api.get<AnalyticsData[]>('/api/analytics/weekly', { params: { startDate } }),
  getWeeklyReview: (weekStart: string) =>
    api.get<WeeklyReview>('/api/analytics/weekly-review', { params: { weekStart } }),
};

export default api;
