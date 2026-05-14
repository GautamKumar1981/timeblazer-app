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
  login:          (email: string, password: string) => api.post('/auth/login', { email, password }),
  register:       (name: string, email: string, password: string) => api.post('/auth/register', { username: name, email, password }),
  me:             () => api.get('/auth/me'),
  updateProfile:  (data: { name?: string; email?: string }) => api.put('/auth/profile', data),
  changePassword:  (current_password: string, new_password: string) =>
    api.post('/auth/change-password', { current_password, new_password }),
  forgotPassword:  (email: string) =>
    api.post('/auth/forgot-password', { email }),
  resetPassword:   (token: string, new_password: string) =>
    api.post('/auth/reset-password', { token, new_password }),
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
  verifySession:      (sessionId: string) =>
    api.post('/subscription/verify-session', { session_id: sessionId }),
  cancelSubscription: () => api.post('/subscription/cancel'),
  billingPortal:      () => api.post('/subscription/billing-portal'),
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

// ── Vedic Jyotish ─────────────────────────────────────────────────────────────
export const vedicAPI = {
  getProfile:  ()             => api.get('/vedic/profile'),
  saveProfile: (data: object) => api.post('/vedic/profile', data),
  getToday:    ()             => api.get('/vedic/today'),
  getPanchang: (date?: string) => api.get('/vedic/panchang', { params: date ? { date } : {} }),
  getDasha:    ()             => api.get('/vedic/dasha'),
  getCalendar: (year: number, month: number) => api.get('/vedic/calendar', { params: { year, month } }),
};

// ── Push notifications ────────────────────────────────────────────────────────
export const pushAPI = {
  subscribe:   (sub: object) => api.post('/push/subscribe', sub),
  unsubscribe: (endpoint: string) => api.post('/push/unsubscribe', { endpoint }),
  status:      () => api.get('/push/status'),
  sendTest:    () => api.post('/push/send-test'),
  sendAll:     (title: string, body: string, url?: string) =>
    api.post('/push/send-all', { title, body, url: url ?? '/dashboard' }),
};

// ── Admin ─────────────────────────────────────────────────────────────────────
export const adminAPI = {
  getStats:    ()                          => api.get('/admin/stats'),
  listUsers:   (params?: { search?: string; page?: number; limit?: number }) =>
                                              api.get('/admin/users', { params }),
  getUser:     (id: number)               => api.get(`/admin/users/${id}`),
  updateUser:  (id: number, data: object) => api.patch(`/admin/users/${id}`, data),
  deleteUser:  (id: number)               => api.delete(`/admin/users/${id}`),
  overrideSub: (id: number, data: object) => api.patch(`/admin/users/${id}/subscription`, data),
  testEmail:   (to?: string)             => api.post('/admin/test-email', { to }),
};

export default api;
