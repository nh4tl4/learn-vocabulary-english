'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { vocabularyAPI, topicsAPI, userAPI } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useLearningSettingsStore } from '@/store/learningSettingsStore';
import { useAuthStore } from '@/store/authStore';
import LearningSettingsModal from './LearningSettingsModal';
import { Cog6ToothIcon } from '@heroicons/react/24/outline';
import { Topic, TopicStats } from '@/types';

interface TopicProgress {
  topic: string;
  totalLearned: number;
  mastered: number;
  learning: number;
  difficult: number;
  masteryPercentage: number;
}

interface LoadingState {
  initial: boolean;
  more: boolean;
}

export default function TopicLearning() {
  // Consolidated state - Updated to use Topic interface from database
  const [topics, setTopics] = useState<Topic[]>([]);
  const [topicProgress, setTopicProgress] = useState<Record<string, TopicProgress>>({});
  const [loading, setLoading] = useState<LoadingState>({ initial: true, more: false });
  const [showSettings, setShowSettings] = useState(false);
  const [settingsTopic, setSettingsTopic] = useState<string>();

  const router = useRouter();
  const { getTopicSettings } = useLearningSettingsStore();
  const { user } = useAuthStore();

  // Memoized values
  const userLevel = useMemo(() => user?.level || 'beginner', [user?.level]);

  const totalStats = useMemo(() => ({
    topics: topics.length,
    totalWords: topics.reduce((sum, topic) => sum + (topic.vocabularyCount || 0), 0),
    learnedWords: Object.values(topicProgress).reduce((sum, progress) => sum + progress.totalLearned, 0),
    masteredWords: Object.values(topicProgress).reduce((sum, progress) => sum + progress.mastered, 0),
  }), [topics, topicProgress]);

  // Load topic progress - OPTIMIZED to use bulk API with topicId
  const loadTopicProgress = useCallback(async (topicList: Topic[]) => {
    if (topicList.length === 0) return {};

    try {
      const topicNames = topicList.map(topic => topic.name);
      const response = await vocabularyAPI.getProgressByMultipleTopics(topicNames, userLevel);

      // Convert array response to object keyed by topic name
      const progressMap: Record<string, TopicProgress> = {};
      if (response.data && Array.isArray(response.data)) {
        response.data.forEach((progress: TopicProgress) => {
          progressMap[progress.topic] = progress;
        });
      }

      return progressMap;
    } catch (error) {
      console.error('Failed to load bulk topic progress:', error);

      // Fallback to individual calls using topicId
      const progressPromises = topicList.map(async (topic) => {
        try {
          const response = await vocabularyAPI.getProgressByTopic(topic.id, userLevel);
          return { topicName: topic.name, progress: response.data };
        } catch (error) {
          console.error(`Failed to load progress for topic ${topic.name}:`, error);
          return { topicName: topic.name, progress: null };
        }
      });

      const results = await Promise.all(progressPromises);
      const progressMap: Record<string, TopicProgress> = {};

      results.forEach(({ topicName, progress }) => {
        if (progress) progressMap[topicName] = progress;
      });

      return progressMap;
    }
  }, [userLevel]);

  // Main data loading function - Updated to use topics from database
  const loadTopicsData = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, initial: true }));

      // Load selected topics and all topics from database in parallel
      const [selectedResponse, topicsResponse] = await Promise.all([
        userAPI.getSelectedTopics(),
        topicsAPI.getWithCounts() // Get topics directly from database with counts
      ]);

      const selectedTopics = selectedResponse.data.topics || [];
      const allTopics = topicsResponse.data || [];

      // Filter topics for selected topics only
      const selectedTopicsList = allTopics.filter((topic: Topic) =>
        selectedTopics.includes(topic.name)
      );

      setTopics(selectedTopicsList);

      // Load progress if we have topics
      if (selectedTopicsList.length > 0) {
        const progressMap = await loadTopicProgress(selectedTopicsList);
        setTopicProgress(progressMap);
      }

    } catch (error) {
      console.error('Failed to load topics data:', error);
    } finally {
      setLoading(prev => ({ ...prev, initial: false }));
    }
  }, [loadTopicProgress]);

  // Navigation helpers - Updated to use topicId
  const navigateToLearning = useCallback((topicId: number, topicName: string, mode: 'learn' | 'review' | 'test') => {
    const settings = getTopicSettings(topicName);
    const limits = {
      learn: settings.newWordsPerSession,
      review: settings.reviewWordsPerSession,
      test: settings.testWordsPerSession
    };

    // Map mode to correct route path
    const routeMap = {
      learn: 'new',
      review: 'review',
      test: 'test'
    };

    // Use topicId instead of topic name in URL
    router.push(`/learn/${routeMap[mode]}?topicId=${topicId}&limit=${limits[mode]}&level=${userLevel}`);
  }, [getTopicSettings, router, userLevel]);

  const openSettings = useCallback((topic?: string) => {
    setSettingsTopic(topic);
    setShowSettings(true);
  }, []);

  // Progress color helper
  const getProgressColor = useCallback((percentage: number): string => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-yellow-500';
    if (percentage >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  }, []);

  // Effects
  useEffect(() => {
    loadTopicsData();
  }, [loadTopicsData]);

  // Loading state
  if (loading.initial) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Empty state
  if (topics.length === 0) {
    return (
      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        <EmptyTopicsState onSelectTopics={() => router.push('/topics')} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <Header onOpenSettings={() => openSettings()} />

      {/* Topics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-8">
        {topics.map((topic) => (
          <TopicCard
            key={topic.name}
            topic={topic}
            progress={topicProgress[topic.name]}
            settings={getTopicSettings(topic.name)}
            onNavigate={navigateToLearning}
            onOpenSettings={(topic) => openSettings(topic)}
            getProgressColor={getProgressColor}
          />
        ))}
      </div>

      {/* Stats Summary */}
      <StatsSummary stats={totalStats} />

      {/* Settings Modal */}
      <LearningSettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        topic={settingsTopic}
      />
    </div>
  );
}

// Extracted components for better organization
const Header = ({ onOpenSettings }: { onOpenSettings: () => void }) => (
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
        onClick={onOpenSettings}
        className="flex items-center px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        title="Cấu hình học tập"
      >
        <Cog6ToothIcon className="h-5 w-5 mr-1" />
        Cấu hình
      </button>
    </div>
  </div>
);

const EmptyTopicsState = ({ onSelectTopics }: { onSelectTopics: () => void }) => (
  <div className="text-center py-12 sm:py-16">
    <div className="max-w-md mx-auto">
      <div className="relative mb-8">
        <div className="text-8xl mb-4 animate-bounce">📚</div>
        <div className="absolute -top-2 -right-2 text-2xl animate-pulse">✨</div>
      </div>

      <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
        Chưa có chủ đề nào được chọn
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-8 text-base sm:text-lg leading-relaxed">
        Hãy chọn những chủ đề bạn quan tâm để bắt đầu hành trình học từ vựng hiệu quả!
      </p>

      <button
        onClick={onSelectTopics}
        className="group bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center mx-auto"
      >
        <span className="mr-2 text-xl group-hover:animate-bounce">📋</span>
        Chọn chủ đề học tập
        <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
      </button>
    </div>
  </div>
);

const TopicCard = ({
  topic,
  progress,
  settings,
  onNavigate,
  onOpenSettings,
  getProgressColor
}: {
  topic: Topic;
  progress?: TopicProgress;
  settings: any;
  onNavigate: (topicId: number, topicName: string, mode: 'learn' | 'review' | 'test') => void;
  onOpenSettings: (topic: string) => void;
  getProgressColor: (percentage: number) => string;
}) => {
  const masteryPercentage = progress?.masteryPercentage || 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 text-white">
        <div className="flex items-center justify-between mb-2">
          {/* Use icon from database or fallback to default */}
          <span className="text-2xl">{topic.icon || '📖'}</span>
          <div className="flex items-center space-x-2">
            <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
              {topic.vocabularyCount || 0} từ
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenSettings(topic.name);
              }}
              className="p-1 hover:bg-white/20 rounded transition-colors"
            >
              <Cog6ToothIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
        {/* Use nameVi and name from database */}
        <h3 className="font-semibold text-sm sm:text-base line-clamp-2">
          {topic.nameVi || topic.name}
        </h3>
        {topic.nameVi && topic.nameVi !== topic.name && (
          <p className="text-xs text-white/80 mt-1">{topic.name}</p>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Progress */}
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
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>Đã học: {progress.totalLearned}/{topic.vocabularyCount || 0}</span>
              <span>Thành thạo: {progress.mastered}</span>
            </div>
          </div>
        ) : (
          <div className="mb-4 text-center text-gray-500 dark:text-gray-400 text-sm">
            Chưa bắt đầu học (0/{topic.vocabularyCount || 0})
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2">
          <ActionButton
            onClick={() => onNavigate(topic.id, topic.name, 'learn')}
            className="bg-green-500 hover:bg-green-600"
            icon="📚"
            label={`Học từ mới (${settings.newWordsPerSession})`}
          />

          {(progress?.learning || 0) > 0 && (
            <ActionButton
              onClick={() => onNavigate(topic.id, topic.name, 'review')}
              className="bg-yellow-500 hover:bg-yellow-600"
              icon="🔄"
              label={`Ôn tập (${settings.reviewWordsPerSession})`}
            />
          )}

          {(progress?.totalLearned || 0) >= 5 && (
            <ActionButton
              onClick={() => onNavigate(topic.id, topic.name, 'test')}
              className="bg-purple-500 hover:bg-purple-600"
              icon="📝"
              label={`Kiểm tra (${settings.testWordsPerSession})`}
            />
          )}
        </div>
      </div>
    </div>
  );
};

const ActionButton = ({
  onClick,
  className,
  icon,
  label
}: {
  onClick: () => void;
  className: string;
  icon: string;
  label: string;
}) => (
  <button
    onClick={onClick}
    className={`w-full text-white py-2 px-3 rounded-lg transition-colors text-sm font-medium ${className}`}
  >
    {icon} {label}
  </button>
);

const StatsSummary = ({ stats }: { stats: { topics: number; totalWords: number; learnedWords: number; masteredWords: number } }) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 shadow-lg">
    <h3 className="font-semibold text-lg mb-4">📊 Thống kê tổng quan</h3>
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <StatItem value={stats.topics} label="Chủ đề" color="text-blue-600" />
      <StatItem value={stats.totalWords} label="Tổng từ vựng" color="text-green-600" />
      <StatItem value={stats.learnedWords} label="Đã học" color="text-yellow-600" />
      <StatItem value={stats.masteredWords} label="Thành thạo" color="text-purple-600" />
    </div>
  </div>
);

const StatItem = ({ value, label, color }: { value: number; label: string; color: string }) => (
  <div className="text-center">
    <div className={`text-2xl font-bold ${color}`}>{value}</div>
    <div className="text-sm text-gray-600 dark:text-gray-400">{label}</div>
  </div>
);
