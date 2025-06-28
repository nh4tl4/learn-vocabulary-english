'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { loadUser } = useAuthStore();

  useEffect(() => {
    // Tự động kiểm tra và load user khi app khởi động
    loadUser();
  }, [loadUser]);

  return <>{children}</>;
}
