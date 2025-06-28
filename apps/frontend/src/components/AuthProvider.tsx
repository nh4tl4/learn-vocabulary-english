'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { loadUser, isLoading, isInitialized } = useAuthStore();

  useEffect(() => {
    // Tự động kiểm tra và load user khi app khởi động
    if (!isInitialized) {
      loadUser();
    }
  }, [loadUser, isInitialized]);

  // Hiển thị loading khi đang khôi phục authentication
  if (!isInitialized && isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return <>{children}</>;
}
