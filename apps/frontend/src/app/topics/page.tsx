'use client';

import { useState, useEffect } from 'react';
import { topicsAPI, userAPI } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { Topic } from '@/types';
import Toast from '@/components/Toast';

export default function TopicsPage() {
  const [availableTopics, setAvailableTopics] = useState<Topic[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  // Toast state
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
    isVisible: boolean;
  }>({
    message: '',
    type: 'success',
    isVisible: false
  });
  const router = useRouter();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Chỉ lấy danh sách topics đã chọn từ user, không cần vocabulary count
      // Vocabulary count sẽ được lấy khi thực sự vào học
      const [allTopicsResponse, selectedResponse] = await Promise.all([
        topicsAPI.getAll(), // Lấy tất cả topics (không có count) để hiển thị danh sách chọn
        userAPI.getSelectedTopics().catch(() => ({ data: { topics: [] } }))
      ]);

      console.log('All topics from database:', allTopicsResponse.data);
      console.log('Selected topics:', selectedResponse.data);

      // Sử dụng tất cả topics để cho phép chọn, nhưng không cần count
      const allTopics = allTopicsResponse.data || [];

      setAvailableTopics(allTopics);
      setSelectedTopics(selectedResponse.data?.topics || []);
    } catch (err: any) {
      console.error('Error loading topics:', err);
      setError('Không thể tải danh sách chủ đề. Vui lòng thử lại.');
    } finally {
      setLoading(false);
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
      setSelectedTopics(availableTopics.map(t => t.name)); // Sử dụng t.name thay vì t.topic
    }
  };

  const handleSave = async () => {
    if (selectedTopics.length === 0) {
      setError('Vui lòng chọn ít nhất một chủ đề.');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      await userAPI.saveSelectedTopics(selectedTopics);
      setSuccess('Đã lưu lựa chọn thành công!');
      setToast({ message: 'Đã lưu lựa chọn thành công!', type: 'success', isVisible: true });
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Không thể lưu. Vui lòng thử lại.');
      setToast({ message: 'Không thể lưu. Vui lòng thử lại.', type: 'error', isVisible: true });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-950 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center mb-8">
            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse mr-4"></div>
            <div className="space-y-2">
              <div className="w-48 h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              <div className="w-32 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={`skeleton-${i}`} className="bg-white dark:bg-gray-800 rounded-lg p-4 animate-pulse">
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg mx-auto mb-3"></div>
                <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="w-3/4 h-3 bg-gray-200 dark:bg-gray-700 rounded mx-auto"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const isAllSelected = selectedTopics.length === availableTopics.length && availableTopics.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-950 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => router.back()}
            className="mr-4 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <span className="block w-6 h-6 text-gray-600 dark:text-gray-300">←</span>
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Chọn Chủ Đề Yêu Thích
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Chọn các chủ đề bạn muốn tập trung học tập
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center shadow-sm">
            <div className="text-2xl mb-2">✨</div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedTopics.length}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Đã chọn</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center shadow-sm">
            <div className="text-2xl mb-2">🔥</div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{availableTopics.length}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Tổng chủ đề</p>
          </div>
        </div>

        {/* Select All */}
        <div
          onClick={handleSelectAll}
          className={`mb-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 cursor-pointer transition-all hover:shadow-lg ${
            isAllSelected ? 'ring-4 ring-blue-300' : ''
          }`}
        >
          <div className="flex items-center justify-between text-white">
            <div>
              <h3 className="text-xl font-bold mb-1">Tất cả chủ đề</h3>
              <p className="text-blue-100">Học đa dạng từ mọi lĩnh vực</p>
            </div>
            <div className="flex items-center">
              {isAllSelected && (
                <span className="bg-white/20 px-3 py-1 rounded-full text-sm mr-3">
                  ✓ Đã chọn tất cả
                </span>
              )}
              <div className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center ${
                isAllSelected ? 'bg-white text-blue-600' : ''
              }`}>
                <span>{isAllSelected ? '✓' : ''}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Topics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          {availableTopics.map((topic) => {
            const isSelected = selectedTopics.includes(topic.name); // Sử dụng topic.name

            return (
              <div
                key={`topic-${topic.name}`} // Sử dụng topic.name
                onClick={() => handleTopicToggle(topic.name)} // Sử dụng topic.name
                className={`relative bg-white dark:bg-gray-800 rounded-lg p-4 cursor-pointer transition-all hover:shadow-lg hover:scale-105 ${
                  isSelected 
                    ? 'ring-2 ring-purple-500 bg-purple-50 dark:bg-purple-900/20' 
                    : 'shadow-sm'
                }`}
              >
                {/* Selection indicator */}
                <div className={`absolute top-2 right-2 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  isSelected 
                    ? 'bg-purple-500 border-white' 
                    : 'border-gray-300 dark:border-gray-600'
                }`}>
                  {isSelected && <span className="text-white text-xs">✓</span>}
                </div>

                <div className="text-center">
                  {/* Icon - Sử dụng icon từ database */}
                  <div className={`w-12 h-12 mx-auto mb-3 rounded-lg flex items-center justify-center text-2xl ${
                    isSelected 
                      ? 'bg-purple-500 text-white' 
                      : 'bg-gray-100 dark:bg-gray-700'
                  }`}>
                    {topic.icon || '📖'} {/* Sử dụng topic.icon từ database */}
                  </div>

                  {/* Name - Sử dụng nameVi từ database */}
                  <h3 className="font-semibold text-sm mb-2 text-gray-900 dark:text-white">
                    {topic.nameVi || topic.name} {/* Sử dụng topic.nameVi hoặc fallback topic.name */}
                  </h3>

                  {/* Count - Sử dụng vocabularyCount từ database */}
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    isSelected 
                      ? 'bg-purple-200 text-purple-800 dark:bg-purple-800 dark:text-purple-200' 
                      : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                  }`}>
                    {topic.vocabularyCount || 0} từ {/* Sử dụng topic.vocabularyCount */}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleSave}
            disabled={saving || selectedTopics.length === 0}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            {saving ? 'Đang lưu...' : `Lưu lựa chọn (${selectedTopics.length})`}
          </button>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Về trang chủ
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div className="mt-4 p-4 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded-lg">
            <p className="text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}
        {success && (
          <div className="mt-4 p-4 bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-800 rounded-lg">
            <p className="text-green-700 dark:text-green-400">{success}</p>
          </div>
        )}

        {/* Toast Notification */}
        <Toast
          message={toast.message}
          type={toast.type}
          isVisible={toast.isVisible}
          onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
        />
      </div>
    </div>
  );
}
