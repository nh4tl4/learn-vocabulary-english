import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LearningSettings {
  // Số lượng từ trong mỗi session
  newWordsPerSession: number;
  reviewWordsPerSession: number;
  testWordsPerSession: number;

  // Cấu hình theo topic
  topicSettings: Record<string, {
    newWordsPerSession?: number;
    reviewWordsPerSession?: number;
    testWordsPerSession?: number;
  }>;

  // Actions
  setNewWordsPerSession: (count: number) => void;
  setReviewWordsPerSession: (count: number) => void;
  setTestWordsPerSession: (count: number) => void;
  setTopicSettings: (topic: string, settings: {
    newWordsPerSession?: number;
    reviewWordsPerSession?: number;
    testWordsPerSession?: number;
  }) => void;
  getTopicSettings: (topic: string) => {
    newWordsPerSession: number;
    reviewWordsPerSession: number;
    testWordsPerSession: number;
  };
}

export const useLearningSettingsStore = create<LearningSettings>()(
  persist(
    (set, get) => ({
      // Default settings
      newWordsPerSession: 10,
      reviewWordsPerSession: 20,
      testWordsPerSession: 15,
      topicSettings: {},

      setNewWordsPerSession: (count: number) => {
        set({ newWordsPerSession: Math.max(1, Math.min(50, count)) });
      },

      setReviewWordsPerSession: (count: number) => {
        set({ reviewWordsPerSession: Math.max(1, Math.min(100, count)) });
      },

      setTestWordsPerSession: (count: number) => {
        set({ testWordsPerSession: Math.max(1, Math.min(50, count)) });
      },

      setTopicSettings: (topic: string, settings) => {
        set(state => ({
          topicSettings: {
            ...state.topicSettings,
            [topic]: {
              ...state.topicSettings[topic],
              ...settings
            }
          }
        }));
      },

      getTopicSettings: (topic: string) => {
        const state = get();
        const topicSpecific = state.topicSettings[topic] || {};

        return {
          newWordsPerSession: topicSpecific.newWordsPerSession ?? state.newWordsPerSession,
          reviewWordsPerSession: topicSpecific.reviewWordsPerSession ?? state.reviewWordsPerSession,
          testWordsPerSession: topicSpecific.testWordsPerSession ?? state.testWordsPerSession,
        };
      },
    }),
    {
      name: 'learning-settings-storage',
    }
  )
);
