'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { HomeIcon, UserIcon, BookOpenIcon, AcademicCapIcon, ChartBarIcon, MapIcon } from '@heroicons/react/24/outline';
import ThemeToggle from './ThemeToggle';

export default function Navigation() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuthStore();

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
    {
      name: 'Lộ trình',
      href: '/learn/roadmap',
      icon: MapIcon,
    },
    {
      name: 'Learn',
      href: '/learn',
      icon: BookOpenIcon,
    },
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
  ];

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <BookOpenIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">
                VocabLearn
              </span>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href ||
                (item.href !== '/dashboard' && pathname.startsWith(item.href));

              return (
                <button
                  key={item.name}
                  onClick={() => router.push(item.href)}
                  className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                    isActive
                      ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-b-2 border-blue-600 dark:border-blue-400'
                      : 'text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <item.icon className="h-5 w-5 mr-2" />
                  {item.name}
                </button>
              );
            })}
          </div>

          {/* User Menu & Theme Toggle */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle Button */}
            <ThemeToggle />

            <div className="flex items-center space-x-2">
              <UserIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {user?.name || user?.email}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white px-3 py-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              Logout
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />
            <button
              onClick={handleLogout}
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white px-3 py-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
