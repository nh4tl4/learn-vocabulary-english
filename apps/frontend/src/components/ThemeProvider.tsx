'use client';

import React, { useEffect } from 'react';
import { useThemeStore } from '@/store/themeStore';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, initializeTheme } = useThemeStore();

  useEffect(() => {
    if (typeof initializeTheme === 'function') {
      initializeTheme();
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const root = document.documentElement;
      if (theme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [theme]);

  return <>{children}</>;
}
