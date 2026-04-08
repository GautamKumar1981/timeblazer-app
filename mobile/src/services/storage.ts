import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  AUTH_TOKEN: '@timeblazer:auth_token',
  USER: '@timeblazer:user',
  API_URL: '@timeblazer:api_url',
  CACHED_TIMEBOXES: '@timeblazer:cached_timeboxes',
  CACHED_GOALS: '@timeblazer:cached_goals',
} as const;

export const storage = {
  // Auth token
  async saveToken(token: string): Promise<void> {
    await AsyncStorage.setItem(KEYS.AUTH_TOKEN, token);
  },

  async getToken(): Promise<string | null> {
    return AsyncStorage.getItem(KEYS.AUTH_TOKEN);
  },

  async removeToken(): Promise<void> {
    await AsyncStorage.removeItem(KEYS.AUTH_TOKEN);
  },

  // User data
  async saveUser(user: object): Promise<void> {
    await AsyncStorage.setItem(KEYS.USER, JSON.stringify(user));
  },

  async getUser<T>(): Promise<T | null> {
    const raw = await AsyncStorage.getItem(KEYS.USER);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },

  async removeUser(): Promise<void> {
    await AsyncStorage.removeItem(KEYS.USER);
  },

  // API URL
  async saveApiUrl(url: string): Promise<void> {
    await AsyncStorage.setItem(KEYS.API_URL, url);
  },

  async getApiUrl(): Promise<string | null> {
    return AsyncStorage.getItem(KEYS.API_URL);
  },

  // Generic cache helpers
  async cacheData(key: string, data: unknown): Promise<void> {
    await AsyncStorage.setItem(key, JSON.stringify({ data, cachedAt: Date.now() }));
  },

  async getCachedData<T>(key: string, maxAgeMs = 5 * 60 * 1000): Promise<T | null> {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw) as { data: T; cachedAt: number };
      if (Date.now() - parsed.cachedAt > maxAgeMs) return null;
      return parsed.data;
    } catch {
      return null;
    }
  },

  // Clear all app data (logout)
  async clearAll(): Promise<void> {
    await AsyncStorage.multiRemove([
      KEYS.AUTH_TOKEN,
      KEYS.USER,
      KEYS.CACHED_TIMEBOXES,
      KEYS.CACHED_GOALS,
    ]);
  },
};
