'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useLearningSettingsStore } from '@/store/learningSettingsStore';
import { useRouter, useSearchParams } from 'next/navigation';
import { vocabularyAPI } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { formatTopicDisplay, getTopicIcon } from '@/lib/topicUtils';
import {
  CalendarDaysIcon,
  ClockIcon,
  ChartBarIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import MobileButton from '@/components/MobileOptimized/MobileButton';
import PullToRefresh from '@/components/MobileOptimized/PullToRefresh';

interface Vocabulary {
  id: number;
  word: string;
  meaning: string;
  pronunciation?: string;
  example?: string;
  partOfSpeech?: string;
  level?: string;
  topic?: string;
  topicVi?: string;
  lastReviewed?: string;
  reviewCount?: number;
  difficulty?: number;
}

interface ReviewStats {
  totalWords: number;
  todayWords: number;
  yesterdayWords: number;
  last7DaysWords: number;
  last30DaysWords: number;
}

type ReviewPeriod = 'today' | 'yesterday' | '7days' | '30days' | 'all';

export default function ReviewContent() {
  const { isAuthenticated, loadUser } = useAuthStore();
  const { getTopicSettings, reviewWordsPerSession } = useLearningSettingsStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const topicId = searchParams.get('topicId'); // ✅ Changed from 'topic' to 'topicId'

  const [words, setWords] = useState<Vocabulary[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMeaning, setShowMeaning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reviewStats, setReviewStats] = useState<ReviewStats | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<ReviewPeriod>('today');
  const [reviewMode, setReviewMode] = useState<'selection' | 'review'>('selection');
  const [currentWordStats, setCurrentWordStats] = useState<{correct: number, incorrect: number}>({correct: 0, incorrect: 0});

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated && reviewMode === 'selection') {
      loadReviewStats();
    }
  }, [isAuthenticated, reviewMode]);

  const loadReviewStats = async () => {
    try {
      setLoading(true);

      if (topicId) {
        // For topic-specific review, we need to get words by topicId
        const numericTopicId = parseInt(topicId);
        if (isNaN(numericTopicId)) {
          toast.error('Topic ID không hợp lệ!');
          router.push('/learn');
          return;
        }

        // Load review words for specific topic using topicId
        const response = await vocabularyAPI.getReviewWordsByTopic(numericTopicId, 20, selectedPeriod);
        setWords(response.data);
        setCurrentIndex(0);
        setShowMeaning(false);
        setCurrentWordStats({correct: 0, incorrect: 0});

        if (response.data.length === 0) {
          const periodText = getPeriodText(selectedPeriod);
          toast(`Không có từ nào để ôn tập ${periodText}!`);
          setReviewMode('selection');
          return;
        }

        setReviewMode('review');
      } else {
        // Load general review stats
        const response = await vocabularyAPI.getReviewStats();
        setReviewStats(response.data);
      }
    } catch (error) {
      console.error('Failed to load review stats:', error);
      toast.error('Không thể tải thống kê ôn tập!');
    } finally {
      setLoading(false);
    }
  };

  const loadReviewWords = async (period: ReviewPeriod = selectedPeriod) => {
    try {
      setLoading(true);
      let response;

      const urlLimit = searchParams.get('limit');
      const limit = urlLimit ? parseInt(urlLimit) : reviewWordsPerSession;

      if (topicId) {
        // ✅ Convert topicId to number and use the correct API method
        const numericTopicId = parseInt(topicId);
        if (isNaN(numericTopicId)) {
          toast.error('Topic ID không hợp lệ!');
          router.push('/learn');
          return;
        }

        response = await vocabularyAPI.getReviewWordsByTopic(numericTopicId, limit, period);
      } else {
        response = await vocabularyAPI.getWordsForReviewByPeriod(period, limit);
      }

      setWords(response.data);
      setCurrentIndex(0);
      setShowMeaning(false);
      setCurrentWordStats({correct: 0, incorrect: 0});

      if (response.data.length === 0) {
        const periodText = getPeriodText(period);
        toast(`Không có từ nào để ôn tập ${periodText}!`);
        setReviewMode('selection');
        return;
      }

      setReviewMode('review');
    } catch (error: any) {
      console.error('Failed to load review words:', error);
      toast.error('Không thể tải từ ôn tập. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const getPeriodText = (period: ReviewPeriod): string => {
    const texts = {
      today: 'hôm nay',
      yesterday: 'hôm qua',
      '7days': '7 ngày qua',
      '30days': '30 ngày qua',
      all: 'tất cả'
    };
    return texts[period];
  };

  const handleRefresh = async () => {
    if (reviewMode === 'selection') {
      await loadReviewStats();
    } else {
      await loadReviewWords();
    }
  };

  const handleAnswerFeedback = async (isCorrect: boolean) => {
    const currentWord = words[currentIndex];
    if (!currentWord) return;

    try {
      // Use processStudySession instead of recordReviewResult
      await vocabularyAPI.processStudySession({
        vocabularyId: currentWord.id,
        quality: isCorrect ? 5 : 1, // High quality (5) for correct, low quality (1) for incorrect
        responseTime: 1000 // Default response time in ms
      });

      setCurrentWordStats(prev => ({
        correct: prev.correct + (isCorrect ? 1 : 0),
        incorrect: prev.incorrect + (isCorrect ? 0 : 1)
      }));

      // Auto proceed to next word after feedback
      setTimeout(() => {
        handleNext();
      }, 1000);

    } catch (error) {
      console.error('Failed to record review result:', error);
    }
  };

  const handleNext = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowMeaning(false);
    } else {
      const totalAnswered = currentWordStats.correct + currentWordStats.incorrect;
      const accuracy = totalAnswered > 0 ? Math.round((currentWordStats.correct / totalAnswered) * 100) : 0;

      toast.success(`Hoàn thành! Độ chính xác: ${accuracy}% (${currentWordStats.correct}/${totalAnswered})`);
      setReviewMode('selection');
      loadReviewStats(); // Refresh stats
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowMeaning(false);
    }
  };

  const handleShowMeaning = () => {
    setShowMeaning(true);
  };

  const handleBackToSelection = () => {
    setReviewMode('selection');
    setWords([]);
    setCurrentIndex(0);
    setShowMeaning(false);
  };

  if (loading && reviewMode === 'selection') {
    return (
      <div className="min-h-mobile flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  if (reviewMode === 'selection') {
    return (
      <PullToRefresh onRefresh={handleRefresh}>
        <div className="max-w-4xl mx-auto py-6 spacing-mobile">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-responsive-xl font-bold text-gray-800 dark:text-white mb-2">
              Ôn Tập Từ Vựng
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-responsive-sm">
              Ôn lại những từ đã học theo thời gian
            </p>
          </div>

          {/* Stats Overview */}
          {reviewStats && (
            <div className="card-mobile mb-6 bg-gradient-to-r from-yellow-500 to-orange-600 text-white">
              <div className="flex items-center mb-4">
                <ChartBarIcon className="h-6 w-6 mr-2" />
                <h2 className="text-responsive-lg font-semibold">Thống Kê Ôn Tập</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{reviewStats.totalWords}</div>
                  <div className="text-sm opacity-80">Tổng từ</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{reviewStats.todayWords}</div>
                  <div className="text-sm opacity-80">Hôm nay</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{reviewStats.last7DaysWords}</div>
                  <div className="text-sm opacity-80">7 ngày qua</div>
                </div>
              </div>
            </div>
          )}

          {/* Period Selection */}
          <div className="card-mobile mb-6">
            <h3 className="text-responsive-base font-semibold text-gray-800 dark:text-white mb-4">
              Chọn Thời Gian Ôn Tập
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { period: 'today' as ReviewPeriod, label: 'Hôm Nay', count: reviewStats?.todayWords || 0, icon: ClockIcon },
                { period: 'yesterday' as ReviewPeriod, label: 'Hôm Qua', count: reviewStats?.yesterdayWords || 0, icon: CalendarDaysIcon },
                { period: '7days' as ReviewPeriod, label: '7 Ngày Qua', count: reviewStats?.last7DaysWords || 0, icon: CalendarDaysIcon },
                { period: '30days' as ReviewPeriod, label: '30 Ngày Qua', count: reviewStats?.last30DaysWords || 0, icon: CalendarDaysIcon }
              ].map(({ period, label, count, icon: Icon }) => (
                <button
                  key={period}
                  onClick={() => {
                    setSelectedPeriod(period);
                    loadReviewWords(period);
                  }}
                  disabled={count === 0}
                  className={`
                    card-mobile hover:shadow-md transition-all duration-200 
                    ${count === 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}
                    ${selectedPeriod === period ? 'ring-2 ring-yellow-500' : ''}
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
                        <Icon className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                      </div>
                      <div className="text-left">
                        <h4 className="font-semibold text-gray-800 dark:text-white text-responsive-sm">{label}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{count} từ</p>
                      </div>
                    </div>
                    <ArrowRightIcon className="h-5 w-5 text-gray-400" />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <MobileButton
              variant="outline"
              onClick={() => router.push('/learn')}
              icon={<ArrowLeftIcon className="h-5 w-5" />}
            >
              Quay Lại Học Tập
            </MobileButton>
            <MobileButton
              variant="primary"
              onClick={() => loadReviewWords('all')}
            >
              Ôn Tập Tất Cả
            </MobileButton>
          </div>
        </div>
      </PullToRefresh>
    );
  }

  // Review Mode
  if (loading) {
    return (
      <div className="min-h-mobile flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  if (words.length === 0) {
    return (
      <div className="min-h-mobile flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📚</div>
          <h2 className="text-responsive-lg font-semibold text-gray-800 dark:text-white mb-2">
            Không có từ để ôn tập
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Hãy học thêm từ mới hoặc chọn thời gian khác
          </p>
          <MobileButton onClick={handleBackToSelection}>
            Quay Lại
          </MobileButton>
        </div>
      </div>
    );
  }

  const currentWord = words[currentIndex];

  return (
    <div className="max-w-2xl mx-auto py-6 spacing-mobile">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={handleBackToSelection}
          className="btn-touch p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <ArrowLeftIcon className="h-6 w-6 text-gray-600 dark:text-gray-400" />
        </button>
        <div className="text-center">
          <h1 className="text-responsive-base font-semibold text-gray-800 dark:text-white">
            Ôn Tập {getPeriodText(selectedPeriod)}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {currentIndex + 1} / {words.length}
          </p>
        </div>
        <div className="flex items-center space-x-2 text-sm">
          <span className="text-green-600">✓{currentWordStats.correct}</span>
          <span className="text-red-600">✗{currentWordStats.incorrect}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / words.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Word Card */}
      <div className="card-mobile mb-6 text-center">
        <div className="mb-4">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-white mb-2">
            {currentWord.word}
          </h2>
          {currentWord.pronunciation && (
            <p className="text-gray-600 dark:text-gray-400 text-responsive-sm">
              /{currentWord.pronunciation}/
            </p>
          )}
          {currentWord.partOfSpeech && (
            <span className="inline-block px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm mt-2">
              {currentWord.partOfSpeech}
            </span>
          )}
        </div>

        {showMeaning ? (
          <div className="animate-fade-in">
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <p className="text-responsive-base text-gray-800 dark:text-white mb-3">
                <strong>Nghĩa:</strong> {currentWord.meaning}
              </p>
              {currentWord.example && (
                <p className="text-responsive-sm text-gray-600 dark:text-gray-400 italic">
                  <strong>Ví dụ:</strong> {currentWord.example}
                </p>
              )}
            </div>

            {/* Feedback Buttons */}
            <div className="flex justify-center space-x-4 mt-6">
              <MobileButton
                variant="danger"
                onClick={() => handleAnswerFeedback(false)}
                icon={<XCircleIcon className="h-5 w-5" />}
              >
                Khó
              </MobileButton>
              <MobileButton
                variant="success"
                onClick={() => handleAnswerFeedback(true)}
                icon={<CheckCircleIcon className="h-5 w-5" />}
              >
                Dễ
              </MobileButton>
            </div>
          </div>
        ) : (
          <MobileButton
            onClick={handleShowMeaning}
            icon={<EyeIcon className="h-5 w-5" />}
            fullWidth
          >
            Hiển Thị Nghĩa
          </MobileButton>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <MobileButton
          variant="outline"
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          icon={<ArrowLeftIcon className="h-5 w-5" />}
        >
          Trước
        </MobileButton>

        <div className="text-center">
          <p className="text-responsive-sm text-gray-600 dark:text-gray-400">
            {currentIndex + 1} / {words.length}
          </p>
        </div>

        <MobileButton
          variant="primary"
          onClick={handleNext}
          icon={<ArrowRightIcon className="h-5 w-5" />}
        >
          {currentIndex === words.length - 1 ? 'Hoàn Thành' : 'Tiếp'}
        </MobileButton>
      </div>
    </div>
  );
}
