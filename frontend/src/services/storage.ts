const TOKEN_KEY = 'timeblazer_token';
const CACHE_KEY = 'timeblazer_cache';

// --- Token management ---
export const getToken = (): string | null => localStorage.getItem(TOKEN_KEY);

export const setToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const clearToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

// --- Cache management ---
interface CacheData {
  timeboxes?: unknown[];
  goals?: unknown[];
  lastUpdated?: number;
}

export const getCachedData = (): CacheData => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as CacheData) : {};
  } catch {
    return {};
  }
};

export const setCachedData = (data: Partial<CacheData>): void => {
  try {
    const existing = getCachedData();
    localStorage.setItem(CACHE_KEY, JSON.stringify({ ...existing, ...data, lastUpdated: Date.now() }));
  } catch {
    // Storage may be full; silently ignore
  }
};

export const clearCache = (): void => {
  localStorage.removeItem(CACHE_KEY);
};

export const clearAll = (): void => {
  clearToken();
  clearCache();
};
