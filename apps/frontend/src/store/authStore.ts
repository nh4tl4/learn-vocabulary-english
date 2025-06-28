import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, AuthResponse } from '@/types';
import { authAPI, userAPI } from '@/lib/api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  loadUser: () => Promise<void>;
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

      loadUser: async () => {
        if (get().isInitialized) return;

        const token = get().getToken();
        if (!token) {
          set({ isAuthenticated: false, user: null, isInitialized: true });
          return;
        }

        try {
          set({ isLoading: true });
          const response = await userAPI.getProfile();
          set({
            user: response.data,
            isAuthenticated: true,
            isLoading: false,
            isInitialized: true
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
            isInitialized: true
          });
        }
      },
    }),
    {
      name: 'auth-storage',
      // Persist user data but not token (token is in localStorage)
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated
      }),
      // Reset initialization on rehydration
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isInitialized = false;
          state.isLoading = false;
        }
      },
    }
  )
);
