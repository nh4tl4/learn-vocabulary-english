'use client';

import { useState, useEffect } from 'react';
import { vocabularyAPI, userAPI } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { formatTopicDisplay, getTopicIcon, getVietnameseTopicName } from '@/lib/topicUtils';
import { XMarkIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import MobileButton from './MobileOptimized/MobileButton';
import AIAssistant from './AIAssistant';

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
}

interface TopicInfo {
  topic: string;
  topicVi: string;
  count: number;
}

export default function StudySession() {
  const [words, setWords] = useState<Vocabulary[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMeaning, setShowMeaning] = useState(false);
  const [wordStartTime, setWordStartTime] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [learnedCount, setLearnedCount] = useState(0);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [showTopicSelector, setShowTopicSelector] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [availableTopics, setAvailableTopics] = useState<TopicInfo[]>([]);
  const [topicsLoading, setTopicsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [topicHistory, setTopicHistory] = useState<any[]>([]);
  const [lastSelectedTopic, setLastSelectedTopic] = useState<string | null>(null);
  const router = useRouter();

  // Load topic history and available topics on component mount
  useEffect(() => {
    loadTopicHistory();
    loadAvailableTopics();
  }, []);

  const loadTopicHistory = async () => {
    try {
      const [historyResponse, lastTopicResponse] = await Promise.all([
        userAPI.getTopicHistory(),
        userAPI.getLastSelectedTopic()
      ]);

      setTopicHistory(historyResponse.data);
      if (lastTopicResponse.data) {
        setLastSelectedTopic(lastTopicResponse.data.topic);
      }
    } catch (error) {
      console.error('Failed to load topic history:', error);
      // Fallback to localStorage if API fails
      const savedTopic = localStorage.getItem('lastSelectedTopic');
      if (savedTopic && savedTopic !== 'null') {
        setLastSelectedTopic(savedTopic);
      }
    }
  };

  const loadAvailableTopics = async () => {
    try {
      setTopicsLoading(true);
      setError(null);
      const response = await vocabularyAPI.getTopicStats();
      const topics = response.data.map((item: any) => ({
        topic: item.topic,
        topicVi: item.topicVi || getVietnameseTopicName(item.topic),
        count: item.count
      }));
      setAvailableTopics(topics);
    } catch (error) {
      console.error('Failed to load topics:', error);
      setError('Không thể tải danh sách chủ đề. Vui lòng thử lại.');
    } finally {
      setTopicsLoading(false);
    }
  };

  const handleTopicSelect = async (topic: string | null) => {
    setSelectedTopic(topic);
    setShowTopicSelector(false);
    setLoading(true);
    setError(null);

    // Save topic selection to database
    try {
      await userAPI.saveTopicSelection(topic);
      // Update local state
      setLastSelectedTopic(topic);
    } catch (error) {
      console.error('Failed to save topic selection:', error);
      // Fallback to localStorage
      if (typeof window !== 'undefined') {
        if (topic) {
          localStorage.setItem('lastSelectedTopic', topic);
        } else {
          localStorage.removeItem('lastSelectedTopic');
        }
      }
    }

    try {
      let response;
      if (topic) {
        response = await vocabularyAPI.getNewWordsByTopic(topic, 10);
      } else {
        response = await vocabularyAPI.getNewWords(10);
      }

      setWords(response.data);
      setWordStartTime(Date.now());
      setCurrentIndex(0);
      setShowMeaning(false);
      setLearnedCount(0);
      setSessionComplete(false);
    } catch (error) {
      console.error('Failed to load words:', error);
      setError('Không thể tải từ vựng. Vui lòng thử lại.');
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
        // Phiên học hoàn thành - cập nhật số từ đã học cho chủ đề
        try {
          await userAPI.updateTopicWordsLearned(selectedTopic, learnedCount + 1);
        } catch (error) {
          console.error('Failed to update topic words learned:', error);
        }
        setSessionComplete(true);
      }
    } catch (error) {
      console.error('Failed to process study session:', error);
    }
  };

  const handleRestartWithDifferentTopic = () => {
    setShowTopicSelector(true);
    setWords([]);
    setCurrentIndex(0);
    setSessionComplete(false);
    setLearnedCount(0);
    setError(null);
  };

  // Topic Selector Modal
  if (showTopicSelector) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => router.push('/learn')}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <ArrowLeftIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                </button>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                  Chọn Chủ Đề Học Tập
                </h2>
              </div>
              <button
                onClick={() => router.push('/learn')}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <XMarkIcon className="h-6 w-6 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Chọn một chủ đề c��� thể để học từ v��ng có tính tập trung cao, hoặc chọn "Tất cả chủ đề" để học đa dạng.
            </p>

            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-600 dark:text-red-400">{error}</p>
                <button
                  onClick={loadAvailableTopics}
                  className="mt-2 text-red-600 dark:text-red-400 underline hover:no-underline"
                >
                  Thử lại
                </button>
              </div>
            )}

            {topicsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600 dark:text-gray-400">Đang tải chủ đề...</span>
              </div>
            ) : (
              <div className="max-h-[60vh] overflow-y-auto">
                <div className="space-y-4">
                  {/* Hiển thị chủ đề đã chọn trước đó */}
                  {lastSelectedTopic && (
                    <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-blue-600 dark:text-blue-400">🔄</span>
                          <span className="text-sm text-blue-700 dark:text-blue-300">
                            Lần trước bạn đã chọn: <strong>{getVietnameseTopicName(lastSelectedTopic)}</strong>
                          </span>
                        </div>
                        <button
                          onClick={() => handleTopicSelect(lastSelectedTopic)}
                          className="text-xs bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-200 px-2 py-1 rounded-md hover:bg-blue-200 dark:hover:bg-blue-700 transition-colors"
                        >
                          Chọn lại
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Tùy chọn học tất cả */}
                  <button
                    onClick={() => handleTopicSelect(null)}
                    className={`w-full p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-lg hover:shadow-md transition-all duration-200 hover:scale-[1.02] text-left group ${
                      lastSelectedTopic === null ? 'ring-2 ring-blue-500 dark:ring-blue-400' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                          <span className="text-xl">🌟</span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800 dark:text-white text-lg">
                            Tất Cả Chủ Đề
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Học đa dạng từ nhiều chủ đề khác nhau
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {lastSelectedTopic === null && (
                          <span className="text-xs text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900 px-2 py-1 rounded-full">
                            Lần trước
                          </span>
                        )}
                        <div className="text-xs text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900 px-3 py-1 rounded-full font-medium">
                          Tổng hợp
                        </div>
                      </div>
                    </div>
                  </button>

                  {/* Danh sách topics */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {availableTopics.map((topicInfo) => (
                      <button
                        key={topicInfo.topic}
                        onClick={() => handleTopicSelect(topicInfo.topic)}
                        className={`p-4 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:shadow-md transition-all duration-200 hover:scale-[1.02] text-left group ${
                          lastSelectedTopic === topicInfo.topic ? 'ring-2 ring-blue-500 dark:ring-blue-400' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                              <span className="text-lg">{getTopicIcon(topicInfo.topic)}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-gray-800 dark:text-white text-sm truncate">
                                {formatTopicDisplay(topicInfo.topic, topicInfo.topicVi)}
                              </h3>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                {topicInfo.count} từ có sẵn
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {lastSelectedTopic === topicInfo.topic && (
                              <span className="text-xs text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900 px-2 py-1 rounded-full">
                                Lần trước
                              </span>
                            )}
                            <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded">
                              {topicInfo.count}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            {selectedTopic
              ? `Đang tải từ vựng chủ đề "${getVietnameseTopicName(selectedTopic)}"...`
              : 'Đang tải từ vựng...'
            }
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-4 sm:p-6 text-center">
        <div className="text-4xl sm:text-6xl mb-4">⚠️</div>
        <h2 className="text-xl sm:text-2xl font-bold mb-4">Có lỗi xảy ra</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <MobileButton
            variant="outline"
            onClick={handleRestartWithDifferentTopic}
          >
            Thử lại
          </MobileButton>
          <MobileButton
            variant="primary"
            onClick={() => router.push('/learn')}
          >
            Quay lại
          </MobileButton>
        </div>
      </div>
    );
  }

  if (words.length === 0) {
    return (
      <div className="max-w-2xl mx-auto p-4 sm:p-6 text-center">
        <div className="text-4xl sm:text-6xl mb-4">📚</div>
        <h2 className="text-xl sm:text-2xl font-bold mb-4">
          {selectedTopic
            ? `Không có từ mới trong chủ đề "${getVietnameseTopicName(selectedTopic)}"!`
            : 'Không có từ mới!'
          }
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm sm:text-base">
          {selectedTopic
            ? 'Bạn đã hoàn thành tất cả từ trong chủ đề này. Hãy thử chủ đề khác!'
            : 'Bạn đã hoàn thành mục tiêu học tập hôm nay. Tuyệt vời!'
          }
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <MobileButton
            variant="outline"
            onClick={handleRestartWithDifferentTopic}
          >
            Chọn Chủ Đề Khác
          </MobileButton>
          <MobileButton
            variant="primary"
            onClick={() => router.push('/dashboard')}
          >
            Về Trang Chủ
          </MobileButton>
        </div>
      </div>
    );
  }

  if (sessionComplete) {
    const selectedTopicDisplay = selectedTopic ? getVietnameseTopicName(selectedTopic) : 'Tất cả chủ đề';

    return (
      <div className="max-w-2xl mx-auto p-4 sm:p-6 text-center">
        <div className="mb-6">
          <div className="text-4xl sm:text-6xl mb-4">🎉</div>
          <h2 className="text-xl sm:text-2xl font-bold mb-4">Hoàn thành phiên học!</h2>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
            <p className="text-gray-600 dark:text-gray-400 mb-2 text-sm sm:text-base">
              <strong>Chủ đề:</strong> {selectedTopicDisplay}
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
              Bạn đã học <strong className="text-green-600">{learnedCount}</strong> từ mới. Tuyệt vời!
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <MobileButton
              variant="outline"
              onClick={handleRestartWithDifferentTopic}
            >
              Chọn Chủ Đề Khác
            </MobileButton>
            <MobileButton
              variant="secondary"
              onClick={() => router.push('/dashboard')}
            >
              Về Trang Chủ
            </MobileButton>
            <MobileButton
              variant="primary"
              onClick={() => handleTopicSelect(selectedTopic)}
            >
              Học Tiếp
            </MobileButton>
          </div>
        </div>
      </div>
    );
  }

  const currentWord = words[currentIndex];
  const selectedTopicDisplay = selectedTopic ? getVietnameseTopicName(selectedTopic) : 'Tất cả chủ đề';

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-1">Học Từ Mới</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <strong>Chủ đề:</strong> {selectedTopicDisplay}
            </p>
          </div>
          <div className="flex items-center gap-3 mt-3 sm:mt-0">
            <div className="text-sm sm:text-base text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
              {currentIndex + 1} / {words.length}
            </div>
            <MobileButton
              variant="outline"
              size="sm"
              onClick={handleRestartWithDifferentTopic}
            >
              Đổi Chủ Đề
            </MobileButton>
            <button
              onClick={() => setShowAIAssistant(true)}
              className="bg-purple-500 text-white px-3 py-1 rounded-lg hover:bg-purple-600 text-xs sm:text-sm flex items-center gap-1 transition-colors"
            >
              🤖 AI Trợ Lý
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${((currentIndex + 1) / words.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Word Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 sm:p-8 mb-6 sm:mb-8">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-3xl sm:text-5xl font-bold text-gray-800 dark:text-white mb-3">
            {currentWord.word}
          </h2>
          {currentWord.pronunciation && (
            <p className="text-gray-500 dark:text-gray-400 text-lg sm:text-xl mb-4">
              /{currentWord.pronunciation}/
            </p>
          )}
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {currentWord.partOfSpeech && (
              <span className="inline-block bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-3 py-1 rounded-full text-sm font-medium">
                {currentWord.partOfSpeech}
              </span>
            )}
            {currentWord.level && (
              <span className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm font-medium">
                {currentWord.level}
              </span>
            )}
            {(currentWord.topic || currentWord.topicVi) && (
              <span className="flex items-center gap-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-3 py-1 rounded-full text-sm font-medium">
                <span>{getTopicIcon(currentWord.topic || '')}</span>
                <span>{formatTopicDisplay(currentWord.topic, currentWord.topicVi)}</span>
              </span>
            )}
          </div>
        </div>

        {showMeaning && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6 sm:pt-8">
            <div className="mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-semibold mb-3 text-gray-800 dark:text-white">Nghĩa:</h3>
              <p className="text-gray-700 dark:text-gray-300 text-base sm:text-lg leading-relaxed">
                {currentWord.meaning}
              </p>
            </div>

            {currentWord.example && (
              <div className="mb-6 sm:mb-8">
                <h3 className="text-lg sm:text-xl font-semibold mb-3 text-gray-800 dark:text-white">Ví dụ:</h3>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="text-gray-700 dark:text-gray-300 italic text-base sm:text-lg leading-relaxed">
                    "{currentWord.example}"
                  </p>
                </div>
              </div>
            )}

            {/* AI Helper Button */}
            <div className="mb-6 sm:mb-8 text-center">
              <button
                onClick={() => setShowAIAssistant(true)}
                className="bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-200 px-4 py-2 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-800 text-sm sm:text-base inline-flex items-center gap-2 transition-colors"
              >
                🤖 Nhờ AI tạo thêm ví dụ và mẹo học
              </button>
            </div>

            {/* Quality Rating Buttons */}
            <div className="space-y-3 sm:space-y-0 sm:space-x-4 sm:flex">
              <button
                onClick={() => handleQualityRating(1)}
                className="w-full sm:flex-1 bg-red-500 text-white px-4 py-3 rounded-lg hover:bg-red-600 text-sm sm:text-base font-medium transition-colors"
              >
                Khó nhớ 😰
              </button>
              <button
                onClick={() => handleQualityRating(3)}
                className="w-full sm:flex-1 bg-yellow-500 text-white px-4 py-3 rounded-lg hover:bg-yellow-600 text-sm sm:text-base font-medium transition-colors"
              >
                Bình thường 😐
              </button>
              <button
                onClick={() => handleQualityRating(5)}
                className="w-full sm:flex-1 bg-green-500 text-white px-4 py-3 rounded-lg hover:bg-green-600 text-sm sm:text-base font-medium transition-colors"
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
              className="bg-green-600 text-white px-8 py-4 rounded-lg hover:bg-green-700 text-lg font-medium transition-colors shadow-lg hover:shadow-xl"
            >
              Hiển thị nghĩa
            </button>
          </div>
        )}
      </div>

      {/* Help Text */}
      <div className="text-center text-gray-500 dark:text-gray-400 text-sm">
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
