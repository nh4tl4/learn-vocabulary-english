'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { useLevelStore, VocabularyLevel } from '@/store/levelStore';

const levelLabels: Record<VocabularyLevel, string> = {
  all: 'Tất cả',
  beginner: 'Cơ bản',
  intermediate: 'Trung cấp',
  advanced: 'Nâng cao'
};

const levelColors: Record<VocabularyLevel, string> = {
  all: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
  beginner: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  intermediate: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
  advanced: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
};

export default function LevelSelector() {
  const { selectedLevel, setLevel } = useLevelStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLevelSelect = (level: VocabularyLevel) => {
    setLevel(level);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${levelColors[selectedLevel]} hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800`}
      >
        <span className="mr-2">{levelLabels[selectedLevel]}</span>
        <ChevronDownIcon
          className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 dark:ring-gray-700 z-50">
          <div className="py-1">
            {(Object.keys(levelLabels) as VocabularyLevel[]).map((level) => (
              <button
                key={level}
                onClick={() => handleLevelSelect(level)}
                className={`w-full text-left px-4 py-2 text-sm transition-colors duration-200 ${
                  selectedLevel === level
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${levelColors[level]}`}>
                  {levelLabels[level]}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
