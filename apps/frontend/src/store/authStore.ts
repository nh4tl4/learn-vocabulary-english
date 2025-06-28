import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Cookies from 'js-cookie';
import { User, AuthResponse } from '@/types';
import { authAPI, userAPI } from '@/lib/api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
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

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await authAPI.login(email, password);
          const { access_token, user }: AuthResponse = response.data;

          Cookies.set('auth_token', access_token, { expires: 7 });
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

          Cookies.set('auth_token', access_token, { expires: 7 });
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        Cookies.remove('auth_token');
        set({ user: null, isAuthenticated: false });
      },

      loadUser: async () => {
        const token = Cookies.get('auth_token');
        if (!token) {
          set({ isAuthenticated: false, user: null });
          return;
        }

        try {
          set({ isLoading: true });
          const response = await userAPI.getProfile();
          set({
            user: response.data,
            isAuthenticated: true,
            isLoading: false
          });
        } catch (error) {
          // Token không hợp lệ hoặc đã hết hạn
          Cookies.remove('auth_token');
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false
          });
        }
      },
    }),
    {
      name: 'auth-storage',
      // Chỉ persist user data, không persist token (vì đã lưu trong cookies)
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated
      }),
      // Khôi phục state và kiểm tra token khi load
      onRehydrate: async (state) => {
        if (state) {
          const token = Cookies.get('auth_token');
          if (token && state.isAuthenticated) {
            // Có token và state cho biết đã đăng nhập, verify lại
            try {
              const response = await userAPI.getProfile();
              state.user = response.data;
              state.isAuthenticated = true;
            } catch (error) {
              // Token không hợp lệ
              Cookies.remove('auth_token');
              state.user = null;
              state.isAuthenticated = false;
            }
          } else {
            // Không có token hoặc state chưa đăng nhập
            state.user = null;
            state.isAuthenticated = false;
          }
        }
      },
    }
  )
);
