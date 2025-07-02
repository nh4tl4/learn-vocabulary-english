'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useLearningSettingsStore } from '@/store/learningSettingsStore';
import { useRouter, useSearchParams } from 'next/navigation';
import { vocabularyAPI, topicsAPI } from '@/lib/api';
import { toast } from 'react-hot-toast';
import TextToSpeech from '@/components/TextToSpeech';

interface Vocabulary {
  id: number;
  word: string;
  meaning: string;
  pronunciation?: string;
  example?: string;
  exampleVi?: string;
  partOfSpeech?: string;
  level?: string;
  topic?: string;
}

interface TopicInfo {
  id: number;
  name: string;
  nameVi: string;
  description?: string;
  descriptionVi?: string;
  icon?: string;
}

export default function LearnNewContent() {
  const { isAuthenticated, loadUser } = useAuthStore();
  const { getTopicSettings, newWordsPerSession } = useLearningSettingsStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const topicId = searchParams.get('topicId'); // ✅ Changed from 'topic' to 'topicId'
  const level = searchParams.get('level'); // Add level support
  const limitParam = searchParams.get('limit');

  const [words, setWords] = useState<Vocabulary[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMeaning, setShowMeaning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [topicInfo, setTopicInfo] = useState<TopicInfo | null>(null);

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
      loadNewWords();
    }
  }, [isAuthenticated, topicId, level]); // ✅ Changed from 'topic' to 'topicId'

  // Load topic information when topicId changes
  useEffect(() => {
    if (topicId) {
      loadTopicInfo();
    }
  }, [topicId]);

  const loadTopicInfo = async () => {
    if (!topicId) return;

    try {
      const numericTopicId = parseInt(topicId);
      if (isNaN(numericTopicId)) return;

      const response = await topicsAPI.getById(numericTopicId);
      setTopicInfo(response.data);
    } catch (error) {
      console.error('Failed to load topic info:', error);
    }
  };

  const loadNewWords = async () => {
    try {
      setLoading(true);

      let limit = parseInt(limitParam || '10');

      let response;
      if (topicId) {
        // ✅ Convert topicId string to number and call API with topicId
        const numericTopicId = parseInt(topicId);
        if (isNaN(numericTopicId)) {
          toast.error('Topic ID không hợp lệ!');
          router.push('/learn');
          return;
        }

        // Load words by topicId with optional level filter
        response = await vocabularyAPI.getNewWordsByTopic(numericTopicId, limit, level || undefined);
      } else {
        // Load general new words with optional level filter
        response = await vocabularyAPI.getNewWords(limit, level || undefined);
      }

      if (response.data && response.data.length > 0) {
        setWords(response.data);
        setCurrentIndex(0);
        setShowMeaning(false);
      } else {
        const levelText = level ? ` (cấp độ ${level})` : '';
        const topicText = topicInfo ? ` trong chủ đề "${topicInfo.nameVi || topicInfo.name}"` : '';
        toast.error(`Không có từ mới nào để học${topicText}${levelText}!`);
        router.push('/learn');
      }
    } catch (error) {
      console.error('Failed to load new words:', error);
      toast.error('Không thể tải từ vựng mới!');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowMeaning(false);
    } else {
      toast.success('Bạn đã hoàn thành tất cả từ mới!');
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

  const handleLearnWord = async (quality: number) => {
    const currentWord = words[currentIndex];
    if (!currentWord) return;

    try {
      await vocabularyAPI.processStudySession({
        vocabularyId: currentWord.id,
        quality: quality,
        responseTime: 5000
      });

      // toast.success('Đã lưu tiến độ học!');
      handleNext();
    } catch (error) {
      console.error('Error processing study session:', error);
      toast.error('Không thể lưu tiến độ. Vui lòng thử lại.');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!words || words.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {topicId
              ? `Không có từ mới trong chủ đề ID "${topicId}"`
              : "Không có từ mới"
            }
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {topicId
              ? "Bạn đã học hết tất cả từ mới trong chủ đề này hoặc chưa có từ nào được thêm vào."
              : "Bạn đã học hết tất cả từ mới hoặc chưa có từ nào được thêm vào."
            }
          </p>
          <button
            onClick={() => router.push('/learn/topics')}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Quay lại danh sách chủ đề
          </button>
        </div>
      </div>
    );
  }

  const currentWord = words[currentIndex];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => router.push('/learn/topics')}
              className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Quay lại
            </button>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {currentIndex + 1} / {words.length}
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {topicInfo
              ? `Học từ mới: ${topicInfo.icon || '📚'} ${topicInfo.nameVi || topicInfo.name}`
              : topicId
              ? `Học từ mới: Chủ đề ID ${topicId}`
              : "Học từ mới"
            }
          </h1>

          {/* Progress bar */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / words.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Word Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8">
          <div className="text-center">
            {/* Word with Text-to-Speech */}
            <div className="flex items-center justify-center gap-4 mb-4">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                {currentWord.word}
              </h2>
              <TextToSpeech
                  text={currentWord.word}
                  size="md"
                  className="flex items-center justify-center w-12 h-12 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-600 dark:text-blue-400 rounded-full transition-colors"
              />
            </div>

            {/* Pronunciation */}
            {currentWord.pronunciation && (
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">
                /{currentWord.pronunciation}/
              </p>
            )}

            {/* Part of Speech & Topic */}
            <div className="flex justify-center gap-2 mb-6">
              {currentWord.partOfSpeech && (
                <span className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm px-3 py-1 rounded-full">
                  {currentWord.partOfSpeech}
                </span>
              )}
              {currentWord.topic && (
                <span className="inline-block bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-sm px-3 py-1 rounded-full">
                  {currentWord.topic}
                </span>
              )}
            </div>

            {/* Show/Hide Meaning Button */}
            {!showMeaning ? (
              <button
                onClick={handleShowMeaning}
                className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors"
              >
                Hiển thị nghĩa
              </button>
            ) : (
              <div className="space-y-4">
                {/* Meaning */}
                <div className="p-6 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <h3 className="text-lg font-semibold text-green-800 dark:text-green-400 mb-2">Nghĩa:</h3>
                  <p className="text-xl text-green-700 dark:text-green-300">{currentWord.meaning}</p>
                </div>

                {/* Example */}
                {currentWord.example && (
                  <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-400 mb-2">Ví dụ:</h3>
                    <p className="text-lg text-blue-700 dark:text-blue-300 italic">{currentWord.example}</p>
                    <p className="text-lg text-orange-300 dark:text-orange-400 italic">{currentWord.exampleVi}</p>
                  </div>
                )}

                {/* Learning buttons */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                  <button
                    onClick={() => handleLearnWord(1)}
                    className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                  >
                    😓 Khó
                  </button>
                  <button
                    onClick={() => handleLearnWord(3)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                  >
                    🤔 Trung bình
                  </button>
                  <button
                    onClick={() => handleLearnWord(5)}
                    className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                  >
                    😊 Dễ
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
            className="flex items-center px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Trước
          </button>

          <button
            onClick={handleNext}
            className="flex items-center px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
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
