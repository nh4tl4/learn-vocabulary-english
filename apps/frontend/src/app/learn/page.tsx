'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { vocabularyAPI } from '@/lib/api';
import { toast } from 'react-hot-toast';
import TextToSpeech from '@/components/TextToSpeech';

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

// Component that uses useSearchParams wrapped in Suspense
function LearnContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, loadUser } = useAuthStore();
  const [vocabularies, setVocabularies] = useState<Vocabulary[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  const isReviewMode = searchParams?.get('mode') === 'review';

  // Separate loadUser call to avoid dependency issues
  useEffect(() => {
    const initAuth = async () => {
      try {
        await loadUser();
      } catch (error) {
        console.error('Error loading user:', error);
      }
    };
    initAuth();
  }, []); // Empty dependency array

  // Separate effect for authentication check
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth');
      return;
    }
  }, [isAuthenticated, router]);

  // Separate effect for loading vocabularies
  useEffect(() => {
    if (isAuthenticated) {
      loadVocabularies();
    }
  }, [isAuthenticated]); // Remove router dependency

  const loadVocabularies = async () => {
    try {
      setLoading(true);
      const response = await vocabularyAPI.getRandom(10);

      if (response?.data && Array.isArray(response.data)) {
        setVocabularies(response.data);
      } else {
        setVocabularies([]);
        toast.error('Không thể tải từ vựng');
      }
    } catch (error) {
      console.error('Error loading vocabularies:', error);
      toast.error('Không thể tải từ vựng');
      setVocabularies([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = async (isCorrect: boolean) => {
    if (!vocabularies || vocabularies.length === 0 || !vocabularies[currentIndex]) return;

    const currentVocab = vocabularies[currentIndex];

    try {
      // Use new learning system API
      const quality = isCorrect ? 4 : 1; // 4 = good, 1 = poor
      const responseTime = 5000; // Default response time in ms

      await vocabularyAPI.processStudySession({
        vocabularyId: currentVocab.id,
        quality,
        responseTime,
      });

      setScore(prev => ({
        correct: prev.correct + (isCorrect ? 1 : 0),
        total: prev.total + 1
      }));

      if (isCorrect) {
        toast.success('Chính xác! 🎉');
      } else {
        toast.error('Chưa đúng, hãy cố gắng nhé! 💪');
      }

      // Move to next question after a short delay
      setTimeout(() => {
        if (currentIndex < vocabularies.length - 1) {
          setCurrentIndex(prev => prev + 1);
          setShowAnswer(false);
        } else {
          // End of quiz
          const newCorrect = score.correct + (isCorrect ? 1 : 0);
          const newTotal = score.total + 1;
          const accuracy = Math.round((newCorrect / newTotal) * 100);
          toast.success(`Hoàn thành! Độ chính xác: ${accuracy}%`);
          router.push('/dashboard');
        }
      }, 1500);
    } catch (error) {
      console.error('Error processing study session:', error);
      toast.error('Có lỗi xảy ra');
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setShowAnswer(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < vocabularies.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setShowAnswer(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 dark:border-blue-400"></div>
      </div>
    );
  }

  if (!vocabularies || vocabularies.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Không có từ vựng</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Không thể tải từ vựng. Vui lòng thử lại sau.
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Quay lại Dashboard
          </button>
        </div>
      </div>
    );
  }

  const currentVocab = vocabularies[currentIndex];

  if (!currentVocab) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Lỗi dữ liệu</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Không thể tải từ vựng hiện tại.
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Quay lại Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Quay lại
            </button>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {currentIndex + 1} / {vocabularies.length}
              </span>
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                Điểm: {score.correct}/{score.total}
              </div>
            </div>
          </div>

          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / vocabularies.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Vocabulary Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8">
          <div className="text-center">
            {/* Word with Speaker Button */}
            <div className="flex items-center justify-center gap-4 mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white break-words">
                {currentVocab.word}
              </h1>
              <TextToSpeech
                text={currentVocab.word}
                lang="en-US"
                size="lg"
                className="flex-shrink-0"
              />
            </div>

            {/* Pronunciation */}
            {currentVocab.pronunciation && (
              <p className="text-gray-600 dark:text-gray-400 mb-4 text-lg">
                /{currentVocab.pronunciation}/
              </p>
            )}

            {/* Part of Speech */}
            {currentVocab.partOfSpeech && (
              <span className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm font-medium mb-6">
                {currentVocab.partOfSpeech}
              </span>
            )}

            {/* Show Answer Button */}
            {!showAnswer ? (
              <button
                onClick={() => setShowAnswer(true)}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors shadow-lg"
              >
                Hiện nghĩa
              </button>
            ) : (
              <div className="space-y-6">
                {/* Meaning with Speaker Button */}
                <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg">
                  <div className="flex items-start justify-center gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
                        Nghĩa:
                      </h3>
                      <p className="text-green-700 dark:text-green-300 text-base sm:text-lg">
                        {currentVocab.meaning}
                      </p>
                    </div>
                    <TextToSpeech
                      text={currentVocab.meaning}
                      lang="vi-VN"
                      size="md"
                      className="flex-shrink-0 mt-1"
                    />
                  </div>
                </div>

                {/* Example */}
                {currentVocab.example && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
                    <div className="flex items-start justify-center gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">
                          Ví dụ:
                        </h3>
                        <p className="text-blue-700 dark:text-blue-300 text-base italic">
                          {currentVocab.example}
                        </p>
                      </div>
                      <TextToSpeech
                        text={currentVocab.example}
                        lang="en-US"
                        size="md"
                        className="flex-shrink-0 mt-1"
                      />
                    </div>
                  </div>
                )}

                {/* Answer Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => handleAnswer(false)}
                    className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors shadow-lg"
                  >
                    Chưa biết 😅
                  </button>
                  <button
                    onClick={() => handleAnswer(true)}
                    className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors shadow-lg"
                  >
                    Đã biết 🎉
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
            className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
              currentIndex === 0
                ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Trước
          </button>

          <span className="text-sm text-gray-500 dark:text-gray-400">
            {currentIndex + 1} / {vocabularies.length}
          </span>

          <button
            onClick={handleNext}
            disabled={currentIndex === vocabularies.length - 1}
            className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
              currentIndex === vocabularies.length - 1
                ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Sau
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LearnPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LearnContent />
    </Suspense>
  );
}
