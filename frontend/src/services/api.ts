import axios, { AxiosRequestConfig } from 'axios';
import { storage } from './storage';
import type {
  LoginCredentials,
  RegisterData,
  User,
  AuthTokens,
  Timebox,
  TimeboxFilters,
  TimeboxStatus,
  Goal,
  DailyPriority,
  AnalyticsData,
  PatternData,
  WeeklyReview,
} from '../types';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

axiosInstance.interceptors.request.use((config) => {
  const token = storage.getToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let failedQueue: Array<{ resolve: (value: unknown) => void; reject: (reason?: unknown) => void }> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers['Authorization'] = `Bearer ${token}`;
            }
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = storage.getRefreshToken();
      if (!refreshToken) {
        storage.clearAll();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        const { data } = await axiosInstance.post<AuthTokens>('/api/auth/refresh', { refreshToken });
        storage.setToken(data.accessToken);
        storage.setRefreshToken(data.refreshToken);
        processQueue(null, data.accessToken);
        if (originalRequest.headers) {
          originalRequest.headers['Authorization'] = `Bearer ${data.accessToken}`;
        }
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        storage.clearAll();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    const message = error.response?.data?.message || error.message || 'An error occurred';
    return Promise.reject(new Error(message));
  }
);

export const api = {
  auth: {
    login: (credentials: LoginCredentials) =>
      axiosInstance.post<{ user: User; tokens: AuthTokens }>('/api/auth/login', credentials),
    register: (data: RegisterData) =>
      axiosInstance.post<{ user: User; tokens: AuthTokens }>('/api/auth/register', data),
    logout: () => axiosInstance.post('/api/auth/logout'),
    refresh: (refreshToken: string) =>
      axiosInstance.post<AuthTokens>('/api/auth/refresh', { refreshToken }),
  },
  timeboxes: {
    getAll: (filters?: TimeboxFilters) =>
      axiosInstance.get<Timebox[]>('/api/timeboxes', { params: filters }),
    getOne: (id: string) => axiosInstance.get<Timebox>(`/api/timeboxes/${id}`),
    create: (data: Partial<Timebox>) => axiosInstance.post<Timebox>('/api/timeboxes', data),
    update: (id: string, data: Partial<Timebox>) =>
      axiosInstance.put<Timebox>(`/api/timeboxes/${id}`, data),
    delete: (id: string) => axiosInstance.delete(`/api/timeboxes/${id}`),
    updateStatus: (id: string, status: TimeboxStatus) =>
      axiosInstance.patch<Timebox>(`/api/timeboxes/${id}/status`, { status }),
    complete: (id: string, actualDuration: number) =>
      axiosInstance.patch<Timebox>(`/api/timeboxes/${id}/complete`, { actualDuration }),
    createBatch: (data: Partial<Timebox>[]) =>
      axiosInstance.post<Timebox[]>('/api/timeboxes/batch', data),
  },
  goals: {
    getAll: () => axiosInstance.get<Goal[]>('/api/goals'),
    getOne: (id: string) => axiosInstance.get<Goal>(`/api/goals/${id}`),
    create: (data: Partial<Goal>) => axiosInstance.post<Goal>('/api/goals', data),
    update: (id: string, data: Partial<Goal>) =>
      axiosInstance.put<Goal>(`/api/goals/${id}`, data),
    delete: (id: string) => axiosInstance.delete(`/api/goals/${id}`),
  },
  priorities: {
    getToday: () => axiosInstance.get<DailyPriority>('/api/priorities/today'),
    create: (data: Partial<DailyPriority>) =>
      axiosInstance.post<DailyPriority>('/api/priorities', data),
    update: (id: string, data: Partial<DailyPriority>) =>
      axiosInstance.put<DailyPriority>(`/api/priorities/${id}`, data),
  },
  analytics: {
    getWeek: (weekStart: string) =>
      axiosInstance.get<AnalyticsData>('/api/analytics/week', { params: { weekStart } }),
    getMonth: (month: number, year: number) =>
      axiosInstance.get<AnalyticsData>('/api/analytics/month', { params: { month, year } }),
    getPatterns: () => axiosInstance.get<PatternData>('/api/analytics/patterns'),
    getStreaks: () =>
      axiosInstance.get<{ streakDays: number; longestStreak: number }>('/api/analytics/streaks'),
  },
  reviews: {
    getWeekly: () => axiosInstance.get<WeeklyReview[]>('/api/reviews/weekly'),
    generateWeekly: (data: Partial<WeeklyReview>) =>
      axiosInstance.post<WeeklyReview>('/api/reviews/weekly/generate', data),
  },
  users: {
    getSettings: () => axiosInstance.get<User>('/api/users/settings'),
    updateSettings: (data: Partial<User>) => axiosInstance.put<User>('/api/users/settings', data),
  },
};
