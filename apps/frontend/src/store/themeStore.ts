import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState {
  isDark: boolean;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (isDark: boolean) => void;
  initializeTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      isDark: false, // Mặc định là light mode
      theme: 'light' as 'light' | 'dark',

      initializeTheme: () => {
        // Auto-detect system preference on first visit
        if (typeof window !== 'undefined') {
          const savedTheme = localStorage.getItem('theme-storage');
          if (!savedTheme) {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            set({ isDark: prefersDark, theme: prefersDark ? 'dark' : 'light' });
          }

          // Apply current theme to document
          const currentState = get();
          if (currentState.isDark) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
      },

      toggleTheme: () => {
        const newTheme = !get().isDark;
        const themeString = newTheme ? 'dark' : 'light';
        set({ isDark: newTheme, theme: themeString });

        // Cập nhật class cho document
        if (typeof window !== 'undefined') {
          if (newTheme) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
      },

      setTheme: (isDark: boolean) => {
        const themeString = isDark ? 'dark' : 'light';
        set({ isDark, theme: themeString });

        // Cập nhật class cho document
        if (typeof window !== 'undefined') {
          if (isDark) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
      },
    }),
    {
      name: 'theme-storage',
      onRehydrateStorage: () => (state) => {
        // Áp dụng theme sau khi restore từ storage
        if (state && typeof window !== 'undefined') {
          const themeString = state.isDark ? 'dark' : 'light';
          state.theme = themeString;

          if (state.isDark) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
      },
    }
  )
);
