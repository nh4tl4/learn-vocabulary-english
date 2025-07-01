export interface User {
  id: number;
  email: string;
  name: string;
  level: string; // Add level field: 'beginner' | 'intermediate' | 'advanced'
  createdAt: string;
}

export interface Vocabulary {
  id: number;
  word: string;
  meaning: string;
  pronunciation?: string;
  example?: string;
  level: string;
  partOfSpeech: string;
  topic?: string;
  topicVi?: string;
  createdAt: string;
}

export interface UserVocabulary {
  id: number;
  userId: number;
  vocabularyId: number;
  isLearned: boolean;
  correctCount: number;
  incorrectCount: number;
  lastReviewedAt?: string;
  vocabulary?: Vocabulary;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface UserStats {
  user: User;
  stats: {
    totalLearned: number;
    totalReviewed: number;
    correctAnswers: number;
    incorrectAnswers: number;
    accuracy: number;
  };
}
