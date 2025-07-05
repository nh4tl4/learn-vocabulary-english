'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { vocabularyAPI, topicsAPI, userAPI } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useLearningSettingsStore } from '@/store/learningSettingsStore';
import { useAuthStore } from '@/store/authStore';
import { useLevelStore } from '@/store/levelStore';
import LearningSettingsModal from './LearningSettingsModal';
import {
  Cog6ToothIcon,
  BookOpenIcon,
  ArrowPathIcon,
  DocumentTextIcon,
  SparklesIcon,
  ChartBarIcon,
  AcademicCapIcon,
  FireIcon
} from '@heroicons/react/24/outline';
import { Topic, TopicProgress, TopicWithProgress } from '@/types';

interface LoadingState {
  initial: boolean;
  more: boolean;
}

interface TotalStats {
  topics: number;
  totalWords: number;
  learnedWords: number;
  masteredWords: number;
  averageProgress: number;
}

export default function TopicLearning() {
  // State management with proper typing
  const [topics, setTopics] = useState<Topic[]>([]);
  const [topicProgress, setTopicProgress] = useState<Record<string, TopicProgress>>({});
  const [loading, setLoading] = useState<LoadingState>({ initial: true, more: false });
  const [showSettings, setShowSettings] = useState(false);
  const [settingsTopic, setSettingsTopic] = useState<string>();
  const [error, setError] = useState<string | null>(null);

  // Hooks
  const router = useRouter();
  const { getTopicSettings } = useLearningSettingsStore();
  const { user } = useAuthStore();
  const { selectedLevel } = useLevelStore();

  // Memoized values with proper calculations
  const userLevel = useMemo(() => {
    // Use selected level from LevelSelector, fallback to user profile, then to 'beginner'
    if (selectedLevel === 'all') {
      return undefined; // Don't filter by level when 'all' is selected
    }
    return selectedLevel || user?.level || 'beginner';
  }, [selectedLevel, user?.level]);

  const totalStats: TotalStats = useMemo(() => {
    const topicsCount = topics.length;
    const totalWords = topics.reduce((sum, topic) => sum + (topic.vocabularyCount || 0), 0);
    const learnedWords = Object.values(topicProgress).reduce((sum, progress) => sum + progress.totalLearned, 0);
    const masteredWords = Object.values(topicProgress).reduce((sum, progress) => sum + progress.mastered, 0);
    const averageProgress = topicsCount > 0
      ? Math.round(Object.values(topicProgress).reduce((sum, progress) => sum + progress.masteryPercentage, 0) / topicsCount)
      : 0;

    return {
      topics: topicsCount,
      totalWords,
      learnedWords,
      masteredWords,
      averageProgress
    };
  }, [topics, topicProgress]);

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

  // Main data loading function - Fixed to use embedded progress data correctly
  const loadTopicsData = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, initial: true }));
      setError(null);

      // Get selected topics first
      const selectedResponse = await userAPI.getSelectedTopics();
      const selectedTopics: string[] = selectedResponse.data.topics || [];

      if (selectedTopics.length === 0) {
        setTopics([]);
        setTopicProgress({});
        return;
      }

      console.log('🔄 Loading topics with consolidated API...');

      // Use new consolidated API that returns topics with embedded progress data
      const response = await topicsAPI.getWithCountsAndProgress(selectedTopics, userLevel);
      const topicsWithProgress: TopicWithProgress[] = response.data || [];

      console.log('📊 Received topics with progress:', topicsWithProgress);

      // Extract topics and progress data with proper type safety
      const topicsList: Topic[] = [];
      const progressMap: Record<string, TopicProgress> = {};

      topicsWithProgress.forEach((item: TopicWithProgress) => {
        // Extract topic data
        const topic: Topic = {
          id: item.id || 0,
          name: item.name || '',
          nameVi: item.nameVi || '',
          description: item.description || '',
          descriptionVi: item.descriptionVi || '',
          icon: item.icon || '📖',
          displayOrder: item.displayOrder || 0,
          isActive: item.isActive ?? true,
          vocabularyCount: item.vocabularyCount || 0,
          createdAt: item.createdAt || new Date().toISOString(),
          updatedAt: item.updatedAt || new Date().toISOString()
        };

        topicsList.push(topic);

        // Extract progress data - API đã trả về progress embedded
        if (item.progress) {
          progressMap[item.name] = {
            topic: item.progress.topic || item.name,
            totalLearned: item.progress.totalLearned || 0,
            mastered: item.progress.mastered || 0,
            learning: item.progress.learning || 0,
            difficult: item.progress.difficult || 0,
            masteryPercentage: item.progress.masteryPercentage || 0,
            level: item.progress.level || userLevel
          };
          console.log(`✅ Progress for ${item.name}:`, progressMap[item.name]);
        } else {
          // Create default progress if not provided
          progressMap[item.name] = {
            topic: item.name,
            totalLearned: 0,
            mastered: 0,
            learning: 0,
            difficult: 0,
            masteryPercentage: 0,
            level: userLevel
          };
          console.log(`🆕 Default progress for ${item.name}:`, progressMap[item.name]);
        }
      });

      console.log('📋 Final topics list:', topicsList);
      console.log('📊 Final progress map:', progressMap);

      setTopics(topicsList);
      setTopicProgress(progressMap);

    } catch (error) {
      console.error('❌ Failed to load topics data:', error);
      setError('Không thể tải dữ liệu chủ đề. Vui lòng thử lại.');

      // Fallback to old method if new API fails
      try {
        console.log('🔄 Trying fallback method...');
        const [selectedResponse, topicsResponse] = await Promise.all([
          userAPI.getSelectedTopics(),
          topicsAPI.getWithCounts()
        ]);

        const selectedTopics: string[] = selectedResponse.data.topics || [];
        const allTopics: Topic[] = topicsResponse.data || [];

        const selectedTopicsList = allTopics.filter((topic: Topic) =>
          selectedTopics.includes(topic.name)
        );

        setTopics(selectedTopicsList);

        if (selectedTopicsList.length > 0) {
          const progressMap = await loadTopicProgress(selectedTopicsList);
          setTopicProgress(progressMap);
        }
        setError(null); // Clear error if fallback succeeds
      } catch (fallbackError) {
        console.error('❌ Fallback method also failed:', fallbackError);
        setError('Có lỗi xảy ra khi tải dữ liệu. Vui lòng kiểm tra kết nối mạng và thử lại.');
      }
    } finally {
      setLoading(prev => ({ ...prev, initial: false }));
    }
  }, [userLevel, loadTopicProgress]);

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
  }, [userLevel]); // Chỉ phụ thuộc vào userLevel, không phụ thuộc vào loadTopicsData

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

      {/* Error State */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-600 dark:hover:text-red-300"
              >
                <span className="sr-only">Đóng</span>
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Topics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-8">
        {topics.map((topic) => (
          <TopicCard
            key={topic.id}
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
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 text-white">
        <div className="flex items-center justify-between mb-1">
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
          <div className="mb-2">
            <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
              <span>Tiến độ</span>
              <span>{masteryPercentage}% thành thạo</span>
            </div>

            {/* Progress bars cho cả học và thành thạo */}
            <div className="space-y-1">
              {/* Learning progress bar (tổng từ đã học / tổng từ) */}
              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.round((progress.totalLearned / (topic.vocabularyCount || 1)) * 100)}%` }}
                />
              </div>

              {/* Mastery progress bar (từ thành thạo / từ đã học) */}
              {progress.totalLearned > 0 && (
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1">
                  <div
                    className={`h-1 rounded-full transition-all duration-300 ${getProgressColor(masteryPercentage)}`}
                    style={{ width: `${masteryPercentage}%` }}
                  />
                </div>
              )}
            </div>

            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>Đã học: {progress.totalLearned}/{topic.vocabularyCount || 0}</span>
              <span>Thành thạo: {progress.mastered}</span>
            </div>

            {/* Status badges */}
            {/*<div className="flex gap-1 mt-2">*/}
            {/*  {progress.difficult > 0 && (*/}
            {/*    <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">*/}
            {/*      {progress.difficult} khó*/}
            {/*    </span>*/}
            {/*  )}*/}
            {/*</div>*/}
          </div>
        ) : (
          <div className="mb-4 text-center text-gray-500 dark:text-gray-400 text-sm">
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mb-2">
              <div className="bg-gray-300 h-2 rounded-full w-0"></div>
            </div>
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

          {(progress?.totalLearned || 0) > 0 && (
            <ActionButton
              onClick={() => onNavigate(topic.id, topic.name, 'review')}
              className="bg-yellow-500 hover:bg-yellow-600"
              icon="🔄"
              label={`Ôn tập (${settings.reviewWordsPerSession})`}
            />
          )}

          {(progress?.totalLearned || 0) >= 3 && (
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

const StatsSummary = ({ stats }: { stats: TotalStats }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center">
        <ChartBarIcon className="h-6 w-6 mr-2 text-blue-500" />
        Thống kê tổng quan
      </h3>
      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
        <SparklesIcon className="h-4 w-4 mr-1" />
        Cập nhật theo thời gian thực
      </div>
    </div>

    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      <StatItem
        value={stats.topics}
        label="Chủ đề"
        color="text-blue-600"
        bgColor="bg-blue-50 dark:bg-blue-900/20"
        icon={<AcademicCapIcon className="h-5 w-5" />}
      />
      <StatItem
        value={stats.totalWords}
        label="Tổng từ vựng"
        color="text-green-600"
        bgColor="bg-green-50 dark:bg-green-900/20"
        icon={<BookOpenIcon className="h-5 w-5" />}
      />
      <StatItem
        value={stats.learnedWords}
        label="Đã học"
        color="text-yellow-600"
        bgColor="bg-yellow-50 dark:bg-yellow-900/20"
        icon={<ArrowPathIcon className="h-5 w-5" />}
      />
      <StatItem
        value={stats.masteredWords}
        label="Thành thạo"
        color="text-purple-600"
        bgColor="bg-purple-50 dark:bg-purple-900/20"
        icon={<FireIcon className="h-5 w-5" />}
      />
      <StatItem
        value={stats.averageProgress}
        label="Tiến độ TB"
        color="text-indigo-600"
        bgColor="bg-indigo-50 dark:bg-indigo-900/20"
        icon={<DocumentTextIcon className="h-5 w-5" />}
        suffix="%"
      />
    </div>

    {/* Progress Overview */}
    {stats.totalWords > 0 && (
      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Tổng tiến độ học tập
          </span>
          <span className="text-sm font-bold text-gray-900 dark:text-white">
            {Math.round((stats.learnedWords / stats.totalWords) * 100)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${Math.round((stats.learnedWords / stats.totalWords) * 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
          <span>{stats.learnedWords} từ đã học</span>
          <span>{stats.totalWords - stats.learnedWords} từ còn lại</span>
        </div>
      </div>
    )}
  </div>
);

const StatItem = ({
  value,
  label,
  color,
  bgColor,
  icon,
  suffix = ''
}: {
  value: number;
  label: string;
  color: string;
  bgColor: string;
  icon: React.ReactNode;
  suffix?: string;
}) => (
  <div className={`${bgColor} rounded-lg p-4 text-center transition-transform hover:scale-105`}>
    <div className={`${color} mx-auto mb-2 flex justify-center`}>
      {icon}
    </div>
    <div className={`text-2xl font-bold ${color} mb-1`}>
      {value}{suffix}
    </div>
    <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">
      {label}
    </div>
  </div>
);
