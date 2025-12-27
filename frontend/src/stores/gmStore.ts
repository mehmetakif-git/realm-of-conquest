import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GMAccount, DashboardStats, Ban, Ticket, Mute, GMLevel } from '../types/gm';
import { gmRoleToLevel } from '../types/gm';
import { gmAuthApi, dashboardApi, banApi, ticketApi, muteApi } from '../services/gmApi';

interface GMState {
  token: string | null;
  gmAccount: (GMAccount & { level: GMLevel }) | null;
  isLoading: boolean;
  error: string | null;

  // Dashboard
  stats: DashboardStats | null;

  // Bans
  bans: Ban[];

  // Mutes
  mutes: Mute[];

  // Tickets
  tickets: Ticket[];

  // Actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  clearError: () => void;

  // Dashboard
  fetchStats: () => Promise<void>;

  // Bans
  fetchBans: () => Promise<void>;

  // Mutes
  fetchMutes: () => Promise<void>;

  // Tickets
  fetchTickets: (status?: string) => Promise<void>;
}

// Helper to add level to GMAccount from gm_role
const addLevelToGMAccount = (gm: GMAccount): GMAccount & { level: GMLevel } => ({
  ...gm,
  level: gmRoleToLevel(gm.gm_role),
});

export const useGMStore = create<GMState>()(
  persist(
    (set, get) => ({
      token: null,
      gmAccount: null,
      isLoading: false,
      error: null,
      stats: null,
      bans: [],
      mutes: [],
      tickets: [],

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await gmAuthApi.login(email, password);
          localStorage.setItem('gm_token', response.token);
          set({
            token: response.token,
            gmAccount: addLevelToGMAccount(response.gm_account),
            isLoading: false,
          });
        } catch (error: unknown) {
          const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Login failed';
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      logout: () => {
        localStorage.removeItem('gm_token');
        set({ token: null, gmAccount: null, stats: null, bans: [], mutes: [], tickets: [] });
      },

      checkAuth: async () => {
        const token = get().token || localStorage.getItem('gm_token');
        if (!token) {
          set({ token: null, gmAccount: null });
          return;
        }

        set({ isLoading: true });
        try {
          const gmAccount = await gmAuthApi.me();
          set({ token, gmAccount: addLevelToGMAccount(gmAccount), isLoading: false });
        } catch {
          localStorage.removeItem('gm_token');
          set({ token: null, gmAccount: null, isLoading: false });
        }
      },

      clearError: () => set({ error: null }),

      fetchStats: async () => {
        try {
          const stats = await dashboardApi.getStats();
          set({ stats });
        } catch (error) {
          console.error('Failed to fetch stats:', error);
        }
      },

      fetchBans: async () => {
        try {
          const bans = await banApi.list();
          set({ bans });
        } catch (error) {
          console.error('Failed to fetch bans:', error);
        }
      },

      fetchMutes: async () => {
        try {
          const mutes = await muteApi.list();
          set({ mutes });
        } catch (error) {
          console.error('Failed to fetch mutes:', error);
        }
      },

      fetchTickets: async (status?: string) => {
        try {
          const tickets = await ticketApi.list(status as any);
          set({ tickets });
        } catch (error) {
          console.error('Failed to fetch tickets:', error);
        }
      },
    }),
    {
      name: 'gm-storage',
      partialize: (state) => ({ token: state.token }),
    }
  )
);
