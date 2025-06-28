'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { vocabularyAPI } from '@/lib/api';
import { CheckCircleIcon, LockClosedIcon, PlayIcon } from '@heroicons/react/24/outline';

interface LevelProgress {
  level: string;
  totalLearned: number;
  mastered: number;
  learning: number;
  difficult: number;
  masteryPercentage: number;
}

interface RoadmapLevel {
  level: string;
  title: string;
  description: string;
  requiredMastery: number; // Percentage needed to unlock next level
  icon: string;
  color: string;
  order: number;
}

const LEARNING_ROADMAP: RoadmapLevel[] = [
  {
    level: "beginner",
    title: "Cơ bản - Người mới bắt đầu",
    description: "Học những từ vựng cơ bản nhất, dễ hiểu và thường gặp trong cuộc sống hàng ngày",
    requiredMastery: 70,
    icon: "🌱",
    color: "bg-green-500",
    order: 1
  },
  {
    level: "intermediate",
    title: "Trung cấp - Phát triển vốn từ",
    description: "Mở rộng vốn từ vựng với những từ phức tạp hơn, phù hợp cho giao tiếp hàng ngày",
    requiredMastery: 75,
    icon: "🚀",
    color: "bg-blue-500",
    order: 2
  },
  {
    level: "advanced",
    title: "Nâng cao - Thành thạo",
    description: "Chinh phục những từ vựng khó, chuyên ngành và nâng cao trình độ tiếng Anh",
    requiredMastery: 80,
    icon: "🎯",
    color: "bg-purple-500",
    order: 3
  }
];

export default function RoadmapPage() {
  const { isAuthenticated, loadUser } = useAuthStore();
  const [levelProgress, setLevelProgress] = useState<Record<string, LevelProgress>>({});
  const [loading, setLoading] = useState(true);
  const [currentLevel, setCurrentLevel] = useState('beginner');
  const router = useRouter();

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth');
    } else {
      loadProgress();
    }
  }, [isAuthenticated, router]);

  const loadProgress = async () => {
    try {
      setLoading(true);
      const levels = ['beginner', 'intermediate', 'advanced'];
      const progressPromises = levels.map(async (level) => {
        try {
          const response = await vocabularyAPI.getUserProgress(level);
          return { level, progress: response.data };
        } catch (error) {
          console.error(`Failed to load progress for ${level}:`, error);
          return { level, progress: null };
        }
      });

      const results = await Promise.all(progressPromises);
      const progressMap: Record<string, LevelProgress> = {};

      results.forEach(({ level, progress }) => {
        if (progress) {
          progressMap[level] = progress;
        }
      });

      setLevelProgress(progressMap);

      // Calculate current level based on mastery
      let currentLevelFound = 'beginner';
      for (const roadmapLevel of LEARNING_ROADMAP) {
        const progress = progressMap[roadmapLevel.level];
        if (progress && progress.masteryPercentage >= roadmapLevel.requiredMastery) {
          const nextLevelIndex = LEARNING_ROADMAP.findIndex(l => l.order === roadmapLevel.order + 1);
          if (nextLevelIndex !== -1) {
            currentLevelFound = LEARNING_ROADMAP[nextLevelIndex].level;
          } else {
            currentLevelFound = roadmapLevel.level; // Already at highest level
          }
        } else {
          break;
        }
      }
      setCurrentLevel(currentLevelFound);

    } catch (error) {
      console.error('Error loading progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const isLevelUnlocked = (level: string): boolean => {
    const roadmapLevel = LEARNING_ROADMAP.find(l => l.level === level);
    if (!roadmapLevel) return false;

    if (roadmapLevel.order === 1) return true; // First level is always unlocked

    // Check if previous level is completed
    const previousLevel = LEARNING_ROADMAP.find(l => l.order === roadmapLevel.order - 1);
    if (!previousLevel) return true;

    const prevProgress = levelProgress[previousLevel.level];
    return prevProgress ? prevProgress.masteryPercentage >= previousLevel.requiredMastery : false;
  };

  const isLevelCompleted = (roadmapLevel: RoadmapLevel): boolean => {
    const progress = levelProgress[roadmapLevel.level];
    return progress ? progress.masteryPercentage >= roadmapLevel.requiredMastery : false;
  };

  const startLevelLearning = (level: string) => {
    if (!isLevelUnlocked(level)) return;
    router.push(`/learn/new?level=${level}&limit=10`);
  };

  const getTotalProgress = (): number => {
    const levels = Object.values(levelProgress);
    if (levels.length === 0) return 0;

    const totalMastery = levels.reduce((sum, level) => sum + level.masteryPercentage, 0);
    return Math.round(totalMastery / levels.length);
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            🎯 Lộ trình học từ vựng theo cấp độ
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Học từ vựng một cách có hệ thống theo độ khó từ cơ bản đến nâng cao.
            Hoàn thành mỗi cấp độ để mở khóa cấp độ tiếp theo.
          </p>
        </div>

        {/* Progress Overview */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Tiến độ tổng thể
            </h2>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Cấp độ hiện tại: {LEARNING_ROADMAP.find(l => l.level === currentLevel)?.title || 'Cơ bản'}
            </div>
          </div>

          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-4">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${getTotalProgress()}%` }}
            ></div>
          </div>

          <div className="text-center text-lg font-semibold text-gray-900 dark:text-white">
            {getTotalProgress()}% hoàn thành tổng thể
          </div>
        </div>

        {/* Learning Levels */}
        <div className="space-y-6">
          {LEARNING_ROADMAP.map((roadmapLevel) => {
            const isUnlocked = isLevelUnlocked(roadmapLevel.level);
            const isCompleted = isLevelCompleted(roadmapLevel);
            const progress = levelProgress[roadmapLevel.level];
            const levelProgress_percentage = progress?.masteryPercentage || 0;
            const isCurrent = roadmapLevel.level === currentLevel && !isCompleted;

            return (
              <div
                key={roadmapLevel.level}
                className={`relative bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 transition-all duration-300 ${
                  isCurrent ? 'ring-4 ring-blue-500 ring-opacity-50' : ''
                } ${!isUnlocked ? 'opacity-60' : ''}`}
              >
                {/* Level Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className={`w-16 h-16 rounded-full ${roadmapLevel.color} flex items-center justify-center text-2xl`}>
                      {isCompleted ? '✅' : isUnlocked ? roadmapLevel.icon : '🔒'}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {roadmapLevel.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mt-1">
                        {roadmapLevel.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    {isCompleted && (
                      <CheckCircleIcon className="w-8 h-8 text-green-500" />
                    )}
                    {!isUnlocked && (
                      <LockClosedIcon className="w-8 h-8 text-gray-400" />
                    )}
                    {isUnlocked && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => startLevelLearning(roadmapLevel.level)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center space-x-2"
                        >
                          <PlayIcon className="w-5 h-5" />
                          <span>Học từ mới</span>
                        </button>
                        {progress && progress.totalLearned > 0 && (
                          <button
                            onClick={() => router.push(`/learn/review?level=${roadmapLevel.level}&limit=20`)}
                            className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2 rounded-lg transition-colors"
                          >
                            Ôn tập
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <span>Tiến độ</span>
                    <span>{Math.round(levelProgress_percentage)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        isCompleted ? 'bg-green-500' : 'bg-blue-600'
                      }`}
                      style={{ width: `${levelProgress_percentage}%` }}
                    ></div>
                  </div>
                </div>

                {/* Stats */}
                {progress && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">{progress.totalLearned}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Đã học</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{progress.mastered}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Thành thạo</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">{progress.learning}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Đang học</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">{progress.difficult}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Khó</div>
                    </div>
                  </div>
                )}

                {/* Requirements */}
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <strong>Yêu cầu:</strong> Đạt {roadmapLevel.requiredMastery}% thành thạo để mở khóa cấp độ tiếp theo
                    {progress && (
                      <span className="text-blue-600 dark:text-blue-400 ml-2">
                        (Hiện tại: {Math.round(levelProgress_percentage)}%)
                      </span>
                    )}
                  </p>
                  {!progress && isUnlocked && (
                    <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">
                      <strong>Chưa bắt đầu học cấp độ này</strong>
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="text-center mt-12 space-x-4">
          <button
            onClick={() => router.push('/learn/topics')}
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Học theo chủ đề
          </button>
          <button
            onClick={() => router.push('/learn/test')}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Kiểm tra trình độ
          </button>
        </div>
      </div>
    </div>
  );
}
