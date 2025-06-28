'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { userAPI, vocabularyAPI } from '@/lib/api';
import { UserStats, UserVocabulary } from '@/types';
import { toast } from 'react-hot-toast';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [recentProgress, setRecentProgress] = useState<UserVocabulary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth');
      return;
    }

    loadDashboardData();
  }, [isAuthenticated, router]);

  const loadDashboardData = async () => {
    try {
      const [statsResponse, progressResponse] = await Promise.all([
        userAPI.getStats(),
        vocabularyAPI.getProgress(),
      ]);

      setStats(statsResponse.data);
      setRecentProgress(progressResponse.data.slice(0, 5));
    } catch (error) {
      toast.error('Không thể tải dữ liệu dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Xin chào, {user?.name}!
              </h1>
              <p className="text-gray-600">Hôm nay bạn muốn học từ vựng gì?</p>
            </div>
            <button
              onClick={logout}
              className="text-gray-500 hover:text-gray-700 font-medium"
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">✓</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Đã học thuộc
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.stats.totalLearned}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">📚</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Đã ôn tập
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.stats.totalReviewed}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">%</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Độ chính xác
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.stats.accuracy}%
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">🎯</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Tổng câu đúng
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.stats.correctAnswers}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Bắt đầu học từ vựng mới
              </h3>
              <p className="text-gray-600 mb-4">
                Học những từ vựng mới với các bài tập tương tác
              </p>
              <button
                onClick={() => router.push('/learn')}
                className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                Bắt đầu học
              </button>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Ôn tập từ vựng
              </h3>
              <p className="text-gray-600 mb-4">
                Ôn tập lại những từ vựng đã học để ghi nhớ lâu hơn
              </p>
              <button
                onClick={() => router.push('/learn?mode=review')}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                Ôn tập
              </button>
            </div>
          </div>
        </div>

        {/* Recent Progress */}
        {recentProgress.length > 0 && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Tiến độ gần đây
              </h3>
              <div className="space-y-4">
                {recentProgress.map((progress) => (
                  <div key={progress.id} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {progress.vocabulary?.word}
                      </p>
                      <p className="text-sm text-gray-500">
                        {progress.vocabulary?.meaning}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-green-600">
                        ✓ {progress.correctCount}
                      </span>
                      <span className="text-sm text-red-600">
                        ✗ {progress.incorrectCount}
                      </span>
                      {progress.isLearned && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Đã thuộc
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
