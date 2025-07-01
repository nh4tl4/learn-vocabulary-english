'use client';

import { useState, useEffect } from 'react';
import { vocabularyAPI } from '@/lib/api';
import { useRouter } from 'next/navigation';

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
  };
}

export default function ReviewSession() {
  const [reviewWords, setReviewWords] = useState<UserVocabulary[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMeaning, setShowMeaning] = useState(false);
  const [wordStartTime, setWordStartTime] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [reviewedCount, setReviewedCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    loadReviewWords();
  }, []);

  const loadReviewWords = async () => {
    try {
      const response = await vocabularyAPI.getWordsForReview(20);
      setReviewWords(response.data);
      setWordStartTime(Date.now());
    } catch (error) {
      console.error('Failed to load review words:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQualityRating = async (quality: number) => {
    const currentWord = reviewWords[currentIndex];
    const responseTime = Math.round((Date.now() - wordStartTime) / 1000);

    try {
      await vocabularyAPI.processStudySession({
        vocabularyId: currentWord.vocabulary.id,
        quality,
        responseTime,
      });

      setReviewedCount(reviewedCount + 1);

      if (currentIndex < reviewWords.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setShowMeaning(false);
        setWordStartTime(Date.now());
      } else {
        setSessionComplete(true);
      }
    } catch (error) {
      console.error('Failed to process review session:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600"></div>
      </div>
    );
  }

  if (reviewWords.length === 0) {
    return (
      <div className="max-w-2xl mx-auto p-4 sm:p-6 text-center">
        <div className="text-4xl sm:text-6xl mb-4">🎉</div>
        <h2 className="text-xl sm:text-2xl font-bold mb-4">Hoàn thành tất cả!</h2>
        <p className="text-gray-600 mb-6 text-sm sm:text-base">Hiện tại không có từ nào cần ôn tập. Hãy quay lại sau nhé!</p>
        <button
          onClick={() => router.push('/dashboard')}
          className="bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-blue-700 text-sm sm:text-base"
        >
          Về Trang Chủ
        </button>
      </div>
    );
  }

  if (sessionComplete) {
    return (
      <div className="max-w-2xl mx-auto p-4 sm:p-6 text-center">
        <div className="mb-6">
          <div className="text-4xl sm:text-6xl mb-4">✅</div>
          <h2 className="text-xl sm:text-2xl font-bold mb-4">Hoàn thành phiên ôn tập!</h2>
          <p className="text-gray-600 mb-6 text-sm sm:text-base">
            Bạn đã ôn tập <strong>{reviewedCount}</strong> từ. Tuyệt vời!
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => {
                // Refresh dashboard data before navigating
                window.location.href = '/dashboard';
              }}
              className="bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-blue-700 text-sm sm:text-base"
            >
              Về Trang Chủ (Cập nhật tiến trình)
            </button>
            <button
              onClick={() => window.location.reload()}
              className="bg-gray-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-gray-700 text-sm sm:text-base"
            >
              Ôn Tập Thêm
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentWord = reviewWords[currentIndex];
  const vocabulary = currentWord.vocabulary;

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 sm:mb-0">Ôn Tập Từ Vựng</h1>
          <div className="text-sm sm:text-base text-gray-600">
            {currentIndex + 1} / {reviewWords.length}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3">
          <div
            className="bg-yellow-600 h-2 sm:h-3 rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / reviewWords.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Word Card */}
      <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 mb-6 sm:mb-8">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">
            {vocabulary.word}
          </h2>
          {vocabulary.pronunciation && (
            <p className="text-gray-500 text-lg sm:text-xl mb-2">
              /{vocabulary.pronunciation}/
            </p>
          )}
          {vocabulary.partOfSpeech && (
            <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
              {vocabulary.partOfSpeech}
            </span>
          )}
        </div>

        {showMeaning && (
          <div className="border-t pt-6 sm:pt-8">
            <div className="mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-semibold mb-2">Nghĩa:</h3>
              <p className="text-gray-700 text-base sm:text-lg">{vocabulary.meaning}</p>
            </div>

            {vocabulary.example && (
              <div className="mb-6 sm:mb-8">
                <h3 className="text-lg sm:text-xl font-semibold mb-2">Ví dụ:</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                  <p className="text-gray-700 italic text-base sm:text-lg">{vocabulary.example}</p>
                  {vocabulary.exampleVi && (
                    <p className="text-blue-700 italic text-base sm:text-lg border-t border-gray-200 pt-3">
                      "{vocabulary.exampleVi}"
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Rating Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button
                onClick={() => handleQualityRating(1)}
                className="flex-1 bg-red-500 text-white px-4 py-3 rounded-lg hover:bg-red-600 text-sm sm:text-base"
              >
                Khó 😰
              </button>
              <button
                onClick={() => handleQualityRating(3)}
                className="flex-1 bg-yellow-500 text-white px-4 py-3 rounded-lg hover:bg-yellow-600 text-sm sm:text-base"
              >
                Bình thường 😐
              </button>
              <button
                onClick={() => handleQualityRating(5)}
                className="flex-1 bg-green-500 text-white px-4 py-3 rounded-lg hover:bg-green-600 text-sm sm:text-base"
              >
                Dễ 😊
              </button>
            </div>
          </div>
        )}

        {!showMeaning && (
          <div className="text-center">
            <button
              onClick={() => setShowMeaning(true)}
              className="bg-blue-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg hover:bg-blue-700 text-base sm:text-lg"
            >
              Hiển thị nghĩa
            </button>
          </div>
        )}
      </div>

      {/* Word Status Info */}
      <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
        <h3 className="font-semibold mb-3 text-base sm:text-lg">Thông tin từ:</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm sm:text-base">
          <div>
            <span className="text-gray-600">Trạng thái:</span>
            <span className="ml-2 font-medium">{currentWord.status}</span>
          </div>
          <div>
            <span className="text-gray-600">Đúng:</span>
            <span className="ml-2 font-medium text-green-600">{currentWord.correctCount}</span>
          </div>
          <div>
            <span className="text-gray-600">Sai:</span>
            <span className="ml-2 font-medium text-red-600">{currentWord.incorrectCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function QualityButton({ quality, label, color, onClick }: {
  quality: number;
  label: string;
  color: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`${color} text-white px-4 py-3 rounded-lg text-sm font-medium transition-colors`}
    >
      {label}
    </button>
  );
}
