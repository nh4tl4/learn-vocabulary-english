'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { HomeIcon, UserIcon, BookOpenIcon, AcademicCapIcon, ChartBarIcon } from '@heroicons/react/24/outline';

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
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <BookOpenIcon className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">
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
                      ? 'text-blue-600 bg-blue-50 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className="h-5 w-5 mr-2" />
                  {item.name}
                </button>
              );
            })}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <UserIcon className="h-5 w-5 text-gray-500" />
              <span className="text-sm text-gray-700">
                {user?.name || user?.email}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md hover:bg-gray-50 transition-colors duration-200"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href ||
                (item.href !== '/dashboard' && pathname.startsWith(item.href));

              return (
                <button
                  key={item.name}
                  onClick={() => router.push(item.href)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                    isActive
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
