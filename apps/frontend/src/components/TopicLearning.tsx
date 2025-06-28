'use client';

import { useState, useEffect } from 'react';
import { vocabularyAPI } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface TopicStat {
  topic: string;
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
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    loadTopicsData();
  }, []);

  const loadTopicsData = async () => {
    try {
      setLoading(true);

      // Load topics and stats
      const [topicsResponse, statsResponse] = await Promise.all([
        vocabularyAPI.getTopics(),
        vocabularyAPI.getTopicStats(),
      ]);

      setTopics(topicsResponse.data);
      setTopicStats(statsResponse.data);

      // Load progress for each topic
      const progressPromises = topicsResponse.data.map(async (topicObj: any) => {
        // Fix: Extract topic name from object
        const topicName = typeof topicObj === 'string' ? topicObj : topicObj.name;

        try {
          const progressResponse = await vocabularyAPI.getProgressByTopic(topicName);
          return { topic: topicName, progress: progressResponse.data };
        } catch (error) {
          console.error(`Failed to load progress for topic ${topicName}:`, error);
          return { topic: topicName, progress: null };
        }
      });

      const progressResults = await Promise.all(progressPromises);
      const progressMap: Record<string, TopicProgress> = {};

      progressResults.forEach(({ topic, progress }) => {
        if (progress) {
          progressMap[topic] = progress;
        }
      });

      setTopicProgress(progressMap);
    } catch (error) {
      console.error('Failed to load topics data:', error);
    } finally {
      setLoading(false);
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
    switch (mode) {
      case 'learn':
        router.push(`/learn/topic/${encodeURIComponent(topic)}/new`);
        break;
      case 'review':
        router.push(`/learn/topic/${encodeURIComponent(topic)}/review`);
        break;
      case 'test':
        router.push(`/learn/topic/${encodeURIComponent(topic)}/test`);
        break;
    }
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
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Học Theo Chủ Đề</h1>
        <p className="text-gray-600 text-sm sm:text-base">
          Chọn chủ đề bạn muốn tập trung học và luyện tập
        </p>
      </div>

      {/* Topic Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {topicStats.map((topicStat) => {
          const progress = topicProgress[topicStat.topic];
          const masteryPercentage = progress?.masteryPercentage || 0;

          return (
            <div key={topicStat.topic} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              {/* Topic Header */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 text-white">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{getTopicIcon(topicStat.topic)}</span>
                  <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                    {topicStat.count} từ
                  </span>
                </div>
                <h3 className="font-semibold text-sm sm:text-base line-clamp-2">
                  {topicStat.topic}
                </h3>
              </div>

              {/* Progress */}
              <div className="p-4">
                {progress ? (
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Tiến độ</span>
                      <span>{masteryPercentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(masteryPercentage)}`}
                        style={{ width: `${masteryPercentage}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Đã học: {progress.totalLearned}</span>
                      <span>Thành thạo: {progress.mastered}</span>
                    </div>
                  </div>
                ) : (
                  <div className="mb-4 text-center text-gray-500 text-sm">
                    Chưa bắt đầu học
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-2">
                  <button
                    onClick={() => startTopicLearning(topicStat.topic, 'learn')}
                    className="w-full bg-green-500 text-white py-2 px-3 rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
                  >
                    📚 Học từ mới
                  </button>

                  {progress && progress.learning > 0 && (
                    <button
                      onClick={() => startTopicLearning(topicStat.topic, 'review')}
                      className="w-full bg-yellow-500 text-white py-2 px-3 rounded-lg hover:bg-yellow-600 transition-colors text-sm font-medium"
                    >
                      🔄 Ôn tập ({progress.learning})
                    </button>
                  )}

                  {progress && progress.totalLearned >= 5 && (
                    <button
                      onClick={() => startTopicLearning(topicStat.topic, 'test')}
                      className="w-full bg-purple-500 text-white py-2 px-3 rounded-lg hover:bg-purple-600 transition-colors text-sm font-medium"
                    >
                      📝 Kiểm tra
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

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
    </div>
  );
}
