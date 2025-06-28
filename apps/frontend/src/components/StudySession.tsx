'use client';

import { useState, useEffect } from 'react';
import { vocabularyAPI } from '@/lib/api';
import { useRouter } from 'next/navigation';
import AIAssistant from './AIAssistant';

interface Vocabulary {
  id: number;
  word: string;
  meaning: string;
  pronunciation?: string;
  example?: string;
  partOfSpeech?: string;
  level?: string;
}

export default function StudySession() {
  const [words, setWords] = useState<Vocabulary[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMeaning, setShowMeaning] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<number>(0);
  const [wordStartTime, setWordStartTime] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [learnedCount, setLearnedCount] = useState(0);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadNewWords();
  }, []);

  const loadNewWords = async () => {
    try {
      const response = await vocabularyAPI.getNewWords(10);
      setWords(response.data);
      setSessionStartTime(Date.now());
      setWordStartTime(Date.now());
    } catch (error) {
      console.error('Failed to load words:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQualityRating = async (quality: number) => {
    const currentWord = words[currentIndex];
    const responseTime = Math.round((Date.now() - wordStartTime) / 1000);

    try {
      await vocabularyAPI.processStudySession({
        vocabularyId: currentWord.id,
        quality,
        responseTime,
      });

      setLearnedCount(learnedCount + 1);

      if (currentIndex < words.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setShowMeaning(false);
        setWordStartTime(Date.now());
      } else {
        setSessionComplete(true);
      }
    } catch (error) {
      console.error('Failed to process study session:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (words.length === 0) {
    return (
      <div className="max-w-2xl mx-auto p-4 sm:p-6 text-center">
        <div className="text-4xl sm:text-6xl mb-4">🎉</div>
        <h2 className="text-xl sm:text-2xl font-bold mb-4">Không có từ mới!</h2>
        <p className="text-gray-600 mb-6 text-sm sm:text-base">
          Bạn đã hoàn thành mục tiêu học tập hôm nay. Tuyệt vời!
        </p>
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
          <h2 className="text-xl sm:text-2xl font-bold mb-4">Hoàn thành phiên học!</h2>
          <p className="text-gray-600 mb-6 text-sm sm:text-base">
            Bạn đã học <strong>{learnedCount}</strong> từ mới. Tuyệt vời!
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-blue-700 text-sm sm:text-base"
            >
              Về Trang Chủ
            </button>
            <button
              onClick={() => window.location.reload()}
              className="bg-green-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-green-700 text-sm sm:text-base"
            >
              Học Thêm
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentWord = words[currentIndex];

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 sm:mb-0">Học Từ Mới</h1>
          <div className="flex items-center gap-3">
            <div className="text-sm sm:text-base text-gray-600">
              {currentIndex + 1} / {words.length}
            </div>
            <button
              onClick={() => setShowAIAssistant(true)}
              className="bg-purple-500 text-white px-3 py-1 rounded-lg hover:bg-purple-600 text-xs sm:text-sm flex items-center gap-1"
            >
              🤖 AI Trợ Lý
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3">
          <div
            className="bg-green-600 h-2 sm:h-3 rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / words.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Word Card */}
      <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 mb-6 sm:mb-8">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">
            {currentWord.word}
          </h2>
          {currentWord.pronunciation && (
            <p className="text-gray-500 text-lg sm:text-xl mb-2">
              /{currentWord.pronunciation}/
            </p>
          )}
          {currentWord.partOfSpeech && (
            <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
              {currentWord.partOfSpeech}
            </span>
          )}
          {currentWord.level && (
            <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm ml-2">
              {currentWord.level}
            </span>
          )}
        </div>

        {showMeaning && (
          <div className="border-t pt-6 sm:pt-8">
            <div className="mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-semibold mb-2">Nghĩa:</h3>
              <p className="text-gray-700 text-base sm:text-lg">{currentWord.meaning}</p>
            </div>

            {currentWord.example && (
              <div className="mb-6 sm:mb-8">
                <h3 className="text-lg sm:text-xl font-semibold mb-2">Ví dụ:</h3>
                <p className="text-gray-700 italic text-base sm:text-lg">{currentWord.example}</p>
              </div>
            )}

            {/* AI Helper Button */}
            <div className="mb-6 sm:mb-8 text-center">
              <button
                onClick={() => setShowAIAssistant(true)}
                className="bg-purple-100 text-purple-700 px-4 py-2 rounded-lg hover:bg-purple-200 text-sm sm:text-base inline-flex items-center gap-2"
              >
                🤖 Nhờ AI tạo thêm ví dụ và mẹo học
              </button>
            </div>

            {/* Quality Rating Buttons */}
            <div className="space-y-3 sm:space-y-0 sm:space-x-4 sm:flex">
              <button
                onClick={() => handleQualityRating(1)}
                className="w-full sm:flex-1 bg-red-500 text-white px-4 py-3 rounded-lg hover:bg-red-600 text-sm sm:text-base"
              >
                Khó nhớ 😰
              </button>
              <button
                onClick={() => handleQualityRating(3)}
                className="w-full sm:flex-1 bg-yellow-500 text-white px-4 py-3 rounded-lg hover:bg-yellow-600 text-sm sm:text-base"
              >
                Bình thường 😐
              </button>
              <button
                onClick={() => handleQualityRating(5)}
                className="w-full sm:flex-1 bg-green-500 text-white px-4 py-3 rounded-lg hover:bg-green-600 text-sm sm:text-base"
              >
                Dễ nhớ 😊
              </button>
            </div>
          </div>
        )}

        {!showMeaning && (
          <div className="text-center">
            <button
              onClick={() => setShowMeaning(true)}
              className="bg-green-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg hover:bg-green-700 text-base sm:text-lg"
            >
              Hiển thị nghĩa
            </button>
          </div>
        )}
      </div>

      {/* Help Text */}
      <div className="text-center text-gray-500 text-xs sm:text-sm">
        Đánh giá mức độ dễ nhớ của từ này để cải thiện quá trình học tập
      </div>

      {/* AI Assistant Modal */}
      {showAIAssistant && (
        <AIAssistant
          word={currentWord.word}
          meaning={currentWord.meaning}
          onClose={() => setShowAIAssistant(false)}
        />
      )}
    </div>
  );
}
