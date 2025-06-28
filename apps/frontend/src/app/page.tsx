'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import ConnectionTest from '@/components/ConnectionTest';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, loadUser } = useAuthStore();
  const [showConnectionTest, setShowConnectionTest] = useState(true);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  useEffect(() => {
    // Add delay to show connection test first
    const timer = setTimeout(() => {
      if (isAuthenticated) {
        router.push('/dashboard');
      } else {
        router.push('/auth');
      }
    }, 3000); // 3 second delay to show connection test

    return () => clearTimeout(timer);
  }, [isAuthenticated, router]);

  if (showConnectionTest) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">
          English Vocabulary Learning App
        </h1>
        <ConnectionTest />
        <div className="mt-6 text-center">
          <p className="text-gray-600 mb-2">Testing backend connection...</p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
    </div>
  );
}
