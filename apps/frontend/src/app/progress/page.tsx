'use client';

import { useState, useEffect } from 'react';
import { vocabularyAPI, userAPI } from '@/lib/api';
import { ChartBarIcon, CalendarDaysIcon, TrophyIcon, FireIcon, BookOpenIcon, ClockIcon } from '@heroicons/react/24/outline';
import { useLevelStore } from '@/store/levelStore';

interface ProgressStats {
  totalLearned: number;
  totalReviewed: number;
  newWordsToday: number;
  reviewWordsToday: number;
  currentStreak: number;
  longestStreak: number;
  dailyGoal: number;
  progressPercentage: number;
  weeklyProgress: Array<{
    date: string;
    learned: number;
    reviewed: number;
  }>;
  topicProgress: Array<{
    topic: string;
    topicVi: string;
    learned: number;
    total: number;
    percentage: number;
  }>;
  recentActivity: Array<{
    date: string;
    type: string;
    count: number;
    accuracy?: number;
  }>;
  accuracyStats: {
    overall: number;
    thisWeek: number;
    thisMonth: number;
  };
}

export default function ProgressPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ProgressStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'topics' | 'activity'>('overview');
  const { selectedLevel } = useLevelStore();

  useEffect(() => {
    loadProgressData();
  }, [selectedLevel]);

  const loadProgressData = async () => {
    try {
      setLoading(true);
      setError(null);

      const levelParam = selectedLevel === 'all' ? undefined : selectedLevel;
      const [progressResponse, dashboardResponse] = await Promise.all([
        vocabularyAPI.getUserProgress(levelParam),
        vocabularyAPI.getLearningDashboard()
      ]);

      // Combine data from both APIs
      const progressData = progressResponse.data;
      const dashboardData = dashboardResponse.data;

      console.log('Dashboard data:', dashboardData); // Debug log

      setStats({
        // Fix: Get data from correct paths
        totalLearned: dashboardData.totalLearned || dashboardData.user?.totalWordsLearned || 0,
        totalReviewed: dashboardData.todayProgress?.wordsReviewed || 0,
        newWordsToday: dashboardData.todayProgress?.wordsLearned || 0,
        reviewWordsToday: dashboardData.todayProgress?.wordsReviewed || 0,
        currentStreak: dashboardData.user?.currentStreak || 0,
        longestStreak: dashboardData.user?.longestStreak || 0,
        dailyGoal: dashboardData.user?.dailyGoal || 10,
        progressPercentage: dashboardData.progressPercentage || 0,
        weeklyProgress: dashboardData.weeklyProgress || [],
        topicProgress: progressData.topicProgress || [],
        recentActivity: dashboardData.recentActivity || [],
        accuracyStats: {
          overall: progressData.accuracyStats?.overall || 0,
          thisWeek: progressData.accuracyStats?.thisWeek || 0,
          thisMonth: progressData.accuracyStats?.thisMonth || 0,
        }
      });
    } catch (error) {
      console.error('Failed to load progress data:', error);
      setError('Không thể tải dữ liệu tiến độ. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Đang tải tiến độ học tập...</p>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Có lỗi xảy ra</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <button
            onClick={loadProgressData}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
            Tiến Độ Học Tập
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {selectedLevel === 'all' ? 'Tất cả cấp độ' : `Cấp độ: ${selectedLevel}`}
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Learned */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
                <BookOpenIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Tổng từ đã học</h3>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.totalLearned}</p>
              </div>
            </div>
          </div>

          {/* Current Streak */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-full">
                <FireIcon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Streak hiện tại</h3>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.currentStreak} ngày</p>
              </div>
            </div>
          </div>

          {/* Today's Progress */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                <ChartBarIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Hôm nay</h3>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">
                  {stats.newWordsToday}/{stats.dailyGoal}
                </p>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(stats.progressPercentage, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Overall Accuracy */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
                <TrophyIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Độ chính xác</h3>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.accuracyStats.overall}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-200 dark:bg-gray-700 rounded-lg p-1 mb-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'overview'
                ? 'bg-white dark:bg-gray-800 text-gray-800 dark:text-white shadow'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white'
            }`}
          >
            Tổng quan
          </button>
          <button
            onClick={() => setActiveTab('topics')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'topics'
                ? 'bg-white dark:bg-gray-800 text-gray-800 dark:text-white shadow'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white'
            }`}
          >
            Theo chủ đề
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'activity'
                ? 'bg-white dark:bg-gray-800 text-gray-800 dark:text-white shadow'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white'
            }`}
          >
            Hoạt động
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Weekly Progress Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
                Tiến độ 7 ngày qua
              </h3>
              <div className="grid grid-cols-7 gap-2">
                {stats.weeklyProgress.map((day, index) => (
                  <div key={index} className="text-center">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                      {new Date(day.date).toLocaleDateString('vi-VN', { weekday: 'short' })}
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
                      <div className="text-sm font-medium text-green-600 dark:text-green-400">
                        {day.learned}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">học</div>
                      <div className="text-sm font-medium text-blue-600 dark:text-blue-400 mt-1">
                        {day.reviewed}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">ôn</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Accuracy Breakdown */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
                Độ chính xác theo thời gian
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-2xl font-bold text-gray-800 dark:text-white">
                    {stats.accuracyStats.overall}%
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Tổng thể</div>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-2xl font-bold text-gray-800 dark:text-white">
                    {stats.accuracyStats.thisWeek}%
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Tuần này</div>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-2xl font-bold text-gray-800 dark:text-white">
                    {stats.accuracyStats.thisMonth}%
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Tháng này</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'topics' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
              Tiến độ theo chủ đề
            </h3>
            <div className="space-y-4">
              {stats.topicProgress.map((topic, index) => (
                <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium text-gray-800 dark:text-white">
                      {topic.topicVi || topic.topic}
                    </h4>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {topic.learned}/{topic.total}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${topic.percentage}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {topic.percentage}% hoàn thành
                  </div>
                </div>
              ))}
              {stats.topicProgress.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  Chưa có dữ liệu tiến độ theo chủ đề
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
              Hoạt động gần đây
            </h3>
            <div className="space-y-3">
              {stats.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full mr-3">
                      <ClockIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-800 dark:text-white">
                        {activity.type === 'learn' ? 'Học từ mới' : 'Ôn tập'}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(activity.date).toLocaleDateString('vi-VN')}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-800 dark:text-white">
                      {activity.count} từ
                    </div>
                    {activity.accuracy && (
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {activity.accuracy}% chính xác
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {stats.recentActivity.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  Chưa có hoạt động nào
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
