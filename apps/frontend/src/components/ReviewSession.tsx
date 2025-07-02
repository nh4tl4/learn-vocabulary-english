'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { vocabularyAPI } from '@/lib/api';
import { useRouter, useSearchParams } from 'next/navigation';

interface UserVocabulary {
  id: number;
  status: string;
  correctCount: number;
  incorrectCount: number;
  nextReviewDate: string;
  vocabulary: {
    id: number;
    word: string;
    meaning: string;
    pronunciation?: string;
    example?: string;
    exampleVi?: string;
    partOfSpeech?: string;
    topic?: string;
  };
}

interface ReviewState {
  words: UserVocabulary[];
  currentIndex: number;
  reviewedCount: number;
  loading: boolean;
  sessionComplete: boolean;
}

export default function ReviewSession() {
  // Consolidated state for better performance
  const [state, setState] = useState<ReviewState>({
    words: [],
    currentIndex: 0,
    reviewedCount: 0,
    loading: true,
    sessionComplete: false,
  });

  // Separate state for UI interactions
  const [showMeaning, setShowMeaning] = useState(false);
  const [wordStartTime, setWordStartTime] = useState<number>(0);

  const router = useRouter();
  const searchParams = useSearchParams();

  // Get URL params for topic-based review
  const topicParam = searchParams.get('topic');
  const topicString = topicParam || undefined; // Keep original string for display
  const topic = topicParam ? parseInt(topicParam) : undefined; // Parse to number for API
  const limit = parseInt(searchParams.get('limit') || '20');
  const level = searchParams.get('level') || undefined;

  // Memoized current word to avoid recalculation
  const currentWord = useMemo(() =>
    state.words[state.currentIndex] || null,
    [state.words, state.currentIndex]
  );

  // Optimized word loading function
  const loadReviewWords = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true }));

      let response;
      if (topic) {
        // Load review words for specific topic
        response = await vocabularyAPI.getReviewWordsByTopic(topic, limit, undefined, level);
      } else {
        // Load general review words
        response = await vocabularyAPI.getWordsForReview(limit, level);
      }

      setState(prev => ({
        ...prev,
        words: response.data || [],
        loading: false,
      }));

      setWordStartTime(Date.now());
    } catch (error) {
      console.error('Failed to load review words:', error);
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [topic, limit, level]);

  // Optimized quality rating handler
  const handleQualityRating = useCallback(async (quality: number) => {
    if (!currentWord) return;

    const responseTime = Math.round((Date.now() - wordStartTime) / 1000);

    try {
      await vocabularyAPI.processStudySession({
        vocabularyId: currentWord.vocabulary.id,
        quality,
        responseTime,
      });

      const newReviewedCount = state.reviewedCount + 1;

      // Check if session is complete
      if (state.currentIndex >= state.words.length - 1) {
        setState(prev => ({
          ...prev,
          sessionComplete: true,
          reviewedCount: newReviewedCount,
        }));
      } else {
        setState(prev => ({
          ...prev,
          currentIndex: prev.currentIndex + 1,
          reviewedCount: newReviewedCount,
        }));

        setShowMeaning(false);
        setWordStartTime(Date.now());
      }
    } catch (error) {
      console.error('Failed to process review session:', error);
    }
  }, [currentWord, wordStartTime, state.currentIndex, state.words.length, state.reviewedCount]);

  // Memoized progress calculation
  const progress = useMemo(() => {
    const total = state.words.length;
    const current = state.currentIndex + 1;
    return total > 0 ? Math.round((current / total) * 100) : 0;
  }, [state.words.length, state.currentIndex]);

  // Load words on component mount
  useEffect(() => {
    loadReviewWords();
  }, [loadReviewWords]);

  // Early returns for different states
  if (state.loading) {
    return <LoadingState />;
  }

  if (state.words.length === 0) {
    return <NoWordsState topic={topicString} />;
  }

  if (state.sessionComplete) {
    return <SessionCompleteState reviewedCount={state.reviewedCount} totalWords={state.words.length} />;
  }

  if (!currentWord) {
    return <NoWordsState topic={topicString} />;
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      {/* Progress Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-1">
              Ôn Tập Từ Vựng
            </h1>
            {topicString && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>Chủ đề:</strong> {topicString}
              </p>
            )}
          </div>
          <div className="text-sm sm:text-base text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
            {state.currentIndex + 1} / {state.words.length}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 sm:h-3">
          <div
            className="bg-yellow-600 h-2 sm:h-3 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Word Card */}
      <WordCard
        vocabulary={currentWord.vocabulary}
        showMeaning={showMeaning}
        onShowMeaning={() => setShowMeaning(true)}
        onQualityRating={handleQualityRating}
        isLastWord={state.currentIndex >= state.words.length - 1}
      />
    </div>
  );
}

// Extracted components for better performance
const LoadingState = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto mb-4"></div>
      <p className="text-gray-600 dark:text-gray-400">Đang tải từ ôn tập...</p>
    </div>
  </div>
);

const NoWordsState = ({ topic }: { topic?: string }) => {
  const router = useRouter();

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 text-center">
      <div className="text-4xl sm:text-6xl mb-4">🎉</div>
      <h2 className="text-xl sm:text-2xl font-bold mb-4">Hoàn thành tất cả!</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm sm:text-base">
        {topic
          ? `Hiện tại không có từ nào cần ôn tập trong chủ đề "${topic}".`
          : "Hiện tại không có từ nào cần ôn tập."
        } Hãy quay lại sau nhé!
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={() => router.push('/dashboard')}
          className="bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-blue-700 text-sm sm:text-base"
        >
          Về Dashboard
        </button>
        {topic && (
          <button
            onClick={() => router.push('/learn/topics')}
            className="bg-gray-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-gray-600 text-sm sm:text-base"
          >
            Chọn chủ đề khác
          </button>
        )}
      </div>
    </div>
  );
};

const SessionCompleteState = ({ reviewedCount, totalWords }: { reviewedCount: number; totalWords: number }) => {
  const router = useRouter();
  const percentage = Math.round((reviewedCount / totalWords) * 100);

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 text-center">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 sm:p-8">
        <div className="text-4xl sm:text-6xl mb-4">
          {percentage >= 80 ? '🎉' : percentage >= 60 ? '👍' : '📚'}
        </div>
        <h2 className="text-xl sm:text-2xl font-bold mb-4">Hoàn thành phiên ôn tập!</h2>

        <div className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-lg p-6 mb-6">
          <div className="text-3xl font-bold mb-2">
            {reviewedCount}/{totalWords}
          </div>
          <div className="text-sm opacity-90">
            Đã ôn tập xong tất cả từ vựng
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600"
          >
            📊 Về Dashboard
          </button>
          <button
            onClick={() => window.location.reload()}
            className="bg-yellow-600 text-white px-6 py-3 rounded-lg hover:bg-yellow-700"
          >
            🔄 Ôn tập thêm
          </button>
        </div>
      </div>
    </div>
  );
};

const WordCard = ({
  vocabulary,
  showMeaning,
  onShowMeaning,
  onQualityRating,
  isLastWord
}: {
  vocabulary: any;
  showMeaning: boolean;
  onShowMeaning: () => void;
  onQualityRating: (quality: number) => void;
  isLastWord: boolean;
}) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 sm:p-8">
    <div className="text-center mb-6 sm:mb-8">
      <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-white mb-2">
        {vocabulary.word}
      </h2>
      {vocabulary.pronunciation && (
        <p className="text-gray-500 dark:text-gray-400 text-lg sm:text-xl mb-2">
          /{vocabulary.pronunciation}/
        </p>
      )}
      {vocabulary.partOfSpeech && (
        <span className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm">
          {vocabulary.partOfSpeech}
        </span>
      )}
    </div>

    {!showMeaning ? (
      <div className="text-center">
        <button
          onClick={onShowMeaning}
          className="bg-yellow-600 text-white px-6 py-3 rounded-lg hover:bg-yellow-700 font-medium text-lg"
        >
          👁️ Hiển thị nghĩa
        </button>
      </div>
    ) : (
      <div className="border-t pt-6 sm:pt-8">
        <div className="mb-4 sm:mb-6">
          <h3 className="text-lg sm:text-xl font-semibold mb-2 text-gray-800 dark:text-white">Nghĩa:</h3>
          <p className="text-gray-700 dark:text-gray-300 text-base sm:text-lg">{vocabulary.meaning}</p>
        </div>

        {vocabulary.example && (
          <div className="mb-6 sm:mb-8">
            <h3 className="text-lg sm:text-xl font-semibold mb-2 text-gray-800 dark:text-white">Ví dụ:</h3>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg space-y-3">
              <p className="text-gray-700 dark:text-gray-300 italic text-base sm:text-lg">{vocabulary.example}</p>
              {vocabulary.exampleVi && (
                <p className="text-blue-700 dark:text-blue-300 italic text-base sm:text-lg border-t border-gray-200 dark:border-gray-600 pt-3">
                  "{vocabulary.exampleVi}"
                </p>
              )}
            </div>
          </div>
        )}

        {/* Rating Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <RatingButton
            onClick={() => onQualityRating(1)}
            className="bg-red-500 hover:bg-red-600"
            emoji="😰"
            label="Khó"
          />
          <RatingButton
            onClick={() => onQualityRating(3)}
            className="bg-orange-500 hover:bg-orange-600"
            emoji="🤔"
            label="Bình thường"
          />
          <RatingButton
            onClick={() => onQualityRating(4)}
            className="bg-green-500 hover:bg-green-600"
            emoji="😊"
            label="Dễ"
          />
          <RatingButton
            onClick={() => onQualityRating(5)}
            className="bg-blue-500 hover:bg-blue-600"
            emoji="🎯"
            label="Rất dễ"
          />
        </div>
      </div>
    )}
  </div>
);

const RatingButton = ({ onClick, className, emoji, label }: {
  onClick: () => void;
  className: string;
  emoji: string;
  label: string;
}) => (
  <button
    onClick={onClick}
    className={`text-white px-3 py-3 rounded-lg font-medium text-sm sm:text-base transition-colors ${className}`}
  >
    <div className="text-lg mb-1">{emoji}</div>
    {label}
  </button>
);
