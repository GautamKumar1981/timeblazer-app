import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authApi, LoginPayload } from '../services/api';
import { storage } from '../services/storage';
import type { AuthState, User } from '../types';

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

export const loginThunk = createAsyncThunk('auth/login', async (payload: LoginPayload, { rejectWithValue }) => {
  try {
    return await authApi.login(payload);
  } catch (err: unknown) {
    const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Login failed';
    return rejectWithValue(message);
  }
});

export const restoreSession = createAsyncThunk('auth/restore', async (_, { rejectWithValue }) => {
  try {
    const token = await storage.getToken();
    const user = await storage.getUser<User>();
    if (!token || !user) return rejectWithValue('No session');
    return { access_token: token, user };
  } catch {
    return rejectWithValue('Restore failed');
  }
});

export const logoutThunk = createAsyncThunk('auth/logout', async () => {
  await authApi.logout();
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    // login
    builder
      .addCase(loginThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.token = action.payload.access_token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // restore
    builder
      .addCase(restoreSession.pending, (state) => { state.isLoading = true; })
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.isLoading = false;
        state.token = action.payload.access_token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(restoreSession.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
      });

    // logout
    builder.addCase(logoutThunk.fulfilled, (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    });
  },
});

export const { clearError, setUser } = authSlice.actions;
export default authSlice.reducer;
