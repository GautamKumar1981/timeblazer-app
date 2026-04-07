import axios from 'axios';
import { getToken } from './auth';

const BASE_URL = process.env.API_URL ?? 'http://localhost:5000';

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach token to every request
apiClient.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Auth ──────────────────────────────────────────────────────────────────────

export const authAPI = {
  login: (email: string, password: string) =>
    apiClient.post('/api/auth/login', { email, password }),

  register: (name: string, email: string, password: string) =>
    apiClient.post('/api/auth/register', { name, email, password }),

  getMe: () => apiClient.get('/api/auth/me'),
};

// ─── Timeboxes ─────────────────────────────────────────────────────────────────

export const timeboxesAPI = {
  getTimeboxes: (date?: string) =>
    apiClient.get('/api/timeboxes', { params: date ? { date } : {} }),

  createTimebox: (data: Record<string, unknown>) =>
    apiClient.post('/api/timeboxes', data),

  updateTimebox: (id: string, data: Record<string, unknown>) =>
    apiClient.put(`/api/timeboxes/${id}`, data),

  deleteTimebox: (id: string) => apiClient.delete(`/api/timeboxes/${id}`),

  updateStatus: (id: string, status: string) =>
    apiClient.patch(`/api/timeboxes/${id}/status`, { status }),
};

// ─── Goals ─────────────────────────────────────────────────────────────────────

export const goalsAPI = {
  getGoals: () => apiClient.get('/api/goals'),

  createGoal: (data: Record<string, unknown>) =>
    apiClient.post('/api/goals', data),

  updateGoal: (id: string, data: Record<string, unknown>) =>
    apiClient.put(`/api/goals/${id}`, data),

  deleteGoal: (id: string) => apiClient.delete(`/api/goals/${id}`),
};

// ─── Priorities ────────────────────────────────────────────────────────────────

export const prioritiesAPI = {
  getToday: () => apiClient.get('/api/priorities/today'),
};

// ─── Analytics ─────────────────────────────────────────────────────────────────

export const analyticsAPI = {
  getWeekly: () => apiClient.get('/api/analytics/weekly'),
};

export default apiClient;
