'use client';

import { useState, useEffect } from 'react';
import { vocabularyAPI, userAPI } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { formatTopicDisplay, getTopicIcon, getVietnameseTopicName, getTopicColorClass, getTopicDisplayBilingual } from '@/lib/topicUtils';
import { ArrowLeftIcon, BookOpenIcon, PlayIcon, ChartBarIcon } from '@heroicons/react/24/outline';

interface TopicInfo {
  topic: string;
  topicVi: string;
  count: number;
}

interface TopicHistory {
  topic: string | null;
  sessionCount: number;
  wordsLearned: number;
  lastSelectedAt: string;
}

export default function TopicsPage() {
  const [availableTopics, setAvailableTopics] = useState<TopicInfo[]>([]);
  const [topicHistory, setTopicHistory] = useState<TopicHistory[]>([]);
  const [lastSelectedTopic, setLastSelectedTopic] = useState<string | null>(null);
  const [topicsLoading, setTopicsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setTopicsLoading(true);
      setError(null);

      // Load available topics with statistics
      const [topicsResponse, historyResponse, lastTopicResponse] = await Promise.all([
        vocabularyAPI.getTopicStats(1, 50),
        userAPI.getTopicHistory(),
        userAPI.getLastSelectedTopic()
      ]);

      // Process topics data
      const topics = topicsResponse.data.topics.map((item: any) => ({
        topic: item.topic,
        topicVi: item.topicVi, // Use topicVi from API response instead of getVietnameseTopicName
        count: item.count
      }));

      setAvailableTopics(topics);
      setTopicHistory(historyResponse.data || []);
      setLastSelectedTopic(lastTopicResponse.data?.topic || null);
    } catch (err: any) {
      console.error('Error loading topics data:', err);
      setError('Không thể tải danh sách chủ đề. Vui lòng thử lại.');
    } finally {
      setTopicsLoading(false);
    }
  };

  const handleTopicSelect = async (topic: string | null) => {
    try {
      // Save topic selection
      await userAPI.saveTopicSelection(topic);
      setLastSelectedTopic(topic);

      // Navigate to learning page with topic
      if (topic) {
        router.push(`/learn?topic=${encodeURIComponent(topic)}`);
      } else {
        router.push('/learn');
      }
    } catch (err) {
      console.error('Error selecting topic:', err);
    }
  };

  const getTopicHistory = (topic: string | null) => {
    return topicHistory.find(h => h.topic === topic);
  };

  if (topicsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center mb-6">
            <button
              onClick={() => router.back()}
              className="mr-4 p-2 rounded-lg hover:bg-white/50 transition-colors"
            >
              <ArrowLeftIcon className="w-6 h-6" />
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Chọn Chủ Đề</h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(9)].map((_, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-8 h-8 bg-gray-200 rounded"></div>
                  <div className="w-16 h-6 bg-gray-200 rounded"></div>
                </div>
                <div className="w-3/4 h-6 bg-gray-200 rounded mb-2"></div>
                <div className="w-1/2 h-4 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center mb-6">
            <button
              onClick={() => router.back()}
              className="mr-4 p-2 rounded-lg hover:bg-white/50 transition-colors"
            >
              <ArrowLeftIcon className="w-6 h-6" />
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Chọn Chủ Đề</h1>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={loadData}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-6">
          <button
            onClick={() => router.back()}
            className="mr-4 p-2 rounded-lg hover:bg-white/50 transition-colors"
          >
            <ArrowLeftIcon className="w-6 h-6" />
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Chọn Chủ Đề</h1>
        </div>

        {/* All Topics Option */}
        <div
          onClick={() => handleTopicSelect(null)}
          className={`mb-6 bg-white rounded-xl shadow-sm border-2 p-6 cursor-pointer transition-all hover:shadow-md hover:scale-[1.02] ${
            lastSelectedTopic === null ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <BookOpenIcon className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Tất cả chủ đề</h3>
                <p className="text-gray-600">Học từ vựng từ mọi chủ đề</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {lastSelectedTopic === null && (
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
                  Đang chọn
                </span>
              )}
              <PlayIcon className="w-5 h-5 text-blue-600" />
            </div>
          </div>

          {/* History for all topics */}
          {getTopicHistory(null) && (
            <div className="flex items-center space-x-4 text-sm text-gray-600 mt-3 pt-3 border-t border-gray-100">
              <span>📚 {getTopicHistory(null)?.sessionCount} phiên học</span>
              <span>✅ {getTopicHistory(null)?.wordsLearned} từ ����ã học</span>
            </div>
          )}
        </div>

        {/* Topic Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {availableTopics.map((topicInfo) => {
            const IconComponent = getTopicIcon(topicInfo.topic);
            const history = getTopicHistory(topicInfo.topic);
            const isSelected = lastSelectedTopic === topicInfo.topic;

            return (
              <div
                key={topicInfo.topic}
                onClick={() => handleTopicSelect(topicInfo.topic)}
                className={`bg-white rounded-xl shadow-sm border-2 p-6 cursor-pointer transition-all hover:shadow-md hover:scale-[1.02] ${
                  isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <IconComponent className="w-8 h-8 text-blue-600" />
                  <div className="flex items-center space-x-2">
                    {isSelected && (
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                        Đang chọn
                      </span>
                    )}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getTopicColorClass(topicInfo.topic)}`}>
                      {topicInfo.count} từ
                    </span>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {getTopicDisplayBilingual(topicInfo.topic, topicInfo.topicVi)}
                </h3>
                <p className="text-gray-600 text-sm mb-3">
                  {topicInfo.count} từ vựng có sẵn
                </p>

                {/* Topic Statistics */}
                {history && (
                  <div className="flex items-center space-x-3 text-sm text-gray-600 pt-3 border-t border-gray-100">
                    <span className="flex items-center">
                      <ChartBarIcon className="w-4 h-4 mr-1" />
                      {history.sessionCount} phiên
                    </span>
                    <span className="flex items-center">
                      <BookOpenIcon className="w-4 h-4 mr-1" />
                      {history.wordsLearned} từ
                    </span>
                  </div>
                )}

                <div className="mt-4 flex justify-end">
                  <PlayIcon className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            );
          })}
        </div>

        {availableTopics.length === 0 && (
          <div className="text-center py-12">
            <BookOpenIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có ch�� đề nào</h3>
            <p className="text-gray-600">
              Hiện tại chưa có chủ đề nào được tải. Vui lòng thử lại sau.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
