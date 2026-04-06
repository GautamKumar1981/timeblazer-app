import type { TimeboxCategory } from '../types';

export const categoryColors: Record<TimeboxCategory, string> = {
  Work: '#3b82f6',
  Meetings: '#ef4444',
  Breaks: '#f59e0b',
  Learning: '#10b981',
  Personal: '#8b5cf6',
};

export const categoryBackgrounds: Record<TimeboxCategory, string> = {
  Work: '#eff6ff',
  Meetings: '#fef2f2',
  Breaks: '#fffbeb',
  Learning: '#ecfdf5',
  Personal: '#f5f3ff',
};

export const colors = {
  primary: '#6c63ff',
  primaryDark: '#5a52d5',
  primaryLight: '#8b85ff',

  secondary: '#ff6584',
  accent: '#43e97b',

  background: '#f8f9ff',
  backgroundDark: '#1a1a2e',
  surface: '#ffffff',
  surfaceDark: '#16213e',
  cardDark: '#0f3460',

  text: '#1a1a2e',
  textSecondary: '#6b7280',
  textLight: '#9ca3af',
  textOnDark: '#ffffff',
  textSecondaryOnDark: '#a0aec0',

  border: '#e5e7eb',
  borderDark: '#2d3748',

  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',

  timerRing: '#6c63ff',
  timerRingBg: '#2d3748',
  timerBackground: '#1a1a2e',
};

export const darkTheme = {
  background: '#1a1a2e',
  surface: '#16213e',
  card: '#0f3460',
  text: '#ffffff',
  textSecondary: '#a0aec0',
  border: '#2d3748',
  primary: '#6c63ff',
};

export const lightTheme = {
  background: '#f8f9ff',
  surface: '#ffffff',
  card: '#ffffff',
  text: '#1a1a2e',
  textSecondary: '#6b7280',
  border: '#e5e7eb',
  primary: '#6c63ff',
};
