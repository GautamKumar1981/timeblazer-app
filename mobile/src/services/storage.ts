import AsyncStorage from '@react-native-async-storage/async-storage';

export const storage = {
  async save(key: string, value: unknown): Promise<void> {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  },

  async load<T>(key: string): Promise<T | null> {
    const raw = await AsyncStorage.getItem(key);
    if (raw === null) return null;
    return JSON.parse(raw) as T;
  },

  async remove(key: string): Promise<void> {
    await AsyncStorage.removeItem(key);
  },

  async saveToken(token: string): Promise<void> {
    await AsyncStorage.setItem('auth_token', token);
  },

  async getToken(): Promise<string | null> {
    return AsyncStorage.getItem('auth_token');
  },

  async clearAll(): Promise<void> {
    await AsyncStorage.clear();
  },
};

export default storage;
