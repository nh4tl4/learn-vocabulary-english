'use client';

import { useState, useEffect } from 'react';
import { vocabularyAPI } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface UserVocabulary {
  id: number;
  status: string;
  correctCount: number;
  incorrectCount: number;
  nextReviewDate: string;
  vocabulary: {
    id: number;
    word: string;
    meaning: string;
    pronunciation?: string;
    example?: string;
    partOfSpeech?: string;
  };
}

export default function ReviewSession() {
  const [reviewWords, setReviewWords] = useState<UserVocabulary[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMeaning, setShowMeaning] = useState(false);
  const [wordStartTime, setWordStartTime] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [reviewedCount, setReviewedCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    loadReviewWords();
  }, []);

  const loadReviewWords = async () => {
    try {
      const response = await vocabularyAPI.getWordsForReview(20);
      setReviewWords(response.data);
      setWordStartTime(Date.now());
    } catch (error) {
      console.error('Failed to load review words:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQualityRating = async (quality: number) => {
    const currentWord = reviewWords[currentIndex];
    const responseTime = Math.round((Date.now() - wordStartTime) / 1000);

    try {
      await vocabularyAPI.processStudySession({
        vocabularyId: currentWord.vocabulary.id,
        quality,
        responseTime,
      });

      setReviewedCount(reviewedCount + 1);

      if (currentIndex < reviewWords.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setShowMeaning(false);
        setWordStartTime(Date.now());
      } else {
        setSessionComplete(true);
      }
    } catch (error) {
      console.error('Failed to process review session:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600"></div>
      </div>
    );
  }

  if (reviewWords.length === 0) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold mb-4">All Caught Up!</h2>
        <p className="text-gray-600 mb-6">No words are due for review right now. Come back later!</p>
        <button
          onClick={() => router.push('/dashboard')}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (sessionComplete) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <div className="mb-6">
          <div className="text-6xl mb-4">⭐</div>
          <h2 className="text-2xl font-bold mb-2">Review Complete!</h2>
          <p className="text-gray-600">You've reviewed {reviewedCount} words</p>
        </div>

        <div className="bg-yellow-50 rounded-lg p-4 mb-6">
          <p className="text-yellow-800">
            These words will be scheduled for future reviews based on how well you remembered them.
          </p>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => router.push('/learn/new')}
            className="flex-1 bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600"
          >
            Learn New Words
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

  const currentWord = reviewWords[currentIndex];
  const progress = ((currentIndex + 1) / reviewWords.length) * 100;
  const accuracy = currentWord.correctCount / (currentWord.correctCount + currentWord.incorrectCount) * 100;

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Review {currentIndex + 1} of {reviewWords.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-yellow-500 rounded-full h-2 transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Word Stats */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-green-600">{currentWord.correctCount}</div>
            <div className="text-xs text-gray-500">Correct</div>
          </div>
          <div>
            <div className="text-lg font-bold text-red-600">{currentWord.incorrectCount}</div>
            <div className="text-xs text-gray-500">Incorrect</div>
          </div>
          <div>
            <div className="text-lg font-bold text-blue-600">{Math.round(accuracy)}%</div>
            <div className="text-xs text-gray-500">Accuracy</div>
          </div>
        </div>
      </div>

      {/* Word Card */}
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">{currentWord.vocabulary.word}</h1>
          {currentWord.vocabulary.pronunciation && (
            <p className="text-lg text-gray-500">/{currentWord.vocabulary.pronunciation}/</p>
          )}
          {currentWord.vocabulary.partOfSpeech && (
            <span className="inline-block bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm mt-2">
              {currentWord.vocabulary.partOfSpeech}
            </span>
          )}
          <div className="mt-2">
            <span className={`inline-block px-3 py-1 rounded-full text-sm ${
              currentWord.status === 'mastered' ? 'bg-green-100 text-green-800' :
              currentWord.status === 'difficult' ? 'bg-red-100 text-red-800' :
              'bg-blue-100 text-blue-800'
            }`}>
              {currentWord.status}
            </span>
          </div>
        </div>

        {!showMeaning ? (
          <div>
            <p className="text-gray-600 mb-6">Try to recall the meaning of this word</p>
            <button
              onClick={() => setShowMeaning(true)}
              className="bg-yellow-500 text-white px-8 py-3 rounded-lg hover:bg-yellow-600 text-lg"
            >
              Show Meaning
            </button>
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-3">{currentWord.vocabulary.meaning}</h2>
              {currentWord.vocabulary.example && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 italic">"{currentWord.vocabulary.example}"</p>
                </div>
              )}
            </div>

            <div>
              <p className="text-gray-600 mb-4">How well did you remember this word?</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <QualityButton
                  quality={0}
                  label="Forgot"
                  color="bg-red-500 hover:bg-red-600"
                  onClick={() => handleQualityRating(0)}
                />
                <QualityButton
                  quality={2}
                  label="Difficult"
                  color="bg-orange-500 hover:bg-orange-600"
                  onClick={() => handleQualityRating(2)}
                />
                <QualityButton
                  quality={4}
                  label="Good"
                  color="bg-green-500 hover:bg-green-600"
                  onClick={() => handleQualityRating(4)}
                />
                <QualityButton
                  quality={5}
                  label="Perfect"
                  color="bg-blue-500 hover:bg-blue-600"
                  onClick={() => handleQualityRating(5)}
                />
              </div>

              <div className="mt-4 text-xs text-gray-500">
                <p>Next review: {new Date(currentWord.nextReviewDate).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Review Tips */}
      <div className="mt-6 bg-yellow-50 rounded-lg p-4">
        <h3 className="font-semibold text-yellow-800 mb-2">🔄 Review Tip</h3>
        <p className="text-yellow-700 text-sm">
          Be honest about how well you remembered the word. This helps the spaced repetition algorithm schedule optimal review times.
        </p>
      </div>
    </div>
  );
}

function QualityButton({ quality, label, color, onClick }: {
  quality: number;
  label: string;
  color: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`${color} text-white px-4 py-3 rounded-lg text-sm font-medium transition-colors`}
    >
      {label}
    </button>
  );
}
