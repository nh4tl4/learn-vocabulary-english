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

  if (questions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <h2 className="text-2xl font-bold mb-4">No Test Available</h2>
        <p className="text-gray-600 mb-6">You need to learn more words before taking a test.</p>
        <button
          onClick={() => router.push('/learn/new')}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
        >
          Learn New Words
        </button>
      </div>
    );
  }

  if (testComplete && testResults) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">
            {testResults.score >= 80 ? '🎉' : testResults.score >= 60 ? '👍' : '📚'}
          </div>
          <h2 className="text-3xl font-bold mb-2">Test Complete!</h2>
          <p className="text-xl text-gray-600">
            Score: {testResults.score}% ({testResults.totalCorrect}/{testResults.totalQuestions})
          </p>
        </div>

        {/* Test Statistics */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{testResults.totalCorrect}</div>
            <div className="text-green-600">Correct</div>
          </div>
          <div className="bg-red-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-red-600">
              {testResults.totalQuestions - testResults.totalCorrect}
            </div>
            <div className="text-red-600">Incorrect</div>
          </div>
        </div>

        {/* Performance Message */}
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h3 className="font-semibold mb-2">Performance Analysis</h3>
          <p className="text-gray-600">
            {testResults.score >= 80
              ? "Excellent! You have a strong grasp of these words."
              : testResults.score >= 60
              ? "Good job! Keep reviewing to improve your retention."
              : "Consider spending more time reviewing these words."}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => router.push('/learn/review')}
            className="flex-1 bg-yellow-500 text-white px-6 py-3 rounded-lg hover:bg-yellow-600"
          >
            Review Words
          </button>
          <button
            onClick={() => router.push('/dashboard')}
            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Dashboard
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Vocabulary Test</h1>
          <span className="text-sm text-gray-500">
            {Math.round((Date.now() - testStartTime) / 1000)}s
          </span>
        </div>

        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Question {currentIndex + 1} of {questions.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-purple-600 rounded-full h-2 transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-6">{currentQuestion.question}</h2>

        <div className="space-y-3 mb-6">
          {currentQuestion.options.map((option, index) => (
            <button
              key={option.id}
              onClick={() => !showResult && handleAnswerSelect(option.id)}
              disabled={showResult}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                showResult
                  ? option.isCorrect
                    ? 'border-green-500 bg-green-50'
                    : selectedAnswer === option.id
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200 bg-gray-50'
                  : selectedAnswer === option.id
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
              }`}
            >
              <div className="flex items-center">
                <span className="mr-3 font-medium text-gray-500">
                  {String.fromCharCode(65 + index)}
                </span>
                <span className={showResult && option.isCorrect ? 'font-semibold' : ''}>
                  {option.text}
                </span>
                {showResult && option.isCorrect && (
                  <span className="ml-auto text-green-500">✓</span>
                )}
                {showResult && !option.isCorrect && selectedAnswer === option.id && (
                  <span className="ml-auto text-red-500">✗</span>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Submit Button */}
        {!showResult ? (
          <button
            onClick={showCorrectAnswer}
            disabled={selectedAnswer === null}
            className={`w-full py-3 rounded-lg font-medium ${
              selectedAnswer === null
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-purple-600 text-white hover:bg-purple-700'
            }`}
          >
            {currentIndex === questions.length - 1 ? 'Finish Test' : 'Next Question'}
          </button>
        ) : (
          <div className="text-center">
            <div className="text-lg font-medium mb-2">
              {selectedAnswer === currentQuestion.correctAnswerId ? (
                <span className="text-green-600">✓ Correct!</span>
              ) : (
                <span className="text-red-600">✗ Incorrect</span>
              )}
            </div>
            <div className="text-sm text-gray-500">Moving to next question...</div>
          </div>
        )}
      </div>

      {/* Test Tips */}
      <div className="mt-6 bg-purple-50 rounded-lg p-4">
        <h3 className="font-semibold text-purple-800 mb-2">📝 Test Tip</h3>
        <p className="text-purple-700 text-sm">
          Take your time to read each option carefully. Your performance will help the system understand which words need more review.
        </p>
      </div>
    </div>
  );
}
