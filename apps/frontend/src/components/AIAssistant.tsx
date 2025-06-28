'use client';

import { useState } from 'react';
import { aiAPI } from '@/lib/api';

interface AIAssistantProps {
  word?: string;
  meaning?: string;
  onClose?: () => void;
}

export default function AIAssistant({ word, meaning, onClose }: AIAssistantProps) {
  const [activeTab, setActiveTab] = useState<'examples' | 'pronunciation' | 'motivation'>('examples');
  const [examples, setExamples] = useState<string[]>([]);
  const [pronunciationTip, setPronunciationTip] = useState('');
  const [motivation, setMotivation] = useState('');
  const [loading, setLoading] = useState(false);

  const generateExamples = async () => {
    if (!word || !meaning) return;

    setLoading(true);
    try {
      const response = await aiAPI.generateExamples(word, meaning);
      setExamples(response.data.examples);
    } catch (error) {
      console.error('Failed to generate examples:', error);
      setExamples([`Ví dụ cho từ "${word}" sẽ được tạo sau.`]);
    } finally {
      setLoading(false);
    }
  };

  const getPronunciationTip = async () => {
    if (!word) return;

    setLoading(true);
    try {
      const response = await aiAPI.getPronunciationTip(word);
      setPronunciationTip(response.data.pronunciationTip);
    } catch (error) {
      console.error('Failed to get pronunciation tip:', error);
      setPronunciationTip(`Mẹo phát âm cho "${word}" sẽ được tạo sau.`);
    } finally {
      setLoading(false);
    }
  };

  const getMotivation = async () => {
    setLoading(true);
    try {
      const response = await aiAPI.getMotivation();
      setMotivation(response.data.message);
    } catch (error) {
      console.error('Failed to get motivation:', error);
      setMotivation('Bạn đang học rất tốt! Hãy tiếp tục cố gắng! 💪');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab: 'examples' | 'pronunciation' | 'motivation') => {
    setActiveTab(tab);

    if (tab === 'examples' && examples.length === 0) {
      generateExamples();
    } else if (tab === 'pronunciation' && !pronunciationTip) {
      getPronunciationTip();
    } else if (tab === 'motivation' && !motivation) {
      getMotivation();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="text-2xl mr-3">🤖</div>
              <div>
                <h3 className="font-semibold text-lg">AI Trợ Lý</h3>
                {word && <p className="text-sm opacity-90">Hỗ trợ học từ: {word}</p>}
              </div>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="text-white hover:bg-white/20 rounded-full p-1 w-8 h-8 flex items-center justify-center"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => handleTabChange('examples')}
            className={`flex-1 py-3 px-4 text-sm font-medium ${
              activeTab === 'examples'
                ? 'border-b-2 border-purple-500 text-purple-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            📝 Ví dụ
          </button>
          <button
            onClick={() => handleTabChange('pronunciation')}
            className={`flex-1 py-3 px-4 text-sm font-medium ${
              activeTab === 'pronunciation'
                ? 'border-b-2 border-purple-500 text-purple-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            🔊 Phát âm
          </button>
          <button
            onClick={() => handleTabChange('motivation')}
            className={`flex-1 py-3 px-4 text-sm font-medium ${
              activeTab === 'motivation'
                ? 'border-b-2 border-purple-500 text-purple-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            💪 Động lực
          </button>
        </div>

        {/* Content */}
        <div className="p-4 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
              <span className="ml-2 text-gray-600">AI đang suy nghĩ...</span>
            </div>
          ) : (
            <>
              {activeTab === 'examples' && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-800">Câu ví dụ với AI:</h4>
                  {examples.length > 0 ? (
                    examples.map((example, index) => (
                      <div key={index} className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-gray-700 italic">"{example}"</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">Nhấn vào tab để tạo ví dụ với AI</p>
                  )}
                </div>
              )}

              {activeTab === 'pronunciation' && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-800">Mẹo phát âm từ AI:</h4>
                  {pronunciationTip ? (
                    <div className="bg-green-50 p-3 rounded-lg">
                      <p className="text-gray-700">{pronunciationTip}</p>
                    </div>
                  ) : (
                    <p className="text-gray-500">Nhấn vào tab để nhận mẹo phát âm</p>
                  )}
                </div>
              )}

              {activeTab === 'motivation' && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-800">Lời động viên từ AI:</h4>
                  {motivation ? (
                    <div className="bg-yellow-50 p-3 rounded-lg">
                      <p className="text-gray-700">{motivation}</p>
                    </div>
                  ) : (
                    <p className="text-gray-500">Nhấn vào tab để nhận động lực</p>
                  )}
                  <button
                    onClick={getMotivation}
                    disabled={loading}
                    className="w-full bg-purple-500 text-white py-2 px-4 rounded-lg hover:bg-purple-600 disabled:bg-gray-300"
                  >
                    🎯 Lấy động lực mới
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-4 bg-gray-50">
          <p className="text-xs text-gray-500 text-center">
            🤖 Được hỗ trợ bởi AI • Học thông minh hơn với công nghệ
          </p>
        </div>
      </div>
    </div>
  );
}
