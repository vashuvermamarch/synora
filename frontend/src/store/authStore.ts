import { create } from 'zustand';
import type { User, AuthTokens } from '../types';
import api from '../api/client';

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  login: (tokens: AuthTokens, user: User) => void;
  logout: () => void;
  loadFromStorage: () => void;
  fetchUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  tokens: null,
  isAuthenticated: false,
  isLoading: true,

  login: (tokens, user) => {
    localStorage.setItem('synora_tokens', JSON.stringify(tokens));
    localStorage.setItem('synora_user', JSON.stringify(user));
    set({ user, tokens, isAuthenticated: true, isLoading: false });
  },

  logout: () => {
    const tokens = localStorage.getItem('synora_tokens');
    if (tokens) {
      try {
        const { refresh } = JSON.parse(tokens);
        api.post('/auth/logout/', { refresh }).catch(() => {});
      } catch { /* ignore */ }
    }
    localStorage.removeItem('synora_tokens');
    localStorage.removeItem('synora_user');
    set({ user: null, tokens: null, isAuthenticated: false, isLoading: false });
  },

  loadFromStorage: () => {
    const tokensStr = localStorage.getItem('synora_tokens');
    const userStr = localStorage.getItem('synora_user');

    if (tokensStr && userStr) {
      try {
        const tokens = JSON.parse(tokensStr);
        const user = JSON.parse(userStr);
        set({ user, tokens, isAuthenticated: true, isLoading: false });
      } catch {
        set({ isLoading: false });
      }
    } else {
      set({ isLoading: false });
    }
  },

  fetchUser: async () => {
    try {
      const res = await api.get('/auth/me/');
      const user = res.data;
      localStorage.setItem('synora_user', JSON.stringify(user));
      set({ user });
    } catch {
      /* ignore */
    }
  },
}));
