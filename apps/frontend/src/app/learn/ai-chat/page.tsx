'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import AIChatBot from '@/components/AIChatBot';

export default function AIChatPage() {
  const { isAuthenticated, loadUser } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">🤖 AI Chat Bot</h1>
        <p className="text-gray-600 text-sm sm:text-base">
          Luyện tập tiếng Anh bằng cách trò chuyện với AI thông minh
        </p>
      </div>

      <AIChatBot />

      {/* Tips */}
      <div className="mt-6 bg-blue-50 p-4 rounded-lg">
        <h3 className="font-semibold text-blue-800 mb-2">💡 Mẹo sử dụng AI Chat:</h3>
        <ul className="text-blue-700 text-sm space-y-1">
          <li>• Hãy thử nói chuyện bằng tiếng Anh đơn giản</li>
          <li>• AI sẽ sửa lỗi ngữ pháp một cách nhẹ nhàng</li>
          <li>• Đặt câu hỏi về từ vựng hoặc ngữ pháp</li>
          <li>• Thực hành các tình huống giao tiếp hàng ngày</li>
        </ul>
      </div>
    </div>
  );
}
