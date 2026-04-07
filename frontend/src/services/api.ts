import axios from 'axios';
import { getToken, clearTokens } from './auth';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearTokens();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const api = {
  auth: {
    login: (email: string, password: string) =>
      apiClient.post('/api/auth/login', { email, password }),
    register: (name: string, email: string, password: string) =>
      apiClient.post('/api/auth/register', { name, email, password }),
    logout: () => apiClient.post('/api/auth/logout'),
    getMe: () => apiClient.get('/api/auth/me'),
  },

  timeboxes: {
    getTimeboxes: (params?: Record<string, string>) =>
      apiClient.get('/api/timeboxes', { params }),
    createTimebox: (data: Record<string, unknown>) =>
      apiClient.post('/api/timeboxes', data),
    updateTimebox: (id: string, data: Record<string, unknown>) =>
      apiClient.put(`/api/timeboxes/${id}`, data),
    deleteTimebox: (id: string) =>
      apiClient.delete(`/api/timeboxes/${id}`),
    updateStatus: (id: string, status: string) =>
      apiClient.patch(`/api/timeboxes/${id}/status`, { status }),
  },

  goals: {
    getGoals: (params?: Record<string, string>) =>
      apiClient.get('/api/goals', { params }),
    createGoal: (data: Record<string, unknown>) =>
      apiClient.post('/api/goals', data),
    updateGoal: (id: string, data: Record<string, unknown>) =>
      apiClient.put(`/api/goals/${id}`, data),
    deleteGoal: (id: string) =>
      apiClient.delete(`/api/goals/${id}`),
    updateProgress: (id: string, progress: number) =>
      apiClient.patch(`/api/goals/${id}/progress`, { progress }),
  },

  priorities: {
    getToday: () => apiClient.get('/api/priorities/today'),
    createPriorities: (data: Record<string, unknown>) =>
      apiClient.post('/api/priorities', data),
    getPrioritiesByDate: (date: string) =>
      apiClient.get(`/api/priorities/${date}`),
  },

  analytics: {
    getWeekly: (weekStart?: string) =>
      apiClient.get('/api/analytics/weekly', { params: weekStart ? { week_start: weekStart } : {} }),
    getMonthly: (month: number, year: number) =>
      apiClient.get('/api/analytics/monthly', { params: { month, year } }),
    getPatterns: () => apiClient.get('/api/analytics/patterns'),
    getStreaks: () => apiClient.get('/api/analytics/streaks'),
  },

  reviews: {
    getWeeklyReviews: () => apiClient.get('/api/reviews'),
    getWeeklyReview: (weekStart: string) =>
      apiClient.get(`/api/reviews/${weekStart}`),
    generateWeeklyReview: () => apiClient.post('/api/reviews/generate'),
    updateWeeklyReview: (id: string, data: Record<string, unknown>) =>
      apiClient.put(`/api/reviews/${id}`, data),
  },

  users: {
    getProfile: () => apiClient.get('/api/users/profile'),
    updateProfile: (data: Record<string, unknown>) =>
      apiClient.put('/api/users/profile', data),
    changePassword: (data: Record<string, unknown>) =>
      apiClient.post('/api/users/change-password', data),
  },
};

export default apiClient;
