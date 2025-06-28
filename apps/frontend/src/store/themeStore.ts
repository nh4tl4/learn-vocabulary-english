import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState {
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (isDark: boolean) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      isDark: false, // Mặc định là light mode

      toggleTheme: () => {
        const newTheme = !get().isDark;
        set({ isDark: newTheme });

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
        set({ isDark });

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
