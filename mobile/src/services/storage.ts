import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AuthTokens, User } from '../types';

const KEYS = {
  TOKENS: '@timeblazer/tokens',
  USER: '@timeblazer/user',
  THEME: '@timeblazer/theme',
  NOTIFICATIONS: '@timeblazer/notifications',
} as const;

export async function saveTokens(tokens: AuthTokens): Promise<void> {
  await AsyncStorage.setItem(KEYS.TOKENS, JSON.stringify(tokens));
}

export async function getTokens(): Promise<AuthTokens | null> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.TOKENS);
    return raw ? (JSON.parse(raw) as AuthTokens) : null;
  } catch {
    return null;
  }
}

export async function removeTokens(): Promise<void> {
  await AsyncStorage.removeItem(KEYS.TOKENS);
}

export async function saveUser(user: User): Promise<void> {
  await AsyncStorage.setItem(KEYS.USER, JSON.stringify(user));
}

export async function getUser(): Promise<User | null> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.USER);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export async function removeUser(): Promise<void> {
  await AsyncStorage.removeItem(KEYS.USER);
}

export async function saveTheme(theme: 'light' | 'dark' | 'system'): Promise<void> {
  await AsyncStorage.setItem(KEYS.THEME, theme);
}

export async function getTheme(): Promise<'light' | 'dark' | 'system'> {
  const value = await AsyncStorage.getItem(KEYS.THEME);
  return (value as 'light' | 'dark' | 'system') ?? 'system';
}

export async function saveNotificationsEnabled(enabled: boolean): Promise<void> {
  await AsyncStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(enabled));
}

export async function getNotificationsEnabled(): Promise<boolean> {
  const value = await AsyncStorage.getItem(KEYS.NOTIFICATIONS);
  return value !== null ? JSON.parse(value) : true;
}

export async function clearStorage(): Promise<void> {
  await AsyncStorage.multiRemove([KEYS.TOKENS, KEYS.USER]);
}
