"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { quickAuth, isLoading, isInitialized } = useAuthStore();

  useEffect(() => {
    // Sử dụng quickAuth để khởi tạo nhanh hơn
    if (!isInitialized) {
      quickAuth();
    }
  }, [quickAuth, isInitialized]);

  // Hiển thị skeleton loading thay vì spinner
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-pulse space-y-4">
          <div className="h-12 w-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
