'use client';

import { useState, useEffect } from 'react';
import { vocabularyAPI } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface Vocabulary {
  id: number;
  word: string;
  meaning: string;
  pronunciation?: string;
  example?: string;
  partOfSpeech?: string;
  level?: string;
}

export default function StudySession() {
  const [words, setWords] = useState<Vocabulary[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMeaning, setShowMeaning] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<number>(0);
  const [wordStartTime, setWordStartTime] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [sessionComplete, setSessionComplete] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadNewWords();
  }, []);

  const loadNewWords = async () => {
    try {
      const response = await vocabularyAPI.getNewWords(10);
      setWords(response.data);
      setSessionStartTime(Date.now());
      setWordStartTime(Date.now());
    } catch (error) {
      console.error('Failed to load words:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQualityRating = async (quality: number) => {
    const currentWord = words[currentIndex];
    const responseTime = Math.round((Date.now() - wordStartTime) / 1000);

    try {
      await vocabularyAPI.processStudySession({
        vocabularyId: currentWord.id,
        quality,
        responseTime,
      });

      if (currentIndex < words.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setShowMeaning(false);
        setWordStartTime(Date.now());
      } else {
        setSessionComplete(true);
      }
    } catch (error) {
      console.error('Failed to process study session:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (words.length === 0) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <h2 className="text-2xl font-bold mb-4">No New Words</h2>
        <p className="text-gray-600 mb-6">You've completed your daily goal for new words!</p>
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
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold mb-2">Session Complete!</h2>
          <p className="text-gray-600">You've learned {words.length} new words</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="text-sm text-gray-500 mb-1">Session Time</div>
          <div className="text-xl font-semibold">
            {Math.round((Date.now() - sessionStartTime) / 60000)} minutes
          </div>
        </div>

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

  const currentWord = words[currentIndex];
  const progress = ((currentIndex + 1) / words.length) * 100;

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Word {currentIndex + 1} of {words.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 rounded-full h-2 transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Word Card */}
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">{currentWord.word}</h1>
          {currentWord.pronunciation && (
            <p className="text-lg text-gray-500">/{currentWord.pronunciation}/</p>
          )}
          {currentWord.partOfSpeech && (
            <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm mt-2">
              {currentWord.partOfSpeech}
            </span>
          )}
        </div>

        {!showMeaning ? (
          <div>
            <p className="text-gray-600 mb-6">Try to recall the meaning, then reveal the answer</p>
            <button
              onClick={() => setShowMeaning(true)}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 text-lg"
            >
              Show Meaning
            </button>
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-3">{currentWord.meaning}</h2>
              {currentWord.example && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 italic">"{currentWord.example}"</p>
                </div>
              )}
            </div>

            <div>
              <p className="text-gray-600 mb-4">How well did you know this word?</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <QualityButton
                  quality={1}
                  label="Didn't know"
                  color="bg-red-500 hover:bg-red-600"
                  onClick={() => handleQualityRating(1)}
                />
                <QualityButton
                  quality={2}
                  label="Vague idea"
                  color="bg-orange-500 hover:bg-orange-600"
                  onClick={() => handleQualityRating(2)}
                />
                <QualityButton
                  quality={4}
                  label="Knew it"
                  color="bg-green-500 hover:bg-green-600"
                  onClick={() => handleQualityRating(4)}
                />
                <QualityButton
                  quality={5}
                  label="Easy"
                  color="bg-blue-500 hover:bg-blue-600"
                  onClick={() => handleQualityRating(5)}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="mt-6 bg-blue-50 rounded-lg p-4">
        <h3 className="font-semibold text-blue-800 mb-2">💡 Learning Tip</h3>
        <p className="text-blue-700 text-sm">
          Try to use the word in your own sentence to better remember it. The spaced repetition system will schedule reviews based on how well you know each word.
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
