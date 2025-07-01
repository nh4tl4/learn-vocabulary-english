'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { vocabularyAPI } from '@/lib/api';
import { useRouter, useSearchParams } from 'next/navigation';
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
  topic?: string;
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

interface TestState {
  questions: TestQuestion[];
  currentIndex: number;
  answers: TestResult[];
  loading: boolean;
  testComplete: boolean;
  testResults: any;
  showModeSelection: boolean;
}

export default function VocabularyTest() {
  // Consolidated state for better performance
  const [state, setState] = useState<TestState>({
    questions: [],
    currentIndex: 0,
    answers: [],
    loading: false,
    testComplete: false,
    testResults: null,
    showModeSelection: true,
  });

  // Separate state for form inputs to avoid unnecessary re-renders
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [textAnswer, setTextAnswer] = useState('');
  const [testMode, setTestMode] = useState<'en-to-vi' | 'vi-to-en' | 'mixed'>('mixed');
  const [inputType, setInputType] = useState<'multiple-choice' | 'text-input' | 'mixed'>('multiple-choice');

  // Performance tracking
  const [questionStartTime, setQuestionStartTime] = useState<number>(0);
  const [testStartTime, setTestStartTime] = useState<number>(0);

  const router = useRouter();
  const searchParams = useSearchParams();

  // Get URL params for topic-based tests
  const topic = searchParams.get('topic');
  const limit = parseInt(searchParams.get('limit') || '10');
  const level = searchParams.get('level') || undefined; // Convert null to undefined

  // Memoized current question to avoid recalculation
  const currentQuestion = useMemo(() =>
    state.questions[state.currentIndex] || null,
    [state.questions, state.currentIndex]
  );

  // Optimized test loading function
  const loadTestQuestions = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true }));

      let response;
      if (topic) {
        // Load test for specific topic
        response = await vocabularyAPI.generateTestByTopic(topic, limit, testMode, inputType, level);
      } else {
        // Load general test
        response = await vocabularyAPI.generateTest(limit, testMode, inputType);
      }

      const questions = response.data || [];

      setState(prev => ({
        ...prev,
        questions,
        loading: false,
        currentIndex: 0,
        answers: [],
      }));

      setTestStartTime(Date.now());
      setQuestionStartTime(Date.now());

      // Reset form state
      setSelectedAnswer(null);
      setTextAnswer('');

    } catch (error) {
      console.error('Failed to load test questions:', error);
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [topic, limit, testMode, inputType, level]);

  // Optimized answer submission
  const submitAnswer = useCallback(async (answer: number | string) => {
    if (!currentQuestion) return;

    const timeSpent = Math.round((Date.now() - questionStartTime) / 1000);
    let isCorrect = false;
    let result: TestResult;

    if (currentQuestion.inputType === 'multiple-choice') {
      const answerNum = answer as number;
      isCorrect = answerNum === currentQuestion.correctAnswerId;
      result = {
        vocabularyId: currentQuestion.vocabularyId,
        selectedOptionId: answerNum,
        correctOptionId: currentQuestion.correctAnswerId,
        timeSpent,
        isCorrect,
      };
    } else {
      const answerStr = (answer as string).toLowerCase().trim();
      const correctStr = currentQuestion.correctAnswer?.toLowerCase().trim() || '';
      isCorrect = answerStr === correctStr;
      result = {
        vocabularyId: currentQuestion.vocabularyId,
        userAnswer: answerStr,
        correctAnswer: currentQuestion.correctAnswer,
        timeSpent,
        isCorrect,
      };
    }

    const newAnswers = [...state.answers, result];

    // Check if test is complete
    if (state.currentIndex >= state.questions.length - 1) {
      // Submit test results immediately
      await submitTestResults(newAnswers);
    } else {
      // Move to next question
      setState(prev => ({
        ...prev,
        answers: newAnswers,
        currentIndex: prev.currentIndex + 1,
      }));

      // Reset form state
      setSelectedAnswer(null);
      setTextAnswer('');
      setQuestionStartTime(Date.now());
    }
  }, [currentQuestion, state.answers, state.currentIndex, state.questions.length, questionStartTime]);

  // Optimized test submission
  const submitTestResults = useCallback(async (testAnswers: TestResult[]) => {
    try {
      const backendFormat = testAnswers.map(answer => ({
        vocabularyId: answer.vocabularyId,
        selectedOptionId: answer.selectedOptionId || 0,
        correctOptionId: answer.correctOptionId || 0,
        timeSpent: answer.timeSpent,
      }));

      const response = await vocabularyAPI.submitTest(backendFormat);
      const correctCount = testAnswers.filter(answer => answer.isCorrect).length;

      setState(prev => ({
        ...prev,
        testComplete: true,
        testResults: {
          ...response.data,
          correctAnswers: correctCount,
        },
      }));

    } catch (error) {
      console.error('Failed to submit test:', error);
    }
  }, []);

  // Event handlers with performance optimization
  const handleAnswerSelect = useCallback((optionId: number) => {
    setSelectedAnswer(optionId);
  }, []);

  const handleNextQuestion = useCallback(() => {
    if (selectedAnswer !== null) {
      submitAnswer(selectedAnswer);
    }
  }, [selectedAnswer, submitAnswer]);

  const handleTextSubmit = useCallback(() => {
    if (textAnswer.trim()) {
      submitAnswer(textAnswer);
    }
  }, [textAnswer, submitAnswer]);

  const startTest = useCallback((selectedMode: typeof testMode, selectedInputType: typeof inputType) => {
    setTestMode(selectedMode);
    setInputType(selectedInputType);
    setState(prev => ({ ...prev, showModeSelection: false }));
  }, []);

  // Load questions when mode selection is complete
  useEffect(() => {
    if (!state.showModeSelection && state.questions.length === 0) {
      loadTestQuestions();
    }
  }, [state.showModeSelection, state.questions.length, loadTestQuestions]);

  // Memoized progress calculation
  const progress = useMemo(() => {
    const total = state.questions.length;
    const current = state.currentIndex + 1;
    return total > 0 ? Math.round((current / total) * 100) : 0;
  }, [state.questions.length, state.currentIndex]);

  // Early returns for different states
  if (state.showModeSelection) {
    return <ModeSelection onStartTest={startTest} testMode={testMode} inputType={inputType} setTestMode={setTestMode} setInputType={setInputType} />;
  }

  if (state.loading) {
    return <LoadingState />;
  }

  if (state.testComplete && state.testResults) {
    return <TestResults results={state.testResults} questions={state.questions} />;
  }

  if (!currentQuestion) {
    return <NoQuestionsState />;
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Câu {state.currentIndex + 1} / {state.questions.length}</span>
          <span>{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-purple-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="text-center mb-6">
          <div className="text-3xl mb-4">
            {currentQuestion.questionType === 'en-to-vi' ? '🇺🇸➡️🇻🇳' : '🇻🇳➡️🇺🇸'}
          </div>
          <h2 className="text-xl font-bold mb-2">{currentQuestion.question}</h2>

          {/* Pronunciation */}
          {currentQuestion.pronunciation && (
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="text-gray-600">/{currentQuestion.pronunciation}/</span>
              <TextToSpeech text={currentQuestion.word || ''} />
            </div>
          )}
        </div>

        {/* Answer Section */}
        {currentQuestion.inputType === 'multiple-choice' ? (
          <MultipleChoiceAnswers
            options={currentQuestion.options || []}
            selectedAnswer={selectedAnswer}
            onSelect={handleAnswerSelect}
            onNext={handleNextQuestion}
            isLastQuestion={state.currentIndex >= state.questions.length - 1}
          />
        ) : (
          <TextInputAnswer
            value={textAnswer}
            onChange={setTextAnswer}
            onSubmit={handleTextSubmit}
            isLastQuestion={state.currentIndex >= state.questions.length - 1}
          />
        )}
      </div>
    </div>
  );
}

// Extracted components for better performance
const ModeSelection = ({ onStartTest, testMode, inputType, setTestMode, setInputType }: any) => (
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
              onClick={() => setTestMode(mode.value)}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { value: 'multiple-choice', label: 'Trắc nghiệm', icon: '☑️', desc: 'Chọn từ các đáp án có sẵn' },
            { value: 'text-input', label: 'Nhập text', icon: '✍️', desc: 'Gõ đáp án trực tiếp' },
          ].map((type) => (
            <button
              key={type.value}
              onClick={() => setInputType(type.value)}
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

      <div className="text-center">
        <button
          onClick={() => onStartTest(testMode, inputType)}
          className="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 font-medium text-lg"
        >
          🚀 Bắt đầu kiểm tra
        </button>
      </div>
    </div>
  </div>
);

const LoadingState = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
      <p className="text-gray-600">Đang tải câu hỏi...</p>
    </div>
  </div>
);

const NoQuestionsState = () => (
  <div className="text-center p-8">
    <div className="text-6xl mb-4">📚</div>
    <h2 className="text-xl font-bold mb-2">Không có câu hỏi nào</h2>
    <p className="text-gray-600">Vui lòng học thêm từ vựng trước khi làm bài kiểm tra.</p>
  </div>
);

const MultipleChoiceAnswers = ({ options, selectedAnswer, onSelect, onNext, isLastQuestion }: any) => (
  <div className="space-y-4">
    <div className="grid gap-3">
      {options.map((option: any) => (
        <button
          key={option.id}
          onClick={() => onSelect(option.id)}
          className={`p-4 text-left rounded-lg border-2 transition-all ${
            selectedAnswer === option.id
              ? 'border-purple-500 bg-purple-50'
              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center">
            <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
              selectedAnswer === option.id ? 'bg-purple-500 border-purple-500' : 'border-gray-300'
            }`} />
            <span className="text-base">{option.text}</span>
          </div>
        </button>
      ))}
    </div>

    <div className="text-center pt-4">
      <button
        onClick={onNext}
        disabled={selectedAnswer === null}
        className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
      >
        {isLastQuestion ? '🏁 Hoàn thành' : '➡️ Câu tiếp theo'}
      </button>
    </div>
  </div>
);

const TextInputAnswer = ({ value, onChange, onSubmit, isLastQuestion }: any) => (
  <div className="space-y-4">
    <div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && onSubmit()}
        placeholder="Nhập đáp án của bạn..."
        className="w-full p-4 text-lg border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
        autoFocus
      />
    </div>

    <div className="text-center">
      <button
        onClick={onSubmit}
        disabled={!value.trim()}
        className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
      >
        {isLastQuestion ? '🏁 Hoàn thành' : '➡️ Câu tiếp theo'}
      </button>
    </div>
  </div>
);

const TestResults = ({ results, questions }: any) => {
  const router = useRouter();
  const correctCount = results.correctAnswers || 0;
  const totalQuestions = questions.length;
  const percentage = Math.round((correctCount / totalQuestions) * 100);

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 text-center">
      <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
        <div className="text-4xl sm:text-6xl mb-4">
          {percentage >= 80 ? '🎉' : percentage >= 60 ? '👍' : '📚'}
        </div>
        <h2 className="text-xl sm:text-2xl font-bold mb-4">Hoàn thành bài kiểm tra!</h2>

        <div className="bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-lg p-6 mb-6">
          <div className="text-3xl font-bold mb-2">
            {correctCount}/{totalQuestions}
          </div>
          <div className="text-xl mb-2">
            Điểm số: {percentage}%
          </div>
          <div className="text-sm opacity-90">
            {percentage >= 80 ? 'Xuất sắc! 🌟' :
             percentage >= 60 ? 'Tốt! Tiếp tục cố gắng 💪' :
             'Cần cải thiện thêm 📖'}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600"
          >
            📊 Về Dashboard
          </button>
          <button
            onClick={() => window.location.reload()}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700"
          >
            🔄 Làm lại bài test
          </button>
        </div>
      </div>
    </div>
  );
};
