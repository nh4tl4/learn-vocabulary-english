'use client';

import { useState } from 'react';

interface TextToSpeechProps {
  text: string;
  lang?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
  className?: string;
}

export default function TextToSpeech({
  text,
  lang = 'en-US',
  rate = 0.8,
  pitch = 1,
  volume = 1,
  className = ""
}: TextToSpeechProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  const speak = () => {
    if (!('speechSynthesis' in window)) {
      setIsSupported(false);
      return;
    }

    // Dừng phát âm hiện tại nếu có
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      console.error('Speech synthesis error');
    };

    speechSynthesis.speak(utterance);
  };

  const stop = () => {
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  if (!isSupported) {
    return (
      <button
        disabled
        className={`opacity-50 cursor-not-allowed ${className}`}
        title="Trình duyệt không hỗ trợ phát âm"
      >
        🔇
      </button>
    );
  }

  return (
    <button
      onClick={isSpeaking ? stop : speak}
      className={`transition-all duration-200 hover:scale-110 ${className} ${
        isSpeaking ? 'animate-pulse text-blue-600' : 'text-gray-600 hover:text-blue-600'
      }`}
      title={isSpeaking ? 'Dừng phát âm' : 'Phát âm'}
    >
      {isSpeaking ? '🔊' : '🔉'}
    </button>
  );
}
