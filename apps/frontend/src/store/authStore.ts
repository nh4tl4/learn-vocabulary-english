import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, AuthResponse } from '@/types';
import { authAPI, userAPI } from '@/lib/api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  lastTokenCheck: number; // Add caching timestamp
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  loadUser: () => Promise<void>;
  quickAuth: () => void; // Add quick auth check
  getToken: () => string | null;
  setToken: (token: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isInitialized: false,
      lastTokenCheck: 0,

      // Get token from localStorage
      getToken: () => {
        if (typeof window !== 'undefined') {
          return localStorage.getItem('auth_token');
        }
        return null;
      },

      // Set token to localStorage
      setToken: (token: string) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth_token', token);
        }
      },

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await authAPI.login(email, password);
          const { access_token, user }: AuthResponse = response.data;

          // Use localStorage instead of cookies
          if (typeof window !== 'undefined') {
            localStorage.setItem('auth_token', access_token);
          }
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (email: string, password: string, name: string) => {
        set({ isLoading: true });
        try {
          const response = await authAPI.register(email, password, name);
          const { access_token, user }: AuthResponse = response.data;

          // Use localStorage instead of cookies
          if (typeof window !== 'undefined') {
            localStorage.setItem('auth_token', access_token);
          }
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        // Remove token from localStorage instead of cookies
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token');
        }
        set({ user: null, isAuthenticated: false, isInitialized: true });
      },

      // Quick authentication check without API call
      quickAuth: () => {
        const token = get().getToken();
        const state = get();

        // If we have a recent token check (within 5 minutes), trust it
        const now = Date.now();
        const fiveMinutes = 5 * 60 * 1000;

        if (token && state.user && (now - state.lastTokenCheck < fiveMinutes)) {
          set({
            isAuthenticated: true,
            isInitialized: true,
            lastTokenCheck: now
          });
          return;
        }

        if (!token) {
          set({
            isAuthenticated: false,
            user: null,
            isInitialized: true,
            lastTokenCheck: now
          });
          return;
        }

        // Token exists but needs verification - do it in background
        get().loadUser();
      },

      loadUser: async () => {
        const token = get().getToken();
        if (!token) {
          set({
            isAuthenticated: false,
            user: null,
            isInitialized: true,
            lastTokenCheck: Date.now()
          });
          return;
        }

        try {
          set({ isLoading: true });
          const response = await userAPI.getProfile();
          set({
            user: response.data,
            isAuthenticated: true,
            isLoading: false,
            isInitialized: true,
            lastTokenCheck: Date.now()
          });
        } catch (error) {
          // Token không hợp lệ hoặc đã hết hạn
          if (typeof window !== 'undefined') {
            localStorage.removeItem('auth_token');
          }
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            isInitialized: true,
            lastTokenCheck: Date.now()
          });
        }
      },
    }),
    {
      name: 'auth-storage',
      // Persist user data and cache timestamp
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        lastTokenCheck: state.lastTokenCheck
      }),
    }
  )
);
