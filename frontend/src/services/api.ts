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
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
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

// --- Auth ---
export const authAPI = {
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  register: (name: string, email: string, password: string) => api.post('/auth/register', { name, email, password }),
  me: () => api.get('/auth/me'),
  updateProfile: (data: { name?: string; email?: string }) => api.put('/auth/profile', data),
};

// --- Timeboxes ---
export const timeboxAPI = {
  getAll: (params?: { date?: string; startDate?: string; endDate?: string }) => api.get('/timeboxes', { params }),
  getById: (id: string) => api.get(`/timeboxes/${id}`),
  create: (data: object) => api.post('/timeboxes', data),
  update: (id: string, data: object) => api.put(`/timeboxes/${id}`, data),
  delete: (id: string) => api.delete(`/timeboxes/${id}`),
  complete: (id: string) => api.patch(`/timeboxes/${id}/complete`),
};

// --- Goals ---
export const goalsAPI = {
  getAll: () => api.get('/goals'),
  getById: (id: string) => api.get(`/goals/${id}`),
  create: (data: object) => api.post('/goals', data),
  update: (id: string, data: object) => api.put(`/goals/${id}`, data),
  delete: (id: string) => api.delete(`/goals/${id}`),
};

// --- Priorities ---
export const prioritiesAPI = {
  getByDate: (date: string) => api.get('/priorities', { params: { date } }),
  set: (date: string, priorities: string[]) => api.post('/priorities', { date, priorities }),
};

// --- Analytics ---
export const analyticsAPI = {
  getSummary: (period: 'weekly' | 'monthly') => api.get('/analytics/summary', { params: { period } }),
  getProductivity: (startDate: string, endDate: string) => api.get('/analytics/productivity', { params: { startDate, endDate } }),
};

// --- Weekly Reviews ---
export const reviewsAPI = {
  getAll: () => api.get('/reviews'),
  create: (data: object) => api.post('/reviews', data),
  getById: (id: string) => api.get(`/reviews/${id}`),
};

export default api;
