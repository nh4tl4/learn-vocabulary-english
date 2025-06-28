'use client';

import { useState, useEffect } from 'react';
import { vocabularyAPI } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface TestQuestion {
  vocabularyId: number;
  question: string;
  options: Array<{
    id: number;
    text: string;
    isCorrect: boolean;
  }>;
  correctAnswerId: number;
}

interface TestResult {
  vocabularyId: number;
  selectedOptionId: number;
  correctOptionId: number;
  timeSpent: number;
}

export default function VocabularyTest() {
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<TestResult[]>([]);
  const [questionStartTime, setQuestionStartTime] = useState<number>(0);
  const [testStartTime, setTestStartTime] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [testComplete, setTestComplete] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);
  const [showResult, setShowResult] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadTestQuestions();
  }, []);

  const loadTestQuestions = async () => {
    try {
      const response = await vocabularyAPI.generateTest(10);
      setQuestions(response.data);
      setTestStartTime(Date.now());
      setQuestionStartTime(Date.now());
    } catch (error) {
      console.error('Failed to load test questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (optionId: number) => {
    setSelectedAnswer(optionId);
  };

  const handleNextQuestion = () => {
    if (selectedAnswer === null) return;

    const currentQuestion = questions[currentIndex];
    const timeSpent = Math.round((Date.now() - questionStartTime) / 1000);

    const result: TestResult = {
      vocabularyId: currentQuestion.vocabularyId,
      selectedOptionId: selectedAnswer,
      correctOptionId: currentQuestion.correctAnswerId,
      timeSpent,
    };

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
      const response = await vocabularyAPI.submitTest(testAnswers);
      setTestResults(response.data);
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
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 sm:mb-0">Kiểm Tra Từ Vựng</h1>
          <div className="text-sm sm:text-base text-gray-600">
            Câu {currentIndex + 1} / {questions.length}
          </div>
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
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">
            {currentQuestion.question}
          </h2>
        </div>

        {/* Options */}
        <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
          {currentQuestion.options.map((option, index) => (
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
                <span>{option.text}</span>
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

        {/* Action Button */}
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
      </div>

      {/* Help Text */}
      <div className="text-center text-gray-500 text-xs sm:text-sm">
        Chọn đáp án đúng nhất cho từ vựng được hỏi
      </div>
    </div>
  );
}
