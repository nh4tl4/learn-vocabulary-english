'use client';

import { useState, useEffect } from 'react';
import { vocabularyAPI } from '@/lib/api';
import { useRouter } from 'next/navigation';
import TextToSpeech from './TextToSpeech';

interface TestQuestion {
  vocabularyId: number;
  questionType: 'en-to-vi' | 'vi-to-en';
  inputType: 'multiple-choice' | 'text-input';
  question: string;
  options?: Array<{
    id: number;
    text: string;
    isCorrect: boolean;
  }>;
  correctAnswerId?: number;
  correctAnswer?: string;
  word?: string;
  meaning?: string;
  pronunciation?: string;
  hints?: string[];
}

interface TestResult {
  vocabularyId: number;
  selectedOptionId?: number;
  correctOptionId?: number;
  userAnswer?: string;
  correctAnswer?: string;
  timeSpent: number;
  isCorrect: boolean;
}

export default function VocabularyTest() {
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [textAnswer, setTextAnswer] = useState('');
  const [answers, setAnswers] = useState<TestResult[]>([]);
  const [questionStartTime, setQuestionStartTime] = useState<number>(0);
  const [testStartTime, setTestStartTime] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [testComplete, setTestComplete] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);
  const [showResult, setShowResult] = useState(false);
  const [testMode, setTestMode] = useState<'en-to-vi' | 'vi-to-en' | 'mixed'>('mixed');
  const [inputType, setInputType] = useState<'multiple-choice' | 'text-input' | 'mixed'>('multiple-choice');
  const [showModeSelection, setShowModeSelection] = useState(true);
  const [showHints, setShowHints] = useState(false);
  const router = useRouter();

  // Don't load questions automatically, wait for mode selection
  useEffect(() => {
    if (!showModeSelection) {
      loadTestQuestions();
    }
  }, [showModeSelection, testMode, inputType]);

  const loadTestQuestions = async () => {
    try {
      setLoading(true);
      const response = await vocabularyAPI.generateTest(10, testMode, inputType);
      setQuestions(response.data);
      setTestStartTime(Date.now());
      setQuestionStartTime(Date.now());
    } catch (error) {
      console.error('Failed to load test questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const startTest = (selectedMode: 'en-to-vi' | 'vi-to-en' | 'mixed', selectedInputType: 'multiple-choice' | 'text-input' | 'mixed') => {
    setTestMode(selectedMode);
    setInputType(selectedInputType);
    setShowModeSelection(false);
  };

  const handleAnswerSelect = (optionId: number) => {
    setSelectedAnswer(optionId);
  };

  const handleTextSubmit = () => {
    const currentQuestion = questions[currentIndex];
    const timeSpent = Math.round((Date.now() - questionStartTime) / 1000);

    // Check if text answer is correct
    const isCorrect = textAnswer.toLowerCase().trim() === currentQuestion.correctAnswer?.toLowerCase().trim();

    const result: TestResult = {
      vocabularyId: currentQuestion.vocabularyId,
      userAnswer: textAnswer.trim(),
      correctAnswer: currentQuestion.correctAnswer,
      timeSpent,
      isCorrect,
    };

    const newAnswers = [...answers, result];
    setAnswers(newAnswers);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setTextAnswer('');
      setShowHints(false);
      setQuestionStartTime(Date.now());
    } else {
      // Test complete, submit results
      submitTest(newAnswers);
    }
  };

  const handleNextQuestion = () => {
    const currentQuestion = questions[currentIndex];
    const timeSpent = Math.round((Date.now() - questionStartTime) / 1000);

    let result: TestResult;

    if (currentQuestion.inputType === 'multiple-choice') {
      if (selectedAnswer === null) return;

      const isCorrect = selectedAnswer === currentQuestion.correctAnswerId;
      result = {
        vocabularyId: currentQuestion.vocabularyId,
        selectedOptionId: selectedAnswer,
        correctOptionId: currentQuestion.correctAnswerId,
        timeSpent,
        isCorrect,
      };
    } else {
      // This shouldn't happen as text input is handled separately
      return;
    }

    const newAnswers = [...answers, result];
    setAnswers(newAnswers);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setQuestionStartTime(Date.now());
    } else {
      // Test complete, submit results
      submitTest(newAnswers);
    }
  };

  const submitTest = async (testAnswers: TestResult[]) => {
    try {
      // Convert to format expected by backend
      const backendFormat = testAnswers.map(answer => ({
        vocabularyId: answer.vocabularyId,
        selectedOptionId: answer.selectedOptionId || 0,
        correctOptionId: answer.correctOptionId || 0,
        timeSpent: answer.timeSpent,
      }));

      const response = await vocabularyAPI.submitTest(backendFormat);

      // Calculate correct answers from our results
      const correctCount = testAnswers.filter(answer => answer.isCorrect).length;

      setTestResults({
        ...response.data,
        correctAnswers: correctCount,
      });
      setTestComplete(true);
    } catch (error) {
      console.error('Failed to submit test:', error);
    }
  };

  const showCorrectAnswer = () => {
    setShowResult(true);
    setTimeout(() => {
      handleNextQuestion();
      setShowResult(false);
    }, 2000);
  };

  if (showModeSelection) {
    return (
      <div className="max-w-3xl mx-auto p-4 sm:p-6">
        <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
          <div className="text-center mb-8">
            <div className="text-4xl sm:text-5xl mb-4">📝</div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">Cấu Hình Bài Kiểm Tra</h2>
            <p className="text-gray-600 mb-8 text-sm sm:text-base">
              Chọn loại câu hỏi và cách thức trả lời
            </p>
          </div>

          {/* Mode Selection */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">1. Chọn loại câu hỏi:</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { value: 'en-to-vi', label: 'Anh → Việt', icon: '🇺🇸➡️🇻🇳', desc: 'Cho từ Anh, tìm nghĩa Việt' },
                { value: 'vi-to-en', label: 'Việt → Anh', icon: '🇻🇳➡️🇺🇸', desc: 'Cho nghĩa Việt, tìm từ Anh' },
                { value: 'mixed', label: 'Hỗn hợp', icon: '🔀', desc: 'Kết hợp cả hai loại' },
              ].map((mode) => (
                <button
                  key={mode.value}
                  onClick={() => setTestMode(mode.value as any)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    testMode === mode.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-2">{mode.icon}</div>
                  <div className="font-semibold text-sm">{mode.label}</div>
                  <div className="text-xs text-gray-600">{mode.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Input Type Selection */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">2. Chọn cách trả lời:</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { value: 'multiple-choice', label: 'Trắc nghiệm', icon: '☑️', desc: 'Chọn từ các đáp án có sẵn' },
                { value: 'text-input', label: 'Nhập text', icon: '✍️', desc: 'Gõ đáp án trực tiếp' },
                { value: 'mixed', label: 'Hỗn hợp', icon: '🎯', desc: 'Kết hợp cả hai cách' },
              ].map((type) => (
                <button
                  key={type.value}
                  onClick={() => setInputType(type.value as any)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    inputType === type.value
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-2">{type.icon}</div>
                  <div className="font-semibold text-sm">{type.label}</div>
                  <div className="text-xs text-gray-600">{type.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => startTest(testMode, inputType)}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 font-medium"
            >
              🚀 Bắt đầu kiểm tra
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="text-gray-500 hover:text-gray-700"
            >
              ← Quay về Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (testComplete && testResults) {
    const correctCount = testResults.correctAnswers || 0;
    const totalQuestions = questions.length;
    const percentage = Math.round((correctCount / totalQuestions) * 100);

    return (
      <div className="max-w-2xl mx-auto p-4 sm:p-6 text-center">
        <div className="mb-6">
          <div className="text-4xl sm:text-6xl mb-4">
            {percentage >= 80 ? '🎉' : percentage >= 60 ? '👍' : '📚'}
          </div>
          <h2 className="text-xl sm:text-2xl font-bold mb-4">Hoàn thành bài kiểm tra!</h2>
          <div className="bg-white rounded-lg p-4 sm:p-6 shadow-lg mb-6">
            <div className="text-2xl sm:text-3xl font-bold mb-2 text-blue-600">
              {correctCount}/{totalQuestions}
            </div>
            <div className="text-lg sm:text-xl mb-2">
              Điểm số: {percentage}%
            </div>
            <div className="text-sm sm:text-base text-gray-600">
              {percentage >= 80 ? 'Xuất sắc! 🌟' :
               percentage >= 60 ? 'Tốt! Tiếp tục cố gắng 💪' :
               'Cần cải thiện thêm 📖'}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-blue-700 text-sm sm:text-base"
            >
              Về Trang Chủ
            </button>
            <button
              onClick={() => window.location.reload()}
              className="bg-purple-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-purple-700 text-sm sm:text-base"
            >
              Làm Bài Khác
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto p-4 sm:p-6 text-center">
        <div className="text-4xl sm:text-6xl mb-4">😅</div>
        <h2 className="text-xl sm:text-2xl font-bold mb-4">Chưa có câu hỏi</h2>
        <p className="text-gray-600 mb-6 text-sm sm:text-base">
          Bạn cần học thêm từ vựng trước khi có thể làm bài kiểm tra.
        </p>
        <button
          onClick={() => router.push('/dashboard')}
          className="bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-blue-700 text-sm sm:text-base"
        >
          Về Trang Chủ
        </button>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      {/* Header with pronunciation */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1">Kiểm Tra Từ Vựng</h1>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {testMode === 'en-to-vi' ? '🇺🇸➡️🇻🇳' : testMode === 'vi-to-en' ? '🇻🇳➡️🇺🇸' : '🔀 Hỗn hợp'}
              </span>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {inputType === 'multiple-choice' ? '☑️ Trắc nghiệm' : inputType === 'text-input' ? '✍️ Nhập text' : '🎯 Hỗn hợp'}
              </span>
              <span>Câu {currentIndex + 1} / {questions.length}</span>
            </div>
          </div>
          <button
            onClick={() => setShowModeSelection(true)}
            className="text-purple-600 hover:text-purple-700 text-sm mt-2 sm:mt-0"
          >
            🔄 Đổi cấu hình
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3">
          <div
            className="bg-purple-600 h-2 sm:h-3 rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 mb-6 sm:mb-8">
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
              currentQuestion.questionType === 'en-to-vi' 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-green-100 text-green-800'
            }`}>
              {currentQuestion.questionType === 'en-to-vi' ? 'Anh → Việt' : 'Việt → Anh'}
            </div>

            {/* Pronunciation button */}
            {(currentQuestion.word || currentQuestion.meaning) && (
              <div className="flex items-center gap-2">
                <TextToSpeech
                  text={currentQuestion.questionType === 'en-to-vi' ? currentQuestion.word! : currentQuestion.meaning!}
                  lang={currentQuestion.questionType === 'en-to-vi' ? 'en-US' : 'vi-VN'}
                  className="text-2xl"
                />
                <span className="text-xs text-gray-500">Phát âm</span>
              </div>
            )}
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">
            {currentQuestion.question}
          </h2>

          {/* Pronunciation display */}
          {currentQuestion.pronunciation && currentQuestion.questionType === 'en-to-vi' && (
            <p className="text-gray-500 text-base mb-2">
              Phát âm: /{currentQuestion.pronunciation}/
            </p>
          )}
        </div>

        {currentQuestion.inputType === 'multiple-choice' ? (
          // Multiple Choice Questions
          <>
            <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
              {currentQuestion.options?.map((option, index) => (
                <button
                  key={option.id}
                  onClick={() => handleAnswerSelect(option.id)}
                  className={`w-full text-left p-4 sm:p-5 rounded-lg border-2 transition-all text-sm sm:text-base ${
                    selectedAnswer === option.id
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  } ${
                    showResult && option.isCorrect
                      ? 'border-green-500 bg-green-50'
                      : showResult && selectedAnswer === option.id && !option.isCorrect
                      ? 'border-red-500 bg-red-50'
                      : ''
                  }`}
                >
                  <div className="flex items-center">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-medium mr-3 sm:mr-4">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className={currentQuestion.questionType === 'vi-to-en' ? 'font-mono text-lg' : ''}>
                      {option.text}
                    </span>
                    {showResult && option.isCorrect && (
                      <span className="ml-auto text-green-600">✓</span>
                    )}
                    {showResult && selectedAnswer === option.id && !option.isCorrect && (
                      <span className="ml-auto text-red-600">✗</span>
                    )}
                  </div>
                </button>
              ))}
            </div>

            <div className="text-center">
              {!showResult ? (
                <button
                  onClick={showCorrectAnswer}
                  disabled={selectedAnswer === null}
                  className={`px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-base sm:text-lg font-medium transition-colors ${
                    selectedAnswer === null
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-purple-600 text-white hover:bg-purple-700'
                  }`}
                >
                  {currentIndex === questions.length - 1 ? 'Hoàn thành' : 'Câu tiếp theo'}
                </button>
              ) : (
                <div className="text-center">
                  <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-lg text-sm sm:text-base">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                    Đang chuyển sang câu tiếp theo...
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          // Text Input Questions
          <>
            <div className="mb-6">
              <input
                type="text"
                value={textAnswer}
                onChange={(e) => setTextAnswer(e.target.value)}
                placeholder="Nhập đáp án của bạn..."
                className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none text-base sm:text-lg"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && textAnswer.trim()) {
                    handleTextSubmit();
                  }
                }}
              />
            </div>

            {/* Hints */}
            {currentQuestion.hints && (
              <div className="mb-6">
                <button
                  onClick={() => setShowHints(!showHints)}
                  className="text-blue-600 hover:text-blue-700 text-sm mb-2"
                >
                  💡 {showHints ? 'Ẩn gợi ý' : 'Hiển thị gợi ý'}
                </button>
                {showHints && (
                  <div className="bg-yellow-50 p-3 rounded-lg">
                    {currentQuestion.hints.map((hint, index) => (
                      <p key={index} className="text-sm text-yellow-800">• {hint}</p>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="text-center">
              <button
                onClick={handleTextSubmit}
                disabled={!textAnswer.trim()}
                className={`px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-base sm:text-lg font-medium transition-colors ${
                  !textAnswer.trim()
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                }`}
              >
                {currentIndex === questions.length - 1 ? 'Hoàn thành bài kiểm tra' : 'Câu tiếp theo'}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Help Text */}
      <div className="text-center text-gray-500 text-xs sm:text-sm">
        {currentQuestion.inputType === 'multiple-choice'
          ? (currentQuestion.questionType === 'en-to-vi'
              ? 'Chọn nghĩa tiếng Việt đúng của từ tiếng Anh'
              : 'Chọn từ tiếng Anh đúng của nghĩa tiếng Việt')
          : (currentQuestion.questionType === 'en-to-vi'
              ? 'Nhập nghĩa tiếng Việt của từ tiếng Anh'
              : 'Nhập từ tiếng Anh tương ứng với nghĩa tiếng Việt')
        }
      </div>
    </div>
  );
}
