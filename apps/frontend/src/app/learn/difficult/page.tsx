'use client';

import { useState, useEffect } from 'react';
import { vocabularyAPI } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useLevelStore } from '@/store/levelStore';

interface DifficultWord {
  id: number;
  status: string;
  correctCount: number;
  incorrectCount: number;
  reviewCount: number;
  lastReviewedAt: string;
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

export default function DifficultWordsPage() {
  const [difficultWords, setDifficultWords] = useState<DifficultWord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedWord, setSelectedWord] = useState<DifficultWord | null>(null);
  const router = useRouter();
  const { selectedLevel } = useLevelStore();

  useEffect(() => {
    loadDifficultWords();
  }, [selectedLevel]);

  const loadDifficultWords = async () => {
    try {
      setLoading(true);
      setError(null);

      const levelParam = selectedLevel === 'all' ? undefined : selectedLevel;
      const response = await vocabularyAPI.getDifficultWords(20, levelParam);
      setDifficultWords(response.data);
    } catch (error) {
      console.error('Failed to load difficult words:', error);
      setError('Không thể tải từ khó. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleWordClick = (word: DifficultWord) => {
    setSelectedWord(word);
  };

  const handlePracticeWord = async (wordId: number, isCorrect: boolean) => {
    try {
      await vocabularyAPI.recordReviewResult(wordId, isCorrect);

      // Update local state
      setDifficultWords(prev =>
        prev.map(word =>
          word.vocabulary.id === wordId
            ? {
                ...word,
                correctCount: word.correctCount + (isCorrect ? 1 : 0),
                incorrectCount: word.incorrectCount + (isCorrect ? 0 : 1),
                reviewCount: word.reviewCount + 1,
                lastReviewedAt: new Date().toISOString()
              }
            : word
        )
      );

      setSelectedWord(null);
    } catch (error) {
      console.error('Failed to record practice result:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 dark:from-gray-900 dark:via-red-900 dark:to-orange-900">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-200 border-t-red-600 mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl">💪</span>
            </div>
          </div>
          <p className="mt-4 text-gray-600 dark:text-gray-300 font-medium">Đang tải từ khó...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 dark:from-gray-900 dark:via-red-900 dark:to-orange-900 p-4">
        <div className="text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Có lỗi xảy ra</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <button
            onClick={loadDifficultWords}
            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 dark:from-gray-900 dark:via-red-900 dark:to-orange-900">
      <div className="max-w-6xl mx-auto px-4 py-6 lg:py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="p-2 rounded-lg hover:bg-white/20 dark:hover:bg-gray-800/20 transition-colors"
            >
              <span className="text-2xl">←</span>
            </button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-2xl">💪</span>
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
                  Từ Khó Cần Luyện Tập
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-sm lg:text-base">
                  Những từ bạn cần ôn tập thêm để cải thiện
                </p>
              </div>
            </div>
          </div>
        </div>

        {difficultWords.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
              Tuyệt vời! Không có từ khó nào!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Bạn đã học rất tốt. Hãy tiếp tục duy trì phong độ này!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => router.push('/learn/new')}
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-200 font-medium"
              >
                Học từ mới
              </button>
              <button
                onClick={() => router.push('/learn/review')}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-200 font-medium"
              >
                Ôn tập từ đã học
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 mb-8 shadow-xl border border-white/20">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                    {difficultWords.length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Từ cần luyện</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                    {Math.round(
                      difficultWords.reduce((acc, word) =>
                        acc + (word.correctCount / Math.max(word.reviewCount, 1)), 0
                      ) / difficultWords.length * 100
                    )}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Độ chính xác trung bình</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                    {difficultWords.reduce((acc, word) => acc + word.reviewCount, 0)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Lần ôn tập</div>
                </div>
              </div>
            </div>

            {/* Difficult Words Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {difficultWords.map((wordItem) => (
                <DifficultWordCard
                  key={wordItem.vocabulary.id}
                  wordItem={wordItem}
                  onClick={() => handleWordClick(wordItem)}
                />
              ))}
            </div>
          </>
        )}

        {/* Word Detail Modal */}
        {selectedWord && (
          <WordDetailModal
            word={selectedWord}
            onClose={() => setSelectedWord(null)}
            onPractice={handlePracticeWord}
          />
        )}
      </div>
    </div>
  );
}

function DifficultWordCard({
  wordItem,
  onClick
}: {
  wordItem: DifficultWord;
  onClick: () => void;
}) {
  const accuracy = wordItem.reviewCount > 0
    ? Math.round((wordItem.correctCount / wordItem.reviewCount) * 100)
    : 0;

  return (
    <div
      onClick={onClick}
      className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border border-red-200/50 dark:border-red-800/50 hover:scale-105"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-1">
            {wordItem.vocabulary.word}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            {wordItem.vocabulary.meaning}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className={`px-2 py-1 rounded-lg text-xs font-medium ${
            accuracy >= 70 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
            accuracy >= 50 ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
            'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          }`}>
            {accuracy}% chính xác
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center">
          <div className="text-lg font-bold text-green-600 dark:text-green-400">
            {wordItem.correctCount}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Đúng</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-red-600 dark:text-red-400">
            {wordItem.incorrectCount}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Sai</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
            {wordItem.reviewCount}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Tổng</div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Ôn lần cuối: {new Date(wordItem.lastReviewedAt).toLocaleDateString('vi-VN')}
        </div>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <span className="text-red-500 dark:text-red-400">→</span>
        </div>
      </div>
    </div>
  );
}

function WordDetailModal({
  word,
  onClose,
  onPractice
}: {
  word: DifficultWord;
  onClose: () => void;
  onPractice: (wordId: number, isCorrect: boolean) => void;
}) {
  const [showMeaning, setShowMeaning] = useState(false);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
            Luyện tập từ khó
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <span className="text-xl">×</span>
          </button>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
            {word.vocabulary.word}
          </h2>
          {word.vocabulary.pronunciation && (
            <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">
              /{word.vocabulary.pronunciation}/
            </p>
          )}

          {!showMeaning ? (
            <button
              onClick={() => setShowMeaning(true)}
              className="bg-gradient-to-r from-red-500 to-orange-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-200 font-medium"
            >
              Hiển thị nghĩa
            </button>
          ) : (
            <div>
              <div className="mb-6">
                <h4 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">Nghĩa:</h4>
                <p className="text-gray-700 dark:text-gray-300 text-lg">
                  {word.vocabulary.meaning}
                </p>
              </div>

              {word.vocabulary.example && (
                <div className="mb-8">
                  <h4 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">Ví dụ:</h4>
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <p className="text-gray-700 dark:text-gray-300 italic mb-2">
                      "{word.vocabulary.example}"
                    </p>
                    {word.vocabulary.exampleVi && (
                      <p className="text-blue-700 dark:text-blue-300 italic">
                        "{word.vocabulary.exampleVi}"
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => onPractice(word.vocabulary.id, false)}
                  className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-200 font-medium"
                >
                  Vẫn khó 😰
                </button>
                <button
                  onClick={() => onPractice(word.vocabulary.id, true)}
                  className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-200 font-medium"
                >
                  Đã nhớ 😊
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Word Stats */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h4 className="font-semibold mb-3 text-gray-800 dark:text-white">Thống kê:</h4>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-green-600 dark:text-green-400">
                {word.correctCount}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Lần đúng</div>
            </div>
            <div>
              <div className="text-lg font-bold text-red-600 dark:text-red-400">
                {word.incorrectCount}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Lần sai</div>
            </div>
            <div>
              <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {Math.round((word.correctCount / Math.max(word.reviewCount, 1)) * 100)}%
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Độ chính xác</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
