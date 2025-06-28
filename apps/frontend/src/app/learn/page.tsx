'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { vocabularyAPI } from '@/lib/api';
import { Vocabulary } from '@/types';
import { toast } from 'react-hot-toast';

// Component that uses useSearchParams wrapped in Suspense
function LearnContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuthStore();
  const [vocabularies, setVocabularies] = useState<Vocabulary[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  const isReviewMode = searchParams?.get('mode') === 'review';

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth');
      return;
    }

    loadVocabularies();
  }, [isAuthenticated, router]);

  const loadVocabularies = async () => {
    try {
      const response = await vocabularyAPI.getRandom(10);
      setVocabularies(response.data);
    } catch (error) {
      toast.error('Không thể tải từ vựng');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = async (isCorrect: boolean) => {
    if (vocabularies.length === 0) return;

    const currentVocab = vocabularies[currentIndex];

    try {
      await vocabularyAPI.updateProgress(currentVocab.id, isCorrect);

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
          const accuracy = Math.round((score.correct + (isCorrect ? 1 : 0)) / (score.total + 1) * 100);
          toast.success(`Hoàn thành! Độ chính xác: ${accuracy}%`);
          router.push('/dashboard');
        }
      }, 1500);
    } catch (error) {
      toast.error('Có lỗi xảy ra');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (vocabularies.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Không có từ vựng nào để học
          </h2>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-primary-600 text-white px-6 py-3 rounded-md hover:bg-primary-700"
          >
            Quay lại Dashboard
          </button>
        </div>
      </div>
    );
  }

  const currentVocab = vocabularies[currentIndex];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isReviewMode ? 'Ôn tập từ vựng' : 'Học từ vựng mới'}
              </h1>
              <p className="text-gray-600">
                Câu {currentIndex + 1} / {vocabularies.length}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Điểm: {score.correct}/{score.total}
              </div>
              <button
                onClick={() => router.push('/dashboard')}
                className="text-gray-500 hover:text-gray-700"
              >
                Thoát
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / vocabularies.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Vocabulary Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-8">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {currentVocab.word}
            </h2>
            {currentVocab.pronunciation && (
              <p className="text-lg text-gray-600 mb-2">
                /{currentVocab.pronunciation}/
              </p>
            )}
            <span className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
              {currentVocab.partOfSpeech}
            </span>
          </div>

          {!showAnswer ? (
            <div>
              <p className="text-gray-600 mb-8">
                Bạn có biết nghĩa của từ này không?
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => setShowAnswer(true)}
                  className="bg-primary-600 text-white px-8 py-3 rounded-md hover:bg-primary-700 text-lg"
                >
                  Xem đáp án
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="mb-8 p-6 bg-gray-50 rounded-lg">
                <p className="text-xl text-gray-900 mb-4">
                  <strong>Nghĩa:</strong> {currentVocab.meaning}
                </p>
                {currentVocab.example && (
                  <p className="text-gray-700">
                    <strong>Ví dụ:</strong> {currentVocab.example}
                  </p>
                )}
              </div>

              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => handleAnswer(false)}
                  className="bg-red-500 text-white px-8 py-3 rounded-md hover:bg-red-600 text-lg"
                >
                  Chưa biết 😅
                </button>
                <button
                  onClick={() => handleAnswer(true)}
                  className="bg-green-500 text-white px-8 py-3 rounded-md hover:bg-green-600 text-lg"
                >
                  Đã biết 🎉
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="mt-8 flex justify-between">
          <button
            onClick={() => {
              if (currentIndex > 0) {
                setCurrentIndex(prev => prev - 1);
                setShowAnswer(false);
              }
            }}
            disabled={currentIndex === 0}
            className="px-6 py-3 text-gray-600 hover:text-gray-800 disabled:opacity-50"
          >
            ← Câu trước
          </button>

          <div className="flex space-x-2">
            {vocabularies.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full ${
                  index === currentIndex 
                    ? 'bg-primary-600' 
                    : index < currentIndex 
                    ? 'bg-green-500' 
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          <button
            onClick={() => {
              if (currentIndex < vocabularies.length - 1) {
                setCurrentIndex(prev => prev + 1);
                setShowAnswer(false);
              }
            }}
            disabled={currentIndex === vocabularies.length - 1}
            className="px-6 py-3 text-gray-600 hover:text-gray-800 disabled:opacity-50"
          >
            Câu sau →
          </button>
        </div>
      </main>
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
