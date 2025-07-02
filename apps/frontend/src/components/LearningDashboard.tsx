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
    totalTestsTaken: number;
    averageTestScore: number;
    lastStudyDate: string;
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
  const [showWordsModal, setShowWordsModal] = useState(false);
  const [modalType, setModalType] = useState<'learned' | 'reviewed'>('learned');
  const [modalWords, setModalWords] = useState<any[]>([]);
  const [modalLoading, setModalLoading] = useState(false);
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

  const openWordsModal = async (type: 'learned' | 'reviewed') => {
    console.log('Opening words modal for type:', type);
    setModalType(type);
    setModalLoading(true);
    setShowWordsModal(true); // Hiển thị modal ngay lập tức

    try {
      let response;
      if (type === 'learned') {
        console.log('Calling getTodayLearnedWords API...');
        response = await vocabularyAPI.getTodayLearnedWords();
      } else {
        console.log('Calling getTodayReviewedWords API...');
        response = await vocabularyAPI.getTodayReviewedWords();
      }

      console.log('API Response:', response.data);
      setModalWords(response.data || []);
    } catch (error) {
      console.error('Failed to load words:', error);
      // Hiển thị thông báo lỗi cho user
      setModalWords([]);
    } finally {
      setModalLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl">📚</span>
            </div>
          </div>
          <p className="mt-4 text-gray-600 dark:text-gray-300 font-medium">Đang tải dashboard...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) return null;

  const { user, todayProgress, wordsToReview, difficultWords, masteredWords, progressPercentage } = dashboardData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
      <div className="max-w-7xl mx-auto px-4 py-6 lg:py-8">
        {/* Enhanced Header with Welcome Message */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-2xl">🎯</span>
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                </div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
                    Chào mừng trở lại! 👋
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 text-sm lg:text-base">
                    Hãy tiếp tục hành trình học từ vựng của bạn
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-500">{user.currentStreak}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Streak</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">{user.totalWordsLearned}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Tổng từ</div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Daily Progress Card */}
        <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-2xl p-6 lg:p-8 text-white mb-8 shadow-2xl relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-4 right-4 text-6xl">📈</div>
            <div className="absolute bottom-4 left-4 text-4xl">✨</div>
          </div>

          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
              <div>
                <h2 className="text-xl lg:text-2xl font-bold mb-2 flex items-center gap-2">
                  <span className="inline-block animate-pulse">🌟</span>
                  Tiến Trình Hôm Nay
                </h2>
                <p className="text-blue-100 text-sm flex items-center gap-2">
                  <span className="opacity-75">📅</span>
                  {new Date().toLocaleDateString('vi-VN', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <button
                onClick={() => setShowGoalModal(true)}
                className="group mt-4 lg:mt-0 bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 hover:scale-105 border border-white/20 hover:border-white/40 shadow-lg hover:shadow-xl"
              >
                <span className="flex items-center gap-2">
                  <span className="group-hover:animate-bounce">🎯</span>
                  <span>Mục tiêu: <span className="font-bold">{user.dailyGoal}</span> từ</span>
                </span>
              </button>
            </div>

            {/* Enhanced Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between items-center text-sm mb-3">
                <span className="font-medium flex items-center gap-2">
                  <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
                  {todayProgress.wordsLearned} / {user.dailyGoal} từ
                </span>
                <div className="flex items-center gap-2">
                  <span className={`font-bold text-lg ${progressPercentage >= 100 ? 'text-green-300' : progressPercentage >= 75 ? 'text-yellow-300' : 'text-white'}`}>
                    {progressPercentage}%
                  </span>
                  {progressPercentage >= 100 && <span className="animate-bounce">🎉</span>}
                </div>
              </div>

              {/* Progress Bar Container */}
              <div className="relative">
                <div className="w-full bg-white/20 rounded-full h-4 backdrop-blur-sm shadow-inner border border-white/10">
                  <div
                    className={`bg-gradient-to-r ${
                      progressPercentage >= 100 
                        ? 'from-green-400 via-emerald-400 to-teal-400' 
                        : progressPercentage >= 75 
                        ? 'from-yellow-400 via-orange-400 to-red-400'
                        : 'from-yellow-400 to-orange-400'
                    } rounded-full h-4 transition-all duration-700 ease-out shadow-lg relative overflow-hidden`}
                    style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                  >
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>

                    {/* Glow effect for completion */}
                    {progressPercentage >= 100 && (
                      <div className="absolute inset-0 bg-gradient-to-r from-green-300/50 to-emerald-300/50 animate-pulse"></div>
                    )}
                  </div>
                </div>

                {/* Progress milestones */}
                <div className="absolute top-0 left-0 w-full h-4 flex items-center">
                  {[25, 50, 75].map((milestone) => (
                    <div
                      key={milestone}
                      className={`absolute w-1 h-6 ${
                        progressPercentage >= milestone ? 'bg-white/80' : 'bg-white/30'
                      } rounded-full transition-all duration-500`}
                      style={{ left: `${milestone}%`, transform: 'translateX(-50%)' }}
                    ></div>
                  ))}
                </div>
              </div>

              {/* Progress message */}
              <div className="mt-3 text-center">
                <p className="text-blue-100 text-xs font-medium">
                  {progressPercentage >= 100
                    ? "🎉 Xuất sắc! Bạn đã hoàn thành mục tiêu hôm nay!"
                    : progressPercentage >= 75
                    ? "💪 Sắp xong rồi! Cố gắng thêm chút nữa nhé!"
                    : progressPercentage >= 50
                    ? "⚡ Đang tiến bộ tốt! Tiếp tục phát huy nhé!"
                    : progressPercentage > 0
                    ? "🚀 Khởi đầu tốt! Hãy tiếp tục học thêm nhé!"
                    : "🌅 Hãy bắt đầu hành trình học tập ngày mới!"}
                </p>
              </div>
            </div>

            {/* Enhanced Today's Stats - Clickable */}
            <div className="grid grid-cols-2 gap-6">
              <div
                onClick={() => openWordsModal('learned')}
                className="group bg-white/10 hover:bg-white/15 backdrop-blur-sm rounded-2xl p-5 border border-white/20 hover:border-white/30 transition-all duration-300 hover:scale-105 hover:shadow-2xl relative overflow-hidden cursor-pointer"
              >
                {/* Animated background */}
                <div className="absolute inset-0 bg-gradient-to-br from-green-400/10 to-emerald-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-3xl lg:text-4xl font-bold text-white drop-shadow-lg">
                      {todayProgress.wordsLearned}
                    </div>
                    <div className="w-10 h-10 bg-green-400/20 rounded-full flex items-center justify-center group-hover:animate-pulse">
                      <span className="text-lg">📖</span>
                    </div>
                  </div>
                  <div className="text-blue-100 text-sm flex items-center gap-2 font-medium">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    <span>Từ Mới Học</span>
                  </div>
                  <div className="mt-2 text-xs text-green-300 opacity-80">
                    {todayProgress.wordsLearned > 0 ? (
                      <>+{todayProgress.wordsLearned} từ hôm nay ✨</>
                    ) : (
                      <>Chưa học từ nào hôm nay</>
                    )}
                    <span className="block mt-1 opacity-60">Click để xem danh sách</span>
                  </div>
                </div>
              </div>

              <div
                onClick={() => openWordsModal('reviewed')}
                className="group bg-white/10 hover:bg-white/15 backdrop-blur-sm rounded-2xl p-5 border border-white/20 hover:border-white/30 transition-all duration-300 hover:scale-105 hover:shadow-2xl relative overflow-hidden cursor-pointer"
              >
                {/* Animated background */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-purple-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-3xl lg:text-4xl font-bold text-white drop-shadow-lg">
                      {todayProgress.wordsReviewed}
                    </div>
                    <div className="w-10 h-10 bg-blue-400/20 rounded-full flex items-center justify-center group-hover:animate-spin">
                      <span className="text-lg">🔄</span>
                    </div>
                  </div>
                  <div className="text-blue-100 text-sm flex items-center gap-2 font-medium">
                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
                    <span>Đã Ôn Tập</span>
                  </div>
                  <div className="mt-2 text-xs text-blue-300 opacity-80">
                    {todayProgress.wordsReviewed > 0 ? (
                      <>+{todayProgress.wordsReviewed} từ đã ôn ✨</>
                    ) : (
                      <>Chưa ôn tập từ nào hôm nay</>
                    )}
                    <span className="block mt-1 opacity-60">Click để xem danh sách</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Achievement notification */}
            {progressPercentage >= 100 && (
              <div className="mt-6 bg-gradient-to-r from-green-400/20 to-emerald-400/20 border border-green-400/30 rounded-2xl p-4 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="text-2xl animate-bounce">🏆</div>
                  <div>
                    <p className="text-green-200 font-semibold text-sm">Thành tích mở khóa!</p>
                    <p className="text-green-100 text-xs opacity-90">Bạn đã hoàn thành mục tiêu học tập hôm nay</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Action Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <ActionCard
            title="Học Từ Mới"
            description="Khám phá từ vựng mới hôm nay"
            count={`Còn ${Math.max(0, user.dailyGoal - todayProgress.wordsLearned) || 0} từ`}
            gradient="from-green-500 to-emerald-600"
            icon="📖"
            iconBg="bg-green-100 dark:bg-green-900"
            onClick={() => router.push('/learn/new')}
            badge={Math.max(0, user.dailyGoal - todayProgress.wordsLearned) > 0 ? "Còn việc!" : "Hoàn thành!"}
            badgeColor={Math.max(0, user.dailyGoal - todayProgress.wordsLearned) > 0 ? "bg-orange-500" : "bg-green-500"}
          />

          <ActionCard
            title="Học Theo Chủ Đề"
            description="Học từ vựng theo chủ đề yêu thích"
            count="15+ chủ đề"
            gradient="from-indigo-500 to-purple-600"
            icon="📚"
            iconBg="bg-indigo-100 dark:bg-indigo-900"
            onClick={() => router.push('/learn/topics')}
            badge="Phổ biến"
            badgeColor="bg-purple-500"
          />

          <ActionCard
            title="Ôn Tập Từ"
            description="Ôn tập các từ cần nhớ lại"
            count={`${wordsToReview || 0} từ`}
            gradient="from-yellow-500 to-orange-600"
            icon="🔄"
            iconBg="bg-yellow-100 dark:bg-yellow-900"
            onClick={() => router.push('/learn/review')}
            badge={wordsToReview > 0 ? "Cần ôn!" : "Tốt!"}
            badgeColor={wordsToReview > 0 ? "bg-red-500" : "bg-green-500"}
          />

          <ActionCard
            title="Làm Bài Kiểm Tra"
            description="Đánh giá kiến thức đã học"
            count="Trắc nghiệm"
            gradient="from-purple-500 to-pink-600"
            icon="📝"
            iconBg="bg-purple-100 dark:bg-purple-900"
            onClick={() => router.push('/learn/test')}
            badge="Thử thách"
            badgeColor="bg-pink-500"
          />

          <ActionCard
            title="Từ Khó"
            description="Luyện tập từ vựng khó nhớ"
            count={`${difficultWords || 0} từ`}
            gradient="from-red-500 to-rose-600"
            icon="💪"
            iconBg="bg-red-100 dark:bg-red-900"
            onClick={() => router.push('/learn/difficult')}
            badge={difficultWords > 0 ? "Cần luyện" : "Tuyệt vời!"}
            badgeColor={difficultWords > 0 ? "bg-orange-500" : "bg-green-500"}
          />

          <ActionCard
            title="AI Chat Bot"
            description="Trò chuyện với AI để luyện tập"
            count="Thông minh"
            gradient="from-cyan-500 to-blue-600"
            icon="🤖"
            iconBg="bg-cyan-100 dark:bg-cyan-900"
            onClick={() => router.push('/learn/ai-chat')}
            badge="Mới!"
            badgeColor="bg-cyan-500"
          />
        </div>

        {/* Enhanced Statistics Overview */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 lg:p-8 shadow-xl border border-white/20 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-xl">📊</span>
            </div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">Thống Kê Tổng Quan</h3>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard
              title="Tổng Từ Đã Học"
              value={user.totalWordsLearned}
              icon="📚"
              color="text-blue-600"
              bgColor="bg-blue-50 dark:bg-blue-900/30"
            />
            <StatCard
              title="Từ Đã Thành Thạo"
              value={masteredWords}
              icon="🏆"
              color="text-green-600"
              bgColor="bg-green-50 dark:bg-green-900/30"
            />
            <StatCard
              title="Streak Hiện Tại"
              value={`${user.currentStreak} ngày`}
              icon="🔥"
              color="text-orange-600"
              bgColor="bg-orange-50 dark:bg-orange-900/30"
            />
            <StatCard
              title="Streak Cao Nhất"
              value={`${user.longestStreak} ngày`}
              icon="⭐"
              color="text-purple-600"
              bgColor="bg-purple-50 dark:bg-purple-900/30"
            />
          </div>

          {/* Test Statistics Section */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-rose-600 rounded-lg flex items-center justify-center">
                <span className="text-lg">📝</span>
              </div>
              <h4 className="text-lg font-semibold text-gray-800 dark:text-white">Thống Kê Kiểm Tra</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <StatCard
                title="Tổng Bài Test"
                value={user.totalTestsTaken || 0}
                icon="📝"
                color="text-pink-600"
                bgColor="bg-pink-50 dark:bg-pink-900/30"
              />
              <StatCard
                title="Điểm Trung Bình"
                value={user.averageTestScore ? `${user.averageTestScore}%` : 'Chưa có'}
                icon="🎯"
                color="text-indigo-600"
                bgColor="bg-indigo-50 dark:bg-indigo-900/30"
              />
              <StatCard
                title="Lần Học Cuối"
                value={user.lastStudyDate ? new Date(user.lastStudyDate).toLocaleDateString('vi-VN') : 'Chưa có'}
                icon="📅"
                color="text-teal-600"
                bgColor="bg-teal-50 dark:bg-teal-900/30"
              />
            </div>

            {/* Performance indicator */}
            {user.averageTestScore && (
              <div className="mt-4 p-4 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      user.averageTestScore >= 80 ? 'bg-green-100 dark:bg-green-900/30' :
                      user.averageTestScore >= 60 ? 'bg-yellow-100 dark:bg-yellow-900/30' : 
                      'bg-red-100 dark:bg-red-900/30'
                    }`}>
                      <span className="text-lg">
                        {user.averageTestScore >= 80 ? '🌟' :
                         user.averageTestScore >= 60 ? '👍' : '📈'}
                      </span>
                    </div>
                    <div>
                      <p className={`font-medium ${
                        user.averageTestScore >= 80 ? 'text-green-700 dark:text-green-300' :
                        user.averageTestScore >= 60 ? 'text-yellow-700 dark:text-yellow-300' : 
                        'text-red-700 dark:text-red-300'
                      }`}>
                        {user.averageTestScore >= 80 ? 'Xuất sắc!' :
                         user.averageTestScore >= 60 ? 'Tốt!' : 'Cần cải thiện'}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {user.averageTestScore >= 80 ? 'Kết quả học tập rất tốt' :
                         user.averageTestScore >= 60 ? 'Tiếp tục phát huy' : 'Hãy ôn tập thêm nhé'}
                      </p>
                    </div>
                  </div>
                  <div className={`text-2xl font-bold ${
                    user.averageTestScore >= 80 ? 'text-green-600' :
                    user.averageTestScore >= 60 ? 'text-yellow-600' : 
                    'text-red-600'
                  }`}>
                    {user.averageTestScore}%
                  </div>
                </div>
              </div>
            )}

            {/* Encouragement message for users with no tests */}
            {(!user.totalTestsTaken || user.totalTestsTaken === 0) && (
              <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">🚀</div>
                  <div>
                    <p className="font-medium text-blue-700 dark:text-blue-300">Hãy thử sức với bài kiểm tra đầu tiên!</p>
                    <p className="text-sm text-blue-600 dark:text-blue-400">Kiểm tra kiến thức và theo dõi tiến độ học tập của bạn</p>
                  </div>
                  <button
                    onClick={() => router.push('/learn/test')}
                    className="ml-auto bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Làm Test
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Goal Setting Modal */}
        {showGoalModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
              <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white flex items-center gap-2">
                <span>🎯</span>
                Đặt Mục Tiêu Hàng Ngày
              </h3>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Số từ muốn học mỗi ngày:
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={newGoal}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Allow empty string for better UX when typing
                      if (value === '') {
                        setNewGoal(0);
                        return;
                      }
                      const numValue = parseInt(value);
                      // Validate range and set value
                      if (!isNaN(numValue) && numValue >= 1 && numValue <= 100) {
                        setNewGoal(numValue);
                      }
                    }}
                    onBlur={(e) => {
                      // Ensure valid value on blur
                      const value = parseInt(e.target.value);
                      if (isNaN(value) || value < 1) {
                        setNewGoal(1);
                      } else if (value > 100) {
                        setNewGoal(100);
                      }
                    }}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-center text-lg font-semibold"
                    min="1"
                    max="100"
                    placeholder="Nhập số từ (1-100)"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 text-sm">
                    từ/ngày
                  </div>
                </div>

                {/* Quick selection buttons */}
                <div className="mt-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Lựa chọn nhanh:</p>
                  <div className="flex gap-2 flex-wrap">
                    {[5, 10, 15, 20, 30, 50].map((goal) => (
                      <button
                        key={goal}
                        onClick={() => setNewGoal(goal)}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${
                          newGoal === goal
                            ? 'bg-blue-500 text-white shadow-lg'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        {goal}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Goal recommendation */}
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    💡 <strong>Gợi ý:</strong> {
                      newGoal <= 10 ? 'Mục tiêu nhẹ nhàng, phù hợp cho người mới bắt đầu' :
                      newGoal <= 20 ? 'Mục tiêu vừa phải, tốt cho việc duy trì thói quen' :
                      newGoal <= 30 ? 'Mục tiêu cao, cần sự kiên trì' :
                      'Mục tiêu rất cao, thích hợp cho người có nhiều thời gian'
                    }
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowGoalModal(false)}
                  className="flex-1 px-4 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors font-medium"
                >
                  Hủy
                </button>
                <button
                  onClick={updateDailyGoal}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-medium hover:scale-105"
                >
                  Lưu Mục Tiêu
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Words Modal */}
        {showWordsModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
              <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white flex items-center gap-2">
                <span>📚</span>
                {modalType === 'learned' ? 'Từ Đã Học' : 'Từ Đã Ôn Tập'}
              </h3>

              {/* Words list */}
              <div className="max-h-60 overflow-y-auto mb-4">
                {modalLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-200 border-t-blue-600"></div>
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {modalWords.length > 0 ? (
                      modalWords.map((word, index) => (
                        <li key={index} className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-800 dark:text-white font-medium">{word.word}</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">{word.meaning}</span>
                          </div>
                        </li>
                      ))
                    ) : (
                      <li className="p-3 text-center text-gray-500 dark:text-gray-400 text-sm">
                        Không có từ nào để hiển thị
                      </li>
                    )}
                  </ul>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowWordsModal(false)}
                  className="flex-1 px-4 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors font-medium"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ActionCard({
  title,
  description,
  count,
  gradient,
  icon,
  iconBg,
  onClick,
  badge,
  badgeColor
}: {
  title: string;
  description: string;
  count: string;
  gradient: string;
  icon: string;
  iconBg: string;
  onClick: () => void;
  badge?: string;
  badgeColor?: string;
}) {
  return (
    <div
      onClick={onClick}
      className="group bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl hover:shadow-2xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-300 hover:scale-105 cursor-pointer relative overflow-hidden"
    >
      {/* Gradient overlay on hover */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>

      {/* Badge ở góc phải trên */}
      {badge && (
        <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold text-white ${badgeColor}`}>
          {badge}
        </div>
      )}

      <div className="relative z-10">
        {/* Icon và Title */}
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-12 h-12 ${iconBg} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
            <span className="text-xl">{icon}</span>
          </div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-white group-hover:text-gray-900 dark:group-hover:text-gray-100">
            {title}
          </h3>
        </div>

        {/* Description */}
        <div className="mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {description}
          </p>
        </div>

        {/* Count và Call to action */}
        <div className="flex items-center justify-between">
          <div className={`text-2xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
            {count}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            Click →
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  color,
  bgColor
}: {
  title: string;
  value: number | string;
  icon: string;
  color: string;
  bgColor: string;
}) {
  return (
    <div className={`p-4 rounded-2xl shadow-md ${bgColor} flex items-center gap-4`}>
      <div className={`w-12 h-12 flex items-center justify-center rounded-full ${color} bg-opacity-10`}>
        <span className={`text-2xl ${color}`}>{icon}</span>
      </div>
      <div>
        <div className={`text-lg font-semibold ${color}`}>
          {value}
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {title}
        </div>
      </div>
    </div>
  );
}
