'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter, useSearchParams } from 'next/navigation';
import { vocabularyAPI } from '@/lib/api';
import { toast } from 'react-hot-toast';

interface Vocabulary {
  id: number;
  word: string;
  meaning: string;
  pronunciation?: string;
  example?: string;
  partOfSpeech?: string;
  level?: string;
  topic?: string;
}

export default function ReviewPage() {
  const { isAuthenticated, loadUser } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const topic = searchParams.get('topic');

  const [words, setWords] = useState<Vocabulary[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMeaning, setShowMeaning] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      loadReviewWords();
    }
  }, [isAuthenticated, topic]);

  const loadReviewWords = async () => {
    try {
      setLoading(true);
      let response;

      if (topic) {
        // Nếu có topic, lấy từ ôn tập theo topic
        response = await vocabularyAPI.getReviewWordsByTopic(topic, 20);
      } else {
        // Nếu không có topic, lấy từ ôn tập tổng quát
        response = await vocabularyAPI.getWordsForReview(20);
      }

      setWords(response.data);

      if (response.data.length === 0) {
        const message = topic
          ? `Không có từ nào cần ôn tập trong chủ đề "${topic}"!`
          : 'Không có từ nào cần ôn tập!';
        toast.success(message);
      }
    } catch (error: any) {
      console.error('Failed to load review words:', error);
      toast.error('Không thể tải từ ôn tập. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowMeaning(false);
    } else {
      toast.success('Bạn đã hoàn thành tất cả từ ôn tập!');
      router.push('/learn/topics');
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

  const handleReviewWord = async (quality: number) => {
    const currentWord = words[currentIndex];
    if (!currentWord) return;

    try {
      await vocabularyAPI.processStudySession({
        vocabularyId: currentWord.id,
        quality: quality,
        responseTime: 5000
      });

      toast.success('Đã lưu kết quả ôn tập!');
      handleNext();
    } catch (error) {
      console.error('Error processing review session:', error);
      toast.error('Không thể lưu kết quả. Vui lòng thử lại.');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-600"></div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  if (!words || words.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {topic
              ? `Không có từ nào cần ôn tập trong chủ đề "${topic}"`
              : "Không có từ nào cần ôn tập"
            }
          </h2>
          <p className="text-gray-600 mb-6">
            {topic
              ? "Tất cả từ vựng trong chủ đề này đã được ôn tập gần đây."
              : "Tất cả từ vựng đã được ôn tập gần đây."
            }
          </p>
          <button
            onClick={() => router.push('/learn/topics')}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Quay lại danh sách chủ đề
          </button>
        </div>
      </div>
    );
  }

  const currentWord = words[currentIndex];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => router.push('/learn/topics')}
              className="flex items-center text-yellow-600 hover:text-yellow-800 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Quay lại
            </button>
            <div className="text-sm text-gray-600">
              {currentIndex + 1} / {words.length}
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {topic
              ? `Ôn tập từ vựng: ${topic.charAt(0).toUpperCase() + topic.slice(1)}`
              : "Ôn tập từ vựng"
            }
          </h1>

          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / words.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Word Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="text-center">
            {/* Word */}
            <h2 className="text-5xl font-bold text-gray-900 mb-4">
              {currentWord.word}
            </h2>

            {/* Pronunciation */}
            {currentWord.pronunciation && (
              <p className="text-xl text-gray-600 mb-6">
                /{currentWord.pronunciation}/
              </p>
            )}

            {/* Part of Speech & Topic */}
            <div className="flex justify-center gap-2 mb-6">
              {currentWord.partOfSpeech && (
                <span className="inline-block bg-yellow-100 text-yellow-800 text-sm px-3 py-1 rounded-full">
                  {currentWord.partOfSpeech}
                </span>
              )}
              {currentWord.topic && (
                <span className="inline-block bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full">
                  {currentWord.topic}
                </span>
              )}
            </div>

            {/* Show/Hide Meaning Button */}
            {!showMeaning ? (
              <button
                onClick={handleShowMeaning}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors"
              >
                Hiển thị nghĩa
              </button>
            ) : (
              <div className="space-y-4">
                {/* Meaning */}
                <div className="p-6 bg-green-50 rounded-lg">
                  <h3 className="text-lg font-semibold text-green-800 mb-2">Nghĩa:</h3>
                  <p className="text-xl text-green-700">{currentWord.meaning}</p>
                </div>

                {/* Example */}
                {currentWord.example && (
                  <div className="p-6 bg-blue-50 rounded-lg">
                    <h3 className="text-lg font-semibold text-blue-800 mb-2">Ví dụ:</h3>
                    <p className="text-lg text-blue-700 italic">{currentWord.example}</p>
                  </div>
                )}

                {/* Review buttons */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                  <button
                    onClick={() => handleReviewWord(1)}
                    className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                  >
                    😓 Khó nhớ
                  </button>
                  <button
                    onClick={() => handleReviewWord(3)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                  >
                    🤔 Tạm ổn
                  </button>
                  <button
                    onClick={() => handleReviewWord(5)}
                    className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                  >
                    😊 Dễ nhớ
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Trước
          </button>

          <button
            onClick={handleNext}
            className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Tiếp theo
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
