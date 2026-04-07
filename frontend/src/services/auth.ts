import { authAPI } from './api';
import { setToken, clearAll, getToken } from './storage';

export interface LoginResponse {
  token: string;
  user: { _id: string; name: string; email: string };
}

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  const response = await authAPI.login(email, password);
  const data = response.data as LoginResponse;
  setToken(data.token);
  return data;
};

export const register = async (name: string, email: string, password: string): Promise<LoginResponse> => {
  const response = await authAPI.register(name, email, password);
  const data = response.data as LoginResponse;
  setToken(data.token);
  return data;
};

export const logout = (): void => {
  clearAll();
};

export const isAuthenticated = (): boolean => {
  return Boolean(getToken());
};

export const getCurrentUser = async () => {
  const response = await authAPI.me();
  return response.data;
};
