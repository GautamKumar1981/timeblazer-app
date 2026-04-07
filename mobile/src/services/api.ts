import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { storage } from './storage';
import type { User, Timebox, Goal, Category } from '../types';

const DEFAULT_API_URL = 'http://localhost:5000/api';

let axiosInstance: AxiosInstance = createAxiosInstance(DEFAULT_API_URL);

function createAxiosInstance(baseURL: string): AxiosInstance {
  const instance = axios.create({
    baseURL,
    timeout: 10000,
    headers: { 'Content-Type': 'application/json' },
  });

  instance.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
    const token = await storage.getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  instance.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error) => {
      if (error.response?.status === 401) {
        await storage.clearAll();
      }
      return Promise.reject(error);
    }
  );

  return instance;
}

export async function initApiClient(): Promise<void> {
  const savedUrl = await storage.getApiUrl();
  if (savedUrl) {
    axiosInstance = createAxiosInstance(savedUrl);
  }
}

export function setApiUrl(url: string): void {
  axiosInstance = createAxiosInstance(url);
  storage.saveApiUrl(url);
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export interface LoginPayload {
  username: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export const authApi = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const { data } = await axiosInstance.post<AuthResponse>('/auth/login', payload);
    await storage.saveToken(data.access_token);
    await storage.saveUser(data.user);
    return data;
  },

  async register(payload: { username: string; email: string; password: string; fullName: string }): Promise<AuthResponse> {
    const { data } = await axiosInstance.post<AuthResponse>('/auth/register', payload);
    await storage.saveToken(data.access_token);
    await storage.saveUser(data.user);
    return data;
  },

  async logout(): Promise<void> {
    await storage.clearAll();
  },

  async getProfile(): Promise<User> {
    const { data } = await axiosInstance.get<User>('/auth/profile');
    return data;
  },
};

// ── Timeboxes ─────────────────────────────────────────────────────────────────

export interface CreateTimeboxPayload {
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  date: string;
  categoryId?: number;
  priority?: 'high' | 'medium' | 'low';
  goalId?: number;
}

export const timeboxApi = {
  async getAll(date?: string): Promise<Timebox[]> {
    const params = date ? { date } : {};
    const { data } = await axiosInstance.get<Timebox[]>('/timeboxes', { params });
    return data;
  },

  async getById(id: number): Promise<Timebox> {
    const { data } = await axiosInstance.get<Timebox>(`/timeboxes/${id}`);
    return data;
  },

  async create(payload: CreateTimeboxPayload): Promise<Timebox> {
    const { data } = await axiosInstance.post<Timebox>('/timeboxes', payload);
    return data;
  },

  async update(id: number, payload: Partial<CreateTimeboxPayload>): Promise<Timebox> {
    const { data } = await axiosInstance.put<Timebox>(`/timeboxes/${id}`, payload);
    return data;
  },

  async complete(id: number): Promise<Timebox> {
    const { data } = await axiosInstance.patch<Timebox>(`/timeboxes/${id}/complete`);
    return data;
  },

  async delete(id: number): Promise<void> {
    await axiosInstance.delete(`/timeboxes/${id}`);
  },

  async getToday(): Promise<Timebox[]> {
    const { data } = await axiosInstance.get<Timebox[]>('/timeboxes/today');
    return data;
  },

  async getPriorities(): Promise<Timebox[]> {
    const { data } = await axiosInstance.get<Timebox[]>('/timeboxes/priorities');
    return data;
  },
};

// ── Goals ─────────────────────────────────────────────────────────────────────

export interface CreateGoalPayload {
  title: string;
  description?: string;
  targetDate: string;
  categoryId?: number;
}

export const goalApi = {
  async getAll(): Promise<Goal[]> {
    const { data } = await axiosInstance.get<Goal[]>('/goals');
    return data;
  },

  async getById(id: number): Promise<Goal> {
    const { data } = await axiosInstance.get<Goal>(`/goals/${id}`);
    return data;
  },

  async create(payload: CreateGoalPayload): Promise<Goal> {
    const { data } = await axiosInstance.post<Goal>('/goals', payload);
    return data;
  },

  async update(id: number, payload: Partial<CreateGoalPayload>): Promise<Goal> {
    const { data } = await axiosInstance.put<Goal>(`/goals/${id}`, payload);
    return data;
  },

  async delete(id: number): Promise<void> {
    await axiosInstance.delete(`/goals/${id}`);
  },
};

// ── Categories ────────────────────────────────────────────────────────────────

export const categoryApi = {
  async getAll(): Promise<Category[]> {
    const { data } = await axiosInstance.get<Category[]>('/categories');
    return data;
  },

  async create(payload: { name: string; color: string; icon: string }): Promise<Category> {
    const { data } = await axiosInstance.post<Category>('/categories', payload);
    return data;
  },
};

// ── Stats ─────────────────────────────────────────────────────────────────────

export interface DashboardStats {
  todayTotal: number;
  completedToday: number;
  weekTotal: number;
  streak: number;
}

export const statsApi = {
  async getDashboard(): Promise<DashboardStats> {
    const { data } = await axiosInstance.get<DashboardStats>('/stats/dashboard');
    return data;
  },
};
