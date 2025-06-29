'use client';

import { useState, useEffect } from 'react';
import { vocabularyAPI } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useLearningSettingsStore } from '@/store/learningSettingsStore';
import LearningSettingsModal from './LearningSettingsModal';
import { Cog6ToothIcon } from '@heroicons/react/24/outline';
import { getTopicDisplayBilingual } from '@/lib/topicUtils';

interface TopicStat {
  topic: string;
  topicVi?: string; // Add topicVi field
  count: number;
}

interface TopicProgress {
  topic: string;
  totalLearned: number;
  mastered: number;
  learning: number;
  difficult: number;
  masteryPercentage: number;
}

export default function TopicLearning() {
  const [topics, setTopics] = useState<string[]>([]);
  const [topicStats, setTopicStats] = useState<TopicStat[]>([]);
  const [topicProgress, setTopicProgress] = useState<Record<string, TopicProgress>>({});
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [settingsTopic, setSettingsTopic] = useState<string | undefined>();
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalTopics, setTotalTopics] = useState(0);

  const router = useRouter();
  const { getTopicSettings } = useLearningSettingsStore();

  useEffect(() => {
    loadTopicsData();
  }, []);

  const loadTopicsData = async (page = 1, append = false) => {
    try {
      if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      // Load topics and stats with pagination
      const [topicsResponse, statsResponse] = await Promise.all([
        vocabularyAPI.getTopics(page, 12), // Load 12 topics per page
        vocabularyAPI.getTopicStats(page, 12),
      ]);

      const newTopics = topicsResponse.data.topics || [];
      const newStats = statsResponse.data.topics || [];

      if (append) {
        setTopics(prev => [...prev, ...newTopics.map((t: any) => t.topic)]);
        setTopicStats(prev => [...prev, ...newStats]);
      } else {
        setTopics(newTopics.map((t: any) => t.topic));
        setTopicStats(newStats);
      }

      setHasMore(topicsResponse.data.hasMore || false);
      setTotalTopics(topicsResponse.data.total || 0);
      setCurrentPage(page);

      // Load progress for new topics only
      const progressPromises = newStats.map(async (topicStat: TopicStat) => {
        try {
          const progressResponse = await vocabularyAPI.getProgressByTopic(topicStat.topic);
          return { topic: topicStat.topic, progress: progressResponse.data };
        } catch (error) {
          console.error(`Failed to load progress for topic ${topicStat.topic}:`, error);
          return { topic: topicStat.topic, progress: null };
        }
      });

      const progressResults = await Promise.all(progressPromises);
      const progressMap: Record<string, TopicProgress> = {};

      progressResults.forEach(({ topic, progress }) => {
        if (progress) {
          progressMap[topic] = progress;
        }
      });

      if (append) {
        setTopicProgress(prev => ({ ...prev, ...progressMap }));
      } else {
        setTopicProgress(progressMap);
      }
    } catch (error) {
      console.error('Failed to load topics data:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMoreTopics = () => {
    if (hasMore && !loadingMore) {
      loadTopicsData(currentPage + 1, true);
    }
  };

  const getTopicIcon = (topic: string): string => {
    const iconMap: Record<string, string> = {
      'Gia đình': '👨‍👩‍👧‍👦',
      'Đồ ăn & Thức uống': '🍎',
      'Động vật': '🐱',
      'Màu sắc': '🌈',
      'Cơ thể': '👤',
      'Nhà cửa': '🏠',
      'Quần áo': '👕',
      'Thời tiết': '☀️',
      'Giao thông': '🚗',
      'Trường học': '🎓',
      'Công việc': '💼',
      'Thời gian': '⏰',
      'Số đếm': '🔢',
      'Thể thao & Giải trí': '⚽',
      'Công nghệ': '💻',
      'Kinh doanh': '📈',
      'Du lịch': '✈️',
      'Sức khỏe': '🏥',
      'Môi trường': '🌍',
    };
    return iconMap[topic] || '📚';
  };

  const getProgressColor = (percentage: number): string => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-yellow-500';
    if (percentage >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const startTopicLearning = (topic: string, mode: 'learn' | 'review' | 'test') => {
    const settings = getTopicSettings(topic);
    let limit: number;

    switch (mode) {
      case 'learn':
        limit = settings.newWordsPerSession;
        router.push(`/learn/new?topic=${topic}&limit=${limit}`);
        break;
      case 'review':
        limit = settings.reviewWordsPerSession;
        router.push(`/learn/review?topic=${topic}&limit=${limit}`);
        break;
      case 'test':
        limit = settings.testWordsPerSession;
        router.push(`/learn/test?topic=${topic}&limit=${limit}`);
        break;
    }
  };

  const openTopicSettings = (topic: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering topic learning
    setSettingsTopic(topic);
    setShowSettings(true);
  };

  const openGeneralSettings = () => {
    setSettingsTopic(undefined);
    setShowSettings(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      {/* Header with Settings */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-2">
              Học Theo Chủ Đề
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
              Chọn chủ đề bạn muốn tập trung học và luyện tập
            </p>
          </div>
          <button
            onClick={openGeneralSettings}
            className="flex items-center px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Cấu hình học tập"
          >
            <Cog6ToothIcon className="h-5 w-5 mr-1" />
            Cấu hình
          </button>
        </div>
      </div>

      {/* Topic Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {topicStats.map((topicStat) => {
          const progress = topicProgress[topicStat.topic];
          const masteryPercentage = progress?.masteryPercentage || 0;
          const settings = getTopicSettings(topicStat.topic);

          return (
            <div key={topicStat.topic} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              {/* Topic Header */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 text-white">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{getTopicIcon(topicStat.topic)}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                      {topicStat.count} từ
                    </span>
                    <button
                      onClick={(e) => openTopicSettings(topicStat.topic, e)}
                      className="p-1 hover:bg-white/20 rounded transition-colors"
                      title="Cấu hình cho topic này"
                    >
                      <Cog6ToothIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <h3 className="font-semibold text-sm sm:text-base line-clamp-2">
                  {getTopicDisplayBilingual(topicStat.topic, topicStat.topicVi)}
                </h3>
              </div>

              {/* Progress */}
              <div className="p-4">
                {progress ? (
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                      <span>Tiến độ</span>
                      <span>{masteryPercentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(masteryPercentage)}`}
                        style={{ width: `${masteryPercentage}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <span>Đã học: {progress.totalLearned}</span>
                      <span>Thành thạo: {progress.mastered}</span>
                    </div>
                  </div>
                ) : (
                  <div className="mb-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                    Chưa bắt đầu học
                  </div>
                )}

                {/* Settings Preview */}
                <div className="mb-4 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 p-2 rounded">
                  <div className="flex justify-between">
                    <span>Học: {settings.newWordsPerSession}</span>
                    <span>Ôn: {settings.reviewWordsPerSession}</span>
                    <span>Test: {settings.testWordsPerSession}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <button
                    onClick={() => startTopicLearning(topicStat.topic, 'learn')}
                    className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-3 rounded-lg transition-colors text-sm font-medium"
                  >
                    📚 Học từ mới ({settings.newWordsPerSession})
                  </button>

                  {progress && progress.learning > 0 && (
                    <button
                      onClick={() => startTopicLearning(topicStat.topic, 'review')}
                      className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-3 rounded-lg transition-colors text-sm font-medium"
                    >
                      🔄 Ôn tập ({settings.reviewWordsPerSession})
                    </button>
                  )}

                  {progress && progress.totalLearned >= 5 && (
                    <button
                      onClick={() => startTopicLearning(topicStat.topic, 'test')}
                      className="w-full bg-purple-500 hover:bg-purple-600 text-white py-2 px-3 rounded-lg transition-colors text-sm font-medium"
                    >
                      📝 Kiểm tra ({settings.testWordsPerSession})
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="mt-4 text-center">
          <button
            onClick={loadMoreTopics}
            className="flex items-center justify-center mx-auto bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors text-sm font-medium"
          >
            {loadingMore ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Đang tải thêm...
              </>
            ) : (
              'Tải thêm chủ đề'
            )}
          </button>
        </div>
      )}

      {/* Quick Stats */}
      <div className="mt-8 bg-white rounded-lg p-4 sm:p-6 shadow-lg">
        <h3 className="font-semibold text-lg mb-4">📊 Thống kê tổng quan</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{topicStats.length}</div>
            <div className="text-sm text-gray-600">Chủ đề</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {topicStats.reduce((sum, topic) => sum + topic.count, 0)}
            </div>
            <div className="text-sm text-gray-600">Tổng từ vựng</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {Object.values(topicProgress).reduce((sum, progress) => sum + progress.totalLearned, 0)}
            </div>
            <div className="text-sm text-gray-600">Đã học</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {Object.values(topicProgress).reduce((sum, progress) => sum + progress.mastered, 0)}
            </div>
            <div className="text-sm text-gray-600">Thành thạo</div>
          </div>
        </div>
      </div>

      {/* Back button */}
      <div className="mt-6 text-center">
        <button
          onClick={() => router.push('/dashboard')}
          className="text-gray-500 hover:text-gray-700 text-sm"
        >
          ← Quay về Dashboard
        </button>
      </div>

      {/* Settings Modal */}
      <LearningSettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        topic={settingsTopic}
      />
    </div>
  );
}
