'use client';

import { useState } from 'react';
import { useLearningSettingsStore } from '@/store/learningSettingsStore';
import { Cog6ToothIcon } from '@heroicons/react/24/outline';

interface LearningSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  topic?: string; // Nếu có topic, sẽ cấu hình cho topic cụ thể
}

export default function LearningSettingsModal({ isOpen, onClose, topic }: LearningSettingsModalProps) {
  const {
    newWordsPerSession,
    reviewWordsPerSession,
    testWordsPerSession,
    setNewWordsPerSession,
    setReviewWordsPerSession,
    setTestWordsPerSession,
    getTopicSettings,
    setTopicSettings,
  } = useLearningSettingsStore();

  const [localSettings, setLocalSettings] = useState(() => {
    if (topic) {
      return getTopicSettings(topic);
    }
    return {
      newWordsPerSession,
      reviewWordsPerSession,
      testWordsPerSession,
    };
  });

  const handleSave = () => {
    if (topic) {
      // Lưu cấu hình cho topic cụ thể
      setTopicSettings(topic, localSettings);
    } else {
      // Lưu cấu hình tổng quát
      setNewWordsPerSession(localSettings.newWordsPerSession);
      setReviewWordsPerSession(localSettings.reviewWordsPerSession);
      setTestWordsPerSession(localSettings.testWordsPerSession);
    }
    onClose();
  };

  const handleReset = () => {
    if (topic) {
      setTopicSettings(topic, {});
      setLocalSettings({
        newWordsPerSession,
        reviewWordsPerSession,
        testWordsPerSession,
      });
    } else {
      setLocalSettings({
        newWordsPerSession: 10,
        reviewWordsPerSession: 20,
        testWordsPerSession: 15,
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Cog6ToothIcon className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {topic ? `Cấu hình cho "${topic}"` : 'Cấu hình học tập'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {topic && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Cấu hình này chỉ áp dụng cho chủ đề "{topic}". Để trống sẽ sử dụng cấu hình mặc định.
            </p>
          )}
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Học từ mới */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              📚 Số từ mới mỗi session
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="range"
                min="1"
                max="50"
                value={localSettings.newWordsPerSession}
                onChange={(e) => setLocalSettings(prev => ({
                  ...prev,
                  newWordsPerSession: parseInt(e.target.value)
                }))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              />
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={localSettings.newWordsPerSession}
                  onChange={(e) => setLocalSettings(prev => ({
                    ...prev,
                    newWordsPerSession: Math.max(1, Math.min(50, parseInt(e.target.value) || 1))
                  }))}
                  className="w-16 px-2 py-1 text-center border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                />
                <span className="text-sm text-gray-500 dark:text-gray-400">từ</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Số lượng từ mới học trong mỗi session (1-50)
            </p>
          </div>

          {/* Ôn tập */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              🔄 Số từ ôn tập mỗi session
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="range"
                min="1"
                max="100"
                value={localSettings.reviewWordsPerSession}
                onChange={(e) => setLocalSettings(prev => ({
                  ...prev,
                  reviewWordsPerSession: parseInt(e.target.value)
                }))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              />
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={localSettings.reviewWordsPerSession}
                  onChange={(e) => setLocalSettings(prev => ({
                    ...prev,
                    reviewWordsPerSession: Math.max(1, Math.min(100, parseInt(e.target.value) || 1))
                  }))}
                  className="w-16 px-2 py-1 text-center border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                />
                <span className="text-sm text-gray-500 dark:text-gray-400">từ</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Số lượng từ ôn tập trong mỗi session (1-100)
            </p>
          </div>

          {/* Kiểm tra */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              📝 Số từ trong bài kiểm tra
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="range"
                min="1"
                max="50"
                value={localSettings.testWordsPerSession}
                onChange={(e) => setLocalSettings(prev => ({
                  ...prev,
                  testWordsPerSession: parseInt(e.target.value)
                }))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              />
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={localSettings.testWordsPerSession}
                  onChange={(e) => setLocalSettings(prev => ({
                    ...prev,
                    testWordsPerSession: Math.max(1, Math.min(50, parseInt(e.target.value) || 1))
                  }))}
                  className="w-16 px-2 py-1 text-center border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                />
                <span className="text-sm text-gray-500 dark:text-gray-400">từ</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Số lượng từ trong mỗi bài kiểm tra (1-50)
            </p>
          </div>

          {/* Preview */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">
              📋 Xem trước cấu hình
            </h4>
            <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <p>• Học từ mới: {localSettings.newWordsPerSession} từ/session</p>
              <p>• Ôn tập: {localSettings.reviewWordsPerSession} từ/session</p>
              <p>• Kiểm tra: {localSettings.testWordsPerSession} từ/bài</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-between">
          <button
            onClick={handleReset}
            className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            Đặt lại mặc định
          </button>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
            >
              Lưu cấu hình
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
