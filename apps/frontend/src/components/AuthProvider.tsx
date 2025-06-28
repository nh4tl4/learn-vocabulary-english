"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { loadUser, isLoading, isInitialized } = useAuthStore();

  useEffect(() => {
    // Tự động kiểm tra và load user khi app khởi động
    const initializeAuth = async () => {
      if (!isInitialized && typeof loadUser === "function") {
        try {
          await loadUser();
        } catch (error) {
          console.error("Error initializing auth:", error);
        }
      }
    };

    initializeAuth();
  }, [isInitialized]); // Remove loadUser from dependency array

  // Hiển thị loading khi đang khôi phục authentication
  if (!isInitialized && isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 dark:border-blue-400"></div>
      </div>
    );
  }

  return <>{children}</>;
}
