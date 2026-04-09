import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const register = (email, password, name) =>
  api.post('/api/auth/register', { email, password, name });

export const login = (email, password) =>
  api.post('/api/auth/login', { email, password });

export const getMe = () =>
  api.get('/api/auth/me');

export const getTimeboxes = () =>
  api.get('/api/timeboxes');

export const createTimebox = (title, startTime, endTime) =>
  api.post('/api/timeboxes', { title, start_time: startTime, end_time: endTime });

export const getGoals = () =>
  api.get('/api/goals');

export const createGoal = (title, targetDate) =>
  api.post('/api/goals', { title, target_date: targetDate });

export default api;
