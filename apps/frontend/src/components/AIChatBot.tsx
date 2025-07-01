'use client';

import { useState, useEffect, useRef } from 'react';
import { aiAPI } from '@/lib/api';
import { useRouter } from 'next/navigation';

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
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();

  useEffect(() => {
    checkAIStatus();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

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
      content: inputMessage.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setIsTyping(true);

    // Auto-resize textarea
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }

    try {
      const conversationHistory = messages.map(msg => ({
        role: msg.role === 'ai' ? 'assistant' : 'user',
        content: msg.content,
      }));

      const response = await aiAPI.chat(userMessage.content, conversationHistory);

      // Simulate typing delay for better UX
      setTimeout(() => {
        setIsTyping(false);
        const aiMessage: ChatMessage = {
          role: 'ai',
          content: response.data.aiResponse,
          timestamp: response.data.timestamp,
        };
        setMessages(prev => [...prev, aiMessage]);
      }, 1000);

    } catch (error) {
      console.error('Chat error:', error);
      setIsTyping(false);
      const errorMessage: ChatMessage = {
        role: 'ai',
        content: 'Xin lỗi, tôi gặp sự cố. Hãy thử lại sau nhé! 😅',
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

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputMessage(e.target.value);

    // Auto-resize textarea
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!aiAvailable) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900 flex items-center justify-center p-4">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl text-center max-w-md w-full">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🤖</span>
          </div>
          <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-white">AI Chat Bot</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Tính năng AI chat hiện tại không khả dụng. Vui lòng thử lại sau!
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-gradient-to-r from-purple-500 to-blue-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-200 font-medium"
          >
            Quay về Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900 flex flex-col">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50 p-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <button
            onClick={() => router.push('/dashboard')}
            className="p-2 rounded-lg hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <span className="text-xl">←</span>
          </button>

          <div className="flex items-center gap-3 flex-1">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
                <span className="text-lg">🤖</span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
            </div>

            <div>
              <h1 className="font-bold text-gray-800 dark:text-white">AI Assistant</h1>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {isTyping ? 'Đang nhập...' : 'Trực tuyến'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-700 dark:text-green-300 font-medium">Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-hidden flex flex-col max-w-4xl mx-auto w-full">
        <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ paddingBottom: '120px' }}>
          {messages.map((message, index) => (
            <ChatBubble key={index} message={message} />
          ))}

          {/* Typing Indicator */}
          {isTyping && <TypingIndicator />}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area - Fixed at bottom */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-t border-gray-200/50 dark:border-gray-700/50 p-4 sticky bottom-0">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end gap-3">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={inputMessage}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="Nhập tin nhắn... (Enter để gửi)"
                className="w-full px-4 py-3 pr-12 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 min-h-[48px] max-h-[120px]"
                rows={1}
                disabled={isLoading}
              />

              {/* Character count for mobile */}
              {inputMessage.length > 100 && (
                <div className="absolute -top-6 right-2 text-xs text-gray-500 dark:text-gray-400">
                  {inputMessage.length}/500
                </div>
              )}
            </div>

            <button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className={`p-3 rounded-2xl transition-all duration-200 ${
                inputMessage.trim() && !isLoading
                  ? 'bg-gradient-to-r from-purple-500 to-blue-600 text-white shadow-lg hover:shadow-xl hover:scale-105'
                  : 'bg-gray-200 dark:bg-gray-600 text-gray-400 dark:text-gray-500 cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <span className="text-lg">📤</span>
              )}
            </button>
          </div>

          {/* Quick suggestions for mobile */}
          <div className="mt-3 flex gap-2 overflow-x-auto scrollbar-hide">
            {['Hello! How are you?', 'Can you help me practice English?', 'What should I learn today?'].map((suggestion, index) => (
              <button
                key={index}
                onClick={() => setInputMessage(suggestion)}
                className="flex-shrink-0 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Chat Bubble Component
function ChatBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex ${isUser ? 'flex-row-reverse' : 'flex-row'} items-end gap-2 max-w-[85%] sm:max-w-[70%]`}>
        {/* Avatar */}
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          isUser 
            ? 'bg-gradient-to-r from-purple-500 to-blue-600' 
            : 'bg-gradient-to-r from-green-400 to-blue-500'
        }`}>
          <span className="text-white text-sm">
            {isUser ? '👤' : '🤖'}
          </span>
        </div>

        {/* Message Bubble */}
        <div className={`relative px-4 py-3 rounded-2xl shadow-sm ${
          isUser
            ? 'bg-gradient-to-r from-purple-500 to-blue-600 text-white'
            : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-white border border-gray-200/50 dark:border-gray-600/50'
        }`}>
          {/* Message tail */}
          <div className={`absolute bottom-0 w-3 h-3 ${
            isUser
              ? 'right-0 transform translate-x-1 bg-gradient-to-br from-purple-500 to-blue-600'
              : 'left-0 transform -translate-x-1 bg-white dark:bg-gray-700 border-l border-b border-gray-200/50 dark:border-gray-600/50'
          }`}
          style={{
            clipPath: isUser
              ? 'polygon(0 0, 100% 0, 0 100%)'
              : 'polygon(100% 0, 100% 100%, 0 0)'
          }}></div>

          {/* Message Content */}
          <div className="relative z-10">
            <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap break-words">
              {message.content}
            </p>

            {/* Timestamp */}
            <div className={`text-xs mt-1 ${
              isUser ? 'text-purple-100' : 'text-gray-500 dark:text-gray-400'
            }`}>
              {new Date(message.timestamp).toLocaleTimeString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Typing Indicator Component
function TypingIndicator() {
  return (
    <div className="flex justify-start mb-4">
      <div className="flex items-end gap-2 max-w-[85%] sm:max-w-[70%]">
        {/* AI Avatar */}
        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-gradient-to-r from-green-400 to-blue-500">
          <span className="text-white text-sm">🤖</span>
        </div>

        {/* Typing Bubble */}
        <div className="relative px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200/50 dark:border-gray-600/50 rounded-2xl shadow-sm">
          {/* Message tail */}
          <div className="absolute bottom-0 left-0 transform -translate-x-1 w-3 h-3 bg-white dark:bg-gray-700 border-l border-b border-gray-200/50 dark:border-gray-600/50"
            style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 0)' }}>
          </div>

          {/* Typing Animation */}
          <div className="flex items-center space-x-1">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">AI đang nhập...</span>
          </div>
        </div>
      </div>
    </div>
  );
}
