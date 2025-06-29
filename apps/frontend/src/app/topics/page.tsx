'use client';

import { useState, useEffect } from 'react';
import { vocabularyAPI, userAPI } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { getTopicIcon, getTopicColorClass, getTopicDisplayBilingual } from '@/lib/topicUtils';
import { ArrowLeftIcon, BookOpenIcon, CheckIcon } from '@heroicons/react/24/outline';

interface TopicInfo {
  topic: string;
  topicVi: string;
  count: number;
}

interface SelectedTopics {
  topics: string[];
}

export default function TopicsPage() {
  const [availableTopics, setAvailableTopics] = useState<TopicInfo[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [topicsLoading, setTopicsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setTopicsLoading(true);
      setError(null);

      // Load available topics and user's selected topics
      const [topicsResponse, selectedTopicsResponse] = await Promise.all([
        vocabularyAPI.getTopicStats(1, 50),
        userAPI.getSelectedTopics().catch(() => ({ data: { topics: [] } })) // Fallback if API doesn't exist yet
      ]);

      // Process topics data
      const topics = topicsResponse.data.topics.map((item: any) => ({
        topic: item.topic,
        topicVi: item.topicVi,
        count: item.count
      }));

      setAvailableTopics(topics);
      setSelectedTopics(selectedTopicsResponse.data.topics || []);
    } catch (err: any) {
      console.error('Error loading topics data:', err);
      setError('Không thể tải danh sách chủ đề. Vui lòng thử lại.');
    } finally {
      setTopicsLoading(false);
    }
  };

  const handleTopicToggle = (topic: string) => {
    setSelectedTopics(prev => {
      if (prev.includes(topic)) {
        return prev.filter(t => t !== topic);
      } else {
        return [...prev, topic];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedTopics.length === availableTopics.length) {
      setSelectedTopics([]);
    } else {
      setSelectedTopics(availableTopics.map(t => t.topic));
    }
  };

  const handleSaveSelection = async () => {
    try {
      setSaving(true);
      setError(null);

      // Save selected topics to database
      await userAPI.saveSelectedTopics(selectedTopics);

      setSuccess('Đã lưu lựa chọn chủ đề thành công!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Error saving selected topics:', err);
      setError('Không thể lưu lựa chọn. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
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
          onClick={() => handleTopicToggle('all')}
          className={`mb-6 bg-white rounded-xl shadow-sm border-2 p-6 cursor-pointer transition-all hover:shadow-md hover:scale-[1.02] ${
            selectedTopics.length === availableTopics.length ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
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
              {selectedTopics.length === availableTopics.length && (
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
                  Đã chọn tất cả
                </span>
              )}
              <CheckIcon className="w-5 h-5 text-blue-600" />
            </div>
          </div>

          {/* Statistics for all topics */}
          <div className="flex items-center space-x-4 text-sm text-gray-600 mt-3 pt-3 border-t border-gray-100">
            <span>📚 {availableTopics.length} chủ đề</span>
            <span>✅ {availableTopics.reduce((sum, topic) => sum + topic.count, 0)} từ vựng</span>
          </div>
        </div>

        {/* Topic Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {availableTopics.map((topicInfo) => {
            const IconComponent = getTopicIcon(topicInfo.topic);
            const isSelected = selectedTopics.includes(topicInfo.topic);

            return (
              <div
                key={topicInfo.topic}
                onClick={() => handleTopicToggle(topicInfo.topic)}
                className={`bg-white rounded-xl shadow-sm border-2 p-6 cursor-pointer transition-all hover:shadow-md hover:scale-[1.02] ${
                  isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <IconComponent className="w-8 h-8 text-blue-600" />
                  <div className="flex items-center space-x-2">
                    {isSelected && (
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                        Đã chọn
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
              </div>
            );
          })}
        </div>

        {availableTopics.length === 0 && (
          <div className="text-center py-12">
            <BookOpenIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có chủ đề nào</h3>
            <p className="text-gray-600">
              Hiện tại chưa có chủ đề nào được tải. Vui lòng thử lại sau.
            </p>
          </div>
        )}

        {/* Save Selection Button */}
        <div className="mt-8">
          <button
            onClick={handleSaveSelection}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
            disabled={saving}
          >
            {saving ? (
              <>
                <svg className="animate-spin h-5 w-5 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4zm16 0a8 8 0 01-8 8v-8h8z"></path>
                </svg>
                <span>Đang lưu...</span>
              </>
            ) : (
              <span>Lưu lựa chọn chủ đề</span>
            )}
          </button>

          {/* Success and Error Messages */}
          {success && (
            <div className="mt-4 text-center text-green-600">
              {success}
            </div>
          )}
          {error && (
            <div className="mt-4 text-center text-red-600">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
