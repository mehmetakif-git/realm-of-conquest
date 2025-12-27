import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Account } from '../types';
import { authApi } from '../services/api';

interface AuthState {
  token: string | null;
  account: Account | null;
  isLoading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      account: null,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.login(email, password);
          localStorage.setItem('token', response.token);
          set({ token: response.token, account: response.account, isLoading: false });
        } catch (error: unknown) {
          const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Giriş başarısız';
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      register: async (email: string, username: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.register(email, username, password);
          localStorage.setItem('token', response.token);
          set({ token: response.token, account: response.account, isLoading: false });
        } catch (error: unknown) {
          const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Kayıt başarısız';
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      logout: () => {
        localStorage.removeItem('token');
        set({ token: null, account: null, error: null });
      },

      checkAuth: async () => {
        const token = get().token || localStorage.getItem('token');
        if (!token) {
          set({ token: null, account: null });
          return;
        }

        set({ isLoading: true });
        try {
          const account = await authApi.me();
          set({ token, account, isLoading: false });
        } catch {
          localStorage.removeItem('token');
          set({ token: null, account: null, isLoading: false });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token }),
    }
  )
);
