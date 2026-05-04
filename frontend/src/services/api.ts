import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { getToken, clearToken } from './storage';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken();
    if (token && config.headers) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearToken();
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authAPI = {
  login:         (email: string, password: string) => api.post('/auth/login', { email, password }),
  register:      (name: string, email: string, password: string) => api.post('/auth/register', { username: name, email, password }),
  me:            () => api.get('/auth/me'),
  updateProfile: (data: { name?: string; email?: string }) => api.put('/auth/profile', data),
};

// ── Bazi ──────────────────────────────────────────────────────────────────────
export const baziAPI = {
  getProfile:     () => api.get('/bazi/profile'),
  saveProfile:    (data: object) => api.post('/bazi/profile', data),
  getChart:       () => api.get('/bazi/chart'),
  getLuckPillars: () => api.get('/bazi/luck-pillars'),
  getDaily:       (date?: string) => api.get('/bazi/daily', { params: date ? { date } : {} }),
  getCalendar:    (year: number, month: number) => api.get('/bazi/calendar', { params: { year, month } }),
  businessTiming: (activity: string, days_ahead?: number) =>
    api.post('/bazi/business-timing', { activity, days_ahead: days_ahead ?? 30 }),
  getActivities:  () => api.get('/bazi/activities'),
  getToday:       () => api.get('/bazi/today'),
};

// ── Subscription ──────────────────────────────────────────────────────────────
export const subscriptionAPI = {
  getStatus:      () => api.get('/subscription/status'),
  createCheckout: (plan: 'monthly' | 'annual') =>
    api.post('/subscription/create-checkout', { plan }),
};

// ── Artifacts ─────────────────────────────────────────────────────────────────
export const artifactsAPI = {
  getAll:  (element?: string) => api.get('/artifacts', { params: element ? { element } : {} }),
  getById: (id: number) => api.get(`/artifacts/${id}`),
};

// ── Stories ───────────────────────────────────────────────────────────────────
export const storiesAPI = {
  getAll:    () => api.get('/stories'),
  getStem:   (index: number) => api.get(`/stories/stem/${index}`),
  getBranch: (index: number) => api.get(`/stories/branch/${index}`),
};

// ── Legacy stubs (keep old slices compiling) ─────────────────────────────────
export const goalsAPI = {
  getAll:   ()                         => api.get('/goals'),
  getById:  (id: string)               => api.get(`/goals/${id}`),
  create:   (data: object)             => api.post('/goals', data),
  update:   (id: string, data: object) => api.put(`/goals/${id}`, data),
  delete:   (id: string)               => api.delete(`/goals/${id}`),
};

export const prioritiesAPI = {
  getByDate: (date: string)              => api.get('/priorities', { params: { date } }),
  set:       (date: string, p: string[]) => api.post('/priorities', { date, priorities: p }),
};

export const timeboxAPI = {
  getAll:   (params?: object)            => api.get('/timeboxes', { params }),
  create:   (data: object)               => api.post('/timeboxes', data),
  update:   (id: string, data: object)   => api.put(`/timeboxes/${id}`, data),
  delete:   (id: string)                 => api.delete(`/timeboxes/${id}`),
  complete: (id: string)                 => api.patch(`/timeboxes/${id}/complete`),
};

export const reviewsAPI = {
  getAll: () => api.get('/reviews'),
  create: (data: object) => api.post('/reviews', data),
};

export const analyticsAPI = {
  getSummary: (period: 'weekly' | 'monthly') => api.get('/analytics/summary', { params: { period } }),
};

export default api;
