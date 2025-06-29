'use client';

import { useState } from 'react';
import { SpeakerWaveIcon, SpeakerXMarkIcon } from '@heroicons/react/24/outline';

interface TextToSpeechProps {
  text: string;
  lang?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function TextToSpeech({
  text,
  lang = 'en-US',
  className = '',
  size = 'md'
}: TextToSpeechProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  const speak = () => {
    if (!text.trim()) return;

    // Check if speech synthesis is supported
    if (!window.speechSynthesis) {
      setIsSupported(false);
      return;
    }

    // Stop any ongoing speech
    window.speechSynthesis.cancel();

    // Create speech utterance
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.8; // Slightly slower for better comprehension
    utterance.pitch = 1;
    utterance.volume = 1;

    // Set event handlers
    utterance.onstart = () => {
      setIsPlaying(true);
    };

    utterance.onend = () => {
      setIsPlaying(false);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      console.error('Speech synthesis error');
    };

    // Speak the text
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
  };

  if (!isSupported) {
    return null; // Don't render if not supported
  }

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const buttonSizeClasses = {
    sm: 'p-1',
    md: 'p-2',
    lg: 'p-2.5'
  };

  return (
    <button
      onClick={isPlaying ? stopSpeaking : speak}
      className={`
        inline-flex items-center justify-center rounded-full
        transition-all duration-200 hover:scale-110
        ${isPlaying 
          ? 'bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50' 
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600'
        }
        ${buttonSizeClasses[size]}
        ${className}
      `}
      title={isPlaying ? 'Dừng phát âm' : 'Nghe phát âm'}
      type="button"
    >
      {isPlaying ? (
        <SpeakerXMarkIcon className={sizeClasses[size]} />
      ) : (
        <SpeakerWaveIcon className={sizeClasses[size]} />
      )}
    </button>
  );
}
