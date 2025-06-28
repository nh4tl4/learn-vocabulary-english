'use client';

import { useState, useEffect, useRef } from 'react';
import { aiAPI } from '@/lib/api';

interface ChatMessage {
  role: 'user' | 'ai';
  content: string;
  timestamp: string;
}

export default function AIChatBot() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'ai',
      content: 'Xin chào! Tôi là trợ lý AI giúp bạn luyện tập tiếng Anh. Hãy thử nói chuyện với tôi bằng tiếng Anh nhé! 😊',
      timestamp: new Date().toISOString(),
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiAvailable, setAiAvailable] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    checkAIStatus();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const checkAIStatus = async () => {
    try {
      const response = await aiAPI.getStatus();
      setAiAvailable(response.data.available);
    } catch (error) {
      console.error('Failed to check AI status:', error);
      setAiAvailable(false);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const conversationHistory = messages.map(msg => ({
        role: msg.role === 'ai' ? 'assistant' : 'user',
        content: msg.content,
      }));

      const response = await aiAPI.chat(inputMessage, conversationHistory);

      const aiMessage: ChatMessage = {
        role: 'ai',
        content: response.data.aiResponse,
        timestamp: response.data.timestamp,
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = {
        role: 'ai',
        content: 'Xin lỗi, tôi gặp sự cố. Hãy thử lại sau nhé!',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!aiAvailable) {
    return (
      <div className="bg-white rounded-lg p-4 sm:p-6 shadow-lg text-center">
        <div className="text-4xl mb-4">🤖</div>
        <h3 className="text-lg sm:text-xl font-semibold mb-2">AI Chat Bot</h3>
        <p className="text-gray-600 text-sm sm:text-base">
          Tính năng AI chat hiện tại không khả dụng. Vui lòng thử lại sau!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg flex flex-col h-[500px] sm:h-[600px]">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-t-lg">
        <div className="flex items-center">
          <div className="text-2xl mr-3">🤖</div>
          <div>
            <h3 className="font-semibold text-base sm:text-lg">AI Chat Bot</h3>
            <p className="text-xs sm:text-sm opacity-90">Luyện tập tiếng Anh với AI</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg text-sm sm:text-base ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white ml-auto'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
              <p className={`text-xs mt-1 opacity-70 ${
                message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
              }`}>
                {new Date(message.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 p-3 rounded-lg">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t p-4">
        <div className="flex space-x-2">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Gõ tin nhắn bằng tiếng Anh..."
            className="flex-1 border rounded-lg p-2 text-sm sm:text-base resize-none h-10 sm:h-12"
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm sm:text-base"
          >
            {isLoading ? '...' : 'Gửi'}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          💡 Mẹo: Nhấn Enter để gửi tin nhắn
        </p>
      </div>
    </div>
  );
}
