'use client';

import { useEffect } from 'react';
import { useThemeStore } from '@/store/themeStore';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';

export default function ThemeToggle() {
  const { isDark, toggleTheme, setTheme } = useThemeStore();

  // Khởi tạo theme khi component mount
  useEffect(() => {
    // Detect system preference nếu chưa có setting
    if (typeof window !== 'undefined' && !localStorage.getItem('theme-storage')) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark);
    }
  }, [setTheme]);

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
      title={isDark ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'}
    >
      {isDark ? (
        <SunIcon className="h-5 w-5 text-yellow-500" />
      ) : (
        <MoonIcon className="h-5 w-5 text-gray-600" />
      )}
    </button>
  );
}
