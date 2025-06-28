import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Cookies from 'js-cookie';
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
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isInitialized: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await authAPI.login(email, password);
          const { access_token, user }: AuthResponse = response.data;

          Cookies.set('auth_token', access_token, { expires: 7, secure: true, sameSite: 'strict' });
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

          Cookies.set('auth_token', access_token, { expires: 7, secure: true, sameSite: 'strict' });
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        Cookies.remove('auth_token');
        set({ user: null, isAuthenticated: false, isInitialized: true });
      },

      loadUser: async () => {
        if (get().isInitialized) return;

        const token = Cookies.get('auth_token');
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
          Cookies.remove('auth_token');
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
      // Chỉ persist user data, không persist isLoading và isInitialized
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated
      }),
      // Đơn giản hóa rehydration
      onRehydrateStorage: () => (state) => {
        // Reset isInitialized để loadUser() có thể chạy lại
        if (state) {
          state.isInitialized = false;
          state.isLoading = false;
        }
      },
    }
  )
);
