const KEYS = {
  TOKEN: 'timeblazer_access_token',
  REFRESH_TOKEN: 'timeblazer_refresh_token',
  USER: 'timeblazer_user',
} as const;

export const storage = {
  getToken: (): string | null => localStorage.getItem(KEYS.TOKEN),
  setToken: (token: string): void => localStorage.setItem(KEYS.TOKEN, token),
  removeToken: (): void => localStorage.removeItem(KEYS.TOKEN),

  getRefreshToken: (): string | null => localStorage.getItem(KEYS.REFRESH_TOKEN),
  setRefreshToken: (token: string): void => localStorage.setItem(KEYS.REFRESH_TOKEN, token),
  removeRefreshToken: (): void => localStorage.removeItem(KEYS.REFRESH_TOKEN),

  getUser: () => {
    const u = localStorage.getItem(KEYS.USER);
    return u ? JSON.parse(u) : null;
  },
  setUser: (user: object): void => localStorage.setItem(KEYS.USER, JSON.stringify(user)),
  removeUser: (): void => localStorage.removeItem(KEYS.USER),

  clearAll: (): void => {
    localStorage.removeItem(KEYS.TOKEN);
    localStorage.removeItem(KEYS.REFRESH_TOKEN);
    localStorage.removeItem(KEYS.USER);
  },
};
