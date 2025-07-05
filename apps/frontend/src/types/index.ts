export interface User {
  id: number;
  email: string;
  name: string;
  level: string; // Add level field: 'beginner' | 'intermediate' | 'advanced'
  createdAt: string;
}

// New Topic interface for the topics table
export interface Topic {
  id: number;
  name: string;
  nameVi: string;
  description?: string;
  descriptionVi?: string;
  icon?: string;
  displayOrder: number;
  isActive: boolean;
  vocabularyCount: number;
  createdAt: string;
  updatedAt: string;
}

// Interface for topic progress data
export interface TopicProgress {
  topic: string;
  totalLearned: number;
  mastered: number;
  learning: number;
  difficult: number;
  masteryPercentage: number;
  level?: string;
}

// Interface for the consolidated API response
export interface TopicWithProgress extends Topic {
  progress?: TopicProgress;
}

// Updated Vocabulary interface - removed deprecated topic fields
export interface Vocabulary {
  id: number;
  word: string;
  meaning: string;
  pronunciation?: string;
  example?: string;
  exampleVi?: string;
  level: string;
  partOfSpeech: string;
  topicId?: number; // Foreign key to Topic
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
  // Relation to topic (when populated)
  topicEntity?: Topic;
}

// Topic stats interface for API responses
export interface TopicStats {
  id: number;
  name: string;
  nameVi: string;
  description?: string;
  descriptionVi?: string;
  icon?: string;
  count: number; // Number of vocabularies in this topic
}

// Legacy topic interface for backward compatibility
export interface LegacyTopicData {
  topic: string;
  topicVi: string;
  count: number;
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
