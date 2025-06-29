'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import {
  HomeIcon,
  UserIcon,
  BookOpenIcon,
  AcademicCapIcon,
  ChartBarIcon,
  MapIcon,
  Bars3Icon,
  XMarkIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import ThemeToggle from './ThemeToggle';

export default function Navigation() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Không hiển thị navigation ở trang auth
  if (pathname.startsWith('/auth')) {
    return null;
  }

  // Chỉ hiển thị khi đã đăng nhập
  if (!isAuthenticated) {
    return null;
  }

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: HomeIcon,
    },
    // {
    //   name: 'Lộ trình',
    //   href: '/learn/roadmap',
    //   icon: MapIcon,
    // },
    // {
    //   name: 'Learn',
    //   href: '/learn',
    //   icon: BookOpenIcon,
    // },
    {
      name: 'Test',
      href: '/learn/test',
      icon: AcademicCapIcon,
    },
    {
      name: 'Progress',
      href: '/dashboard/progress',
      icon: ChartBarIcon,
    },
    {
      name: 'Chọn chủ đề',
      href: '/topics',
      icon: TagIcon,
    },
  ];

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  const handleNavigation = (href: string) => {
    router.push(href);
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 transition-colors duration-200 pt-safe-top">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14 sm:h-16">
          {/* Logo */}
          <div className="flex items-center">
            <button
              onClick={() => handleNavigation('/dashboard')}
              className="flex-shrink-0 flex items-center hover:opacity-80 transition-opacity duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg p-1"
            >
              <BookOpenIcon className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 dark:text-blue-400" />
              <span className="ml-2 text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                VocabLearn
              </span>
            </button>
          </div>

          {/* Desktop Navigation Items */}
          <div className="hidden md:flex md:items-center md:space-x-6 lg:space-x-8">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href ||
                (item.href !== '/dashboard' && pathname.startsWith(item.href));

              return (
                <button
                  key={item.name}
                  onClick={() => router.push(item.href)}
                  className={`inline-flex items-center px-2 lg:px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                    isActive
                      ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                      : 'text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <item.icon className="h-4 w-4 lg:h-5 lg:w-5 mr-1 lg:mr-2" />
                  <span className="hidden lg:inline">{item.name}</span>
                </button>
              );
            })}
          </div>

          {/* Desktop User Menu & Theme Toggle */}
          <div className="hidden md:flex md:items-center md:space-x-2 lg:space-x-4">
            <ThemeToggle />
            <div className="hidden lg:flex items-center space-x-2">
              <UserIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              <span className="text-sm text-gray-700 dark:text-gray-300 truncate max-w-24">
                {user?.name || user?.email}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white px-2 lg:px-3 py-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              <span className="hidden lg:inline">Đăng Xuất</span>
              <span className="lg:hidden">Exit</span>
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="block h-6 w-6" />
              ) : (
                <Bars3Icon className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href ||
                (item.href !== '/dashboard' && pathname.startsWith(item.href));

              return (
                <button
                  key={item.name}
                  onClick={() => handleNavigation(item.href)}
                  className={`w-full flex items-center px-3 py-3 rounded-md text-base font-medium transition-colors duration-200 ${
                    isActive
                      ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.name}
                </button>
              );
            })}
          </div>

          {/* Mobile user info and logout */}
          <div className="pt-4 pb-safe-bottom border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center px-5 py-3">
              <UserIcon className="h-5 w-5 text-gray-400 mr-3" />
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user?.name || 'User'}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {user?.email}
                </div>
              </div>
            </div>
            <div className="px-2 pb-2">
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-3 py-3 rounded-md text-base font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200"
              >
                <svg className="h-5 w-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
