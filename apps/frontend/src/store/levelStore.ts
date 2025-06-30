'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type VocabularyLevel = 'beginner' | 'intermediate' | 'advanced' | 'all';

interface LevelState {
  selectedLevel: VocabularyLevel;
  setLevel: (level: VocabularyLevel) => void;
}

export const useLevelStore = create<LevelState>()(
  persist(
    (set) => ({
      selectedLevel: 'all',
      setLevel: (level) => set({ selectedLevel: level }),
    }),
    {
      name: 'vocabulary-level-storage',
    }
  )
);
