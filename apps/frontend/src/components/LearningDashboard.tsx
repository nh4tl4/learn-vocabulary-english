'use client';

import { useState, useEffect } from 'react';
import { vocabularyAPI, userAPI } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface DashboardData {
  user: {
    dailyGoal: number;
    currentStreak: number;
    longestStreak: number;
    totalWordsLearned: number;
  };
  todayProgress: {
    wordsLearned: number;
    wordsReviewed: number;
    totalProgress: number;
  };
  wordsToReview: number;
  difficultWords: number;
  masteredWords: number;
  totalLearned: number;
  progressPercentage: number;
}

export default function LearningDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [newGoal, setNewGoal] = useState(10);
  const router = useRouter();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const response = await vocabularyAPI.getDashboard();
      setDashboardData(response.data);
      setNewGoal(response.data.user.dailyGoal);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateDailyGoal = async () => {
    try {
      await userAPI.setDailyGoal(newGoal);
      setShowGoalModal(false);
      loadDashboardData();
    } catch (error) {
      console.error('Failed to update goal:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!dashboardData) return null;

  const { user, todayProgress, wordsToReview, difficultWords, masteredWords, progressPercentage } = dashboardData;

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Bảng Điều Khiển Học Tập</h1>
        <p className="text-gray-600 text-sm sm:text-base">Theo dõi tiến trình học từ vựng của bạn</p>
      </div>

      {/* Daily Progress Card */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-4 sm:p-6 text-white mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-0">Tiến Trình Hôm Nay</h2>
          <button
            onClick={() => setShowGoalModal(true)}
            className="bg-white/20 hover:bg-white/30 px-3 py-2 rounded-lg text-xs sm:text-sm transition-colors self-start"
          >
            Mục tiêu: {user.dailyGoal} từ
          </button>
        </div>

        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span>{todayProgress.totalProgress} / {user.dailyGoal} từ</span>
            <span>{progressPercentage}%</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-3">
            <div
              className="bg-white rounded-full h-3 transition-all duration-300"
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            ></div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold">{todayProgress.wordsLearned}</div>
            <div className="text-xs sm:text-sm opacity-80">Từ Mới</div>
          </div>
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold">{todayProgress.wordsReviewed}</div>
            <div className="text-xs sm:text-sm opacity-80">Đã Ôn Tập</div>
          </div>
        </div>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <ActionCard
          title="Học Từ Mới"
          description="Bắt đầu học từ vựng mới"
          count={`còn ${user.dailyGoal - todayProgress.wordsLearned} từ`}
          color="bg-green-500"
          onClick={() => router.push('/learn/new')}
        />

        <ActionCard
          title="Ôn Tập Từ"
          description="Ôn tập các từ đến hạn hôm nay"
          count={`${wordsToReview} từ`}
          color="bg-yellow-500"
          onClick={() => router.push('/learn/review')}
        />

        <ActionCard
          title="Làm Bài Kiểm Tra"
          description="Kiểm tra kiến thức của bạn"
          count="Trắc nghiệm"
          color="bg-purple-500"
          onClick={() => router.push('/learn/test')}
        />

        <ActionCard
          title="Từ Khó"
          description="Luyện tập các từ khó"
          count={`${difficultWords} từ`}
          color="bg-red-500"
          onClick={() => router.push('/learn/difficult')}
        />

        <ActionCard
          title="🤖 AI Chat Bot"
          description="Luyện tập tiếng Anh với AI"
          count="Trò chuyện thông minh"
          color="bg-purple-500"
          onClick={() => router.push('/learn/ai-chat')}
        />

        <ActionCard
          title="📚 Học Theo Chủ Đề"
          description="Học từ vựng theo chủ đề cụ thể"
          count="15+ chủ đề"
          color="bg-indigo-500"
          onClick={() => router.push('/learn/topics')}
        />
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <StatCard
          title="Chuỗi Hiện Tại"
          value={`${user.currentStreak} ngày`}
          subtitle={`Dài nhất: ${user.longestStreak} ngày`}
          icon="🔥"
        />

        <StatCard
          title="Từ Đã Thành Thạo"
          value={masteredWords.toString()}
          subtitle={`${Math.round((masteredWords / (masteredWords + wordsToReview + difficultWords)) * 100)}% đã học`}
          icon="⭐"
        />

        <StatCard
          title="Tổng Đã Học"
          value={user.totalWordsLearned.toString()}
          subtitle="Tất cả thời gian"
          icon="📚"
        />
      </div>

      {/* Goal Setting Modal */}
      {showGoalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md">
            <h3 className="text-lg sm:text-xl font-semibold mb-4">Đặt Mục Tiêu Hàng Ngày</h3>
            <p className="text-gray-600 mb-4 text-sm sm:text-base">Bạn muốn học bao nhiêu từ mỗi ngày?</p>

            <div className="mb-6">
              <input
                type="range"
                min="5"
                max="50"
                value={newGoal}
                onChange={(e) => setNewGoal(parseInt(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs sm:text-sm text-gray-500 mt-1">
                <span>5</span>
                <span className="font-semibold text-blue-600 text-sm sm:text-base">{newGoal} từ</span>
                <span>50</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowGoalModal(false)}
                className="flex-1 px-4 py-2 sm:py-3 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm sm:text-base"
              >
                Hủy
              </button>
              <button
                onClick={updateDailyGoal}
                className="flex-1 px-4 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm sm:text-base"
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Action Card Component
interface ActionCardProps {
  title: string;
  description: string;
  count: string;
  color: string;
  onClick: () => void;
}

function ActionCard({ title, description, count, color, onClick }: ActionCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className={`w-10 h-10 sm:w-12 sm:h-12 ${color} rounded-lg mb-3 sm:mb-4 flex items-center justify-center`}>
        <div className="w-5 h-5 sm:w-6 sm:h-6 bg-white rounded opacity-80"></div>
      </div>
      <h3 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">{title}</h3>
      <p className="text-gray-600 text-xs sm:text-sm mb-3">{description}</p>
      <div className="text-xs text-gray-500 font-medium">{count}</div>
    </div>
  );
}

// Stat Card Component
interface StatCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: string;
}

function StatCard({ title, value, subtitle, icon }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h3 className="font-semibold text-gray-800 text-sm sm:text-base">{title}</h3>
        <span className="text-xl sm:text-2xl">{icon}</span>
      </div>
      <div className="text-xl sm:text-2xl font-bold text-gray-800 mb-1">{value}</div>
      <div className="text-xs sm:text-sm text-gray-500">{subtitle}</div>
    </div>
  );
}
