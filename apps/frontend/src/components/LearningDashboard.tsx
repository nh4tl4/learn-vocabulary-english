'use client';

import { useState, useEffect } from 'react';
import { vocabularyAPI, userAPI } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useLevelStore } from '@/store/levelStore';

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
  const { selectedLevel } = useLevelStore();

  useEffect(() => {
    loadDashboardData();
  }, [selectedLevel]);

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
      <div className="flex items-center justify-center min-h-mobile">
        <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!dashboardData) return null;

  const { user, todayProgress, wordsToReview, difficultWords, masteredWords, progressPercentage } = dashboardData;

  return (
    <div className="max-w-6xl mx-auto py-4 sm:py-6 lg:py-8 spacing-mobile">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
            <span className="text-xl sm:text-2xl">📊</span>
          </div>
          <h1 className="text-responsive-xl font-bold text-gray-800 dark:text-white">
            Bảng Điều Khiển Học Tập
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400 text-responsive-sm ml-11 sm:ml-13">
          Theo dõi tiến trình học từ vựng của bạn
        </p>
      </div>

      {/* Daily Progress Card */}
      <div className="card-mobile bg-gradient-to-r from-blue-500 to-purple-600 text-white mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <h2 className="text-responsive-lg font-semibold mb-2 sm:mb-0">Tiến Trình Hôm Nay</h2>
          <button
            onClick={() => setShowGoalModal(true)}
            className="btn-touch bg-white/20 hover:bg-white/30 px-3 py-2 rounded-lg text-responsive-sm transition-colors self-start sm:self-auto"
          >
            Mục tiêu: {user.dailyGoal} từ
          </button>
        </div>

        <div className="mb-4">
          <div className="flex justify-between text-responsive-sm mb-2">
            <span>{todayProgress.totalProgress} / {user.dailyGoal} từ</span>
            <span>{progressPercentage}%</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2 sm:h-3">
            <div
              className="bg-white rounded-full h-2 sm:h-3 transition-all duration-300"
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            ></div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-responsive-xl font-bold">{todayProgress.wordsLearned}</div>
            <div className="text-responsive-sm opacity-80">Từ Mới</div>
          </div>
          <div className="text-center">
            <div className="text-responsive-xl font-bold">{todayProgress.wordsReviewed}</div>
            <div className="text-responsive-sm opacity-80">Đã Ôn Tập</div>
          </div>
        </div>
      </div>

      {/* New Feature Highlight - Learning Roadmap */}
      <div className="card-mobile bg-gradient-to-r from-indigo-500 to-purple-600 text-white mb-6 border-2 border-yellow-400 shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center space-x-3 sm:space-x-4">
            <div className="text-2xl sm:text-4xl">🎯</div>
            <div className="flex-1">
              <h3 className="text-responsive-lg font-bold mb-1">✨ Tính năng mới: Lộ trình học tập</h3>
              <p className="text-responsive-sm opacity-90">
                Học từ vựng một cách có hệ thống từ cơ bản đến nâng cao
              </p>
            </div>
          </div>
          <button
            onClick={() => router.push('/learn/roadmap')}
            className="btn-touch w-full sm:w-auto bg-yellow-500 hover:bg-yellow-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition-colors shadow-lg text-responsive-sm"
          >
            Khám phá ngay
          </button>
        </div>
      </div>

      {/* Action Cards */}
      <div className="grid-responsive mb-8">
        <ActionCard
          title="Học Từ Mới"
          description="Bắt đầu học từ vựng mới"
          count={`còn ${Math.max(0, user.dailyGoal - todayProgress.wordsLearned)} từ`}
          color="bg-green-500"
          icon="📖"
          onClick={() => router.push('/learn/new')}
        />

        <ActionCard
            title="Học Theo Chủ Đề"
            description="Học từ vựng theo chủ đề cụ thể"
            count="15+ chủ đề"
            color="bg-indigo-500"
            icon="📚"
            onClick={() => router.push('/learn/topics')}
        />

        <ActionCard
          title="Ôn Tập Từ"
          description="Ôn tập các từ đến hạn hôm nay"
          count={`${wordsToReview} từ`}
          color="bg-yellow-500"
          icon="🔄"
          onClick={() => router.push('/learn/review')}
        />

        <ActionCard
          title="Làm Bài Kiểm Tra"
          description="Kiểm tra kiến thức của bạn"
          count="Trắc nghiệm"
          color="bg-purple-500"
          icon="📝"
          onClick={() => router.push('/learn/test')}
        />

        <ActionCard
          title="Từ Khó"
          description="Luyện tập các từ khó"
          count={`${difficultWords} từ`}
          color="bg-red-500"
          icon="💪"
          onClick={() => router.push('/learn/difficult')}
        />

        <ActionCard
          title="AI Chat Bot"
          description="Luyện tập tiếng Anh với AI"
          count="Trò chuyện thông minh"
          color="bg-purple-500"
          icon="🤖"
          onClick={() => router.push('/learn/ai-chat')}
        />

      </div>

      {/* Statistics Grid */}
      <div className="grid-responsive-2">
        <StatCard
          title="Chuỗi Hiện Tại"
          value={`${user.currentStreak} ngày`}
          subtitle={`Dài nhất: ${user.longestStreak} ngày`}
          icon="🔥"
        />

        <StatCard
          title="Từ Đã Thành Thạo"
          value={masteredWords.toString()}
          subtitle={`${Math.round((masteredWords / (masteredWords + wordsToReview + difficultWords)) * 100) || 0 }% đã học`}
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
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="p-6">
              <h3 className="text-responsive-lg font-semibold mb-4 text-gray-900 dark:text-white">
                Đặt Mục Tiêu Hàng Ngày
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 text-responsive-sm">
                Bạn muốn học bao nhiêu từ mỗi ngày?
              </p>

              <div className="mb-6">
                <input
                  type="range"
                  min="5"
                  max="50"
                  value={newGoal}
                  onChange={(e) => setNewGoal(parseInt(e.target.value))}
                  className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 slider-thumb"
                />
                <div className="flex justify-between text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-2">
                  <span>5</span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400 text-responsive-sm">
                    {newGoal} từ
                  </span>
                  <span>50</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setShowGoalModal(false)}
                  className="btn-touch flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-responsive-sm text-gray-900 dark:text-white transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={updateDailyGoal}
                  className="btn-touch flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-responsive-sm transition-colors"
                >
                  Lưu
                </button>
              </div>
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
  icon: string;
  onClick: () => void;
}

function ActionCard({ title, description, count, color, icon, onClick }: ActionCardProps) {
  return (
    <div
      onClick={onClick}
      className="card-mobile hover:shadow-md transition-all duration-200 cursor-pointer transform hover:scale-105 active:scale-95"
    >
      <div className={`w-12 h-12 sm:w-14 sm:h-14 ${color} rounded-xl mb-4 flex items-center justify-center shadow-sm`}>
        <span className="text-lg sm:text-xl">{icon}</span>
      </div>
      <h3 className="font-semibold text-gray-800 dark:text-white mb-2 text-responsive-sm">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mb-3 text-ellipsis-2">{description}</p>
      <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-500 font-medium">{count}</div>
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
    <div className="card-mobile">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-gray-600 dark:text-gray-400 text-responsive-sm">{title}</h3>
        <span className="text-lg sm:text-xl">{icon}</span>
      </div>
      <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">{value}</div>
      <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-500">{subtitle}</div>
    </div>
  );
}
