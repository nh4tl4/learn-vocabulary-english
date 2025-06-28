import axios from 'axios';

// Use production backend URL from Render or fallback to localhost for development
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://vocabulary-backend-lm26.onrender.com/api';
console.log('Environment Variables:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
console.log('Final API_URL:', API_URL);

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout for production
});

// Add auth token to requests from localStorage
apiClient.interceptors.request.use((config) => {
  // Get token from localStorage instead of cookies
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors and network issues
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/auth';
    }

    // Log API errors for debugging
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.response?.data?.message || error.message
    });

    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email: string, password: string) =>
    apiClient.post('/auth/login', { email, password }),

  register: (email: string, password: string, name: string) =>
    apiClient.post('/auth/register', { email, password, name }),
};

export const userAPI = {
  getProfile: () => apiClient.get('/user/profile'),
  getStats: () => apiClient.get('/user/stats'),
  updateProfile: (data: { name?: string }) =>
    apiClient.put('/user/profile', data),
  setDailyGoal: (dailyGoal: number) =>
    apiClient.put('/user/daily-goal', { dailyGoal }),
};

export const vocabularyAPI = {
  getAll: (page = 1, limit = 20) =>
    apiClient.get(`/vocabulary?page=${page}&limit=${limit}`),

  getRandom: (count = 10) =>
    apiClient.get(`/vocabulary/random?count=${count}`),

  getProgress: () =>
    apiClient.get('/vocabulary/progress'),

  getUserProgress: (level?: string) => {
    const params = level ? `?level=${level}` : '';
    return apiClient.get(`/vocabulary/progress${params}`);
  },

  create: (vocabulary: {
    word: string;
    meaning: string;
    pronunciation?: string;
    example?: string;
    level?: string;
    partOfSpeech?: string;
  }) => apiClient.post('/vocabulary', vocabulary),

  // New Learning System endpoints with level support
  getDashboard: () =>
    apiClient.get('/vocabulary/dashboard/stats'),

  getNewWords: (limit = 10, level?: string) => {
    const params = new URLSearchParams({ limit: limit.toString() });
    if (level) params.append('level', level);
    return apiClient.get(`/vocabulary/learn/new?${params}`);
  },

  getWordsForReview: (limit = 20, level?: string) => {
    const params = new URLSearchParams({ limit: limit.toString() });
    if (level) params.append('level', level);
    return apiClient.get(`/vocabulary/learn/review?${params}`);
  },

  processStudySession: (sessionData: {
    vocabularyId: number;
    quality: number;
    responseTime: number;
  }) => apiClient.post('/vocabulary/learn/session', sessionData),

  generateTest: (count = 10, mode: 'en-to-vi' | 'vi-to-en' | 'mixed' = 'mixed', inputType: 'multiple-choice' | 'text-input' | 'mixed' = 'multiple-choice') =>
    apiClient.get(`/vocabulary/test/generate?count=${count}&mode=${mode}&inputType=${inputType}`),

  submitTest: (testResults: Array<{
    vocabularyId: number;
    selectedOptionId: number;
    correctOptionId: number;
    timeSpent: number;
  }>) => apiClient.post('/vocabulary/test/submit', testResults),

  getDifficultWords: (limit = 20, level?: string) => {
    const params = new URLSearchParams({ limit: limit.toString() });
    if (level) params.append('level', level);
    return apiClient.get(`/vocabulary/learn/difficult?${params}`);
  },

  // Topic-based endpoints with level support
  getTopics: (page = 1, limit = 20, level?: string) => {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    if (level) params.append('level', level);
    return apiClient.get(`/vocabulary/topics?${params}`);
  },

  getTopicStats: (page = 1, limit = 20, level?: string) => {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    if (level) params.append('level', level);
    return apiClient.get(`/vocabulary/topics/stats?${params}`);
  },

  getVocabularyByTopic: (topic: string, page = 1, limit = 20, level?: string) => {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    if (level) params.append('level', level);
    return apiClient.get(`/vocabulary/topic/${encodeURIComponent(topic)}?${params}`);
  },

  getNewWordsByTopic: (topic: string, limit = 10, level?: string) => {
    const params = new URLSearchParams({ limit: limit.toString() });
    if (level) params.append('level', level);
    return apiClient.get(`/vocabulary/topics/${encodeURIComponent(topic)}/new?${params}`);
  },

  getReviewWordsByTopic: (topic: string, limit = 20, level?: string) => {
    const params = new URLSearchParams({ limit: limit.toString() });
    if (level) params.append('level', level);
    return apiClient.get(`/vocabulary/topics/${encodeURIComponent(topic)}/review?${params}`);
  },

  generateTestByTopic: (topic: string, count = 10, mode: 'en-to-vi' | 'vi-to-en' | 'mixed' = 'mixed', inputType: 'multiple-choice' | 'text-input' | 'mixed' = 'multiple-choice') =>
    apiClient.get(`/vocabulary/topics/${encodeURIComponent(topic)}/test?count=${count}&mode=${mode}&inputType=${inputType}`),

  getProgressByTopic: (topic: string, level?: string) => {
    const params = level ? `?level=${level}` : '';
    return apiClient.get(`/vocabulary/topics/${encodeURIComponent(topic)}/progress${params}`);
  },

  // Search words by topic with level support
  searchWordsByTopic: (topic: string, word: string, limit = 10, level?: string) => {
    const params = new URLSearchParams({ word: word, limit: limit.toString() });
    if (level) params.append('level', level);
    return apiClient.get(`/vocabulary/topics/${encodeURIComponent(topic)}/search?${params}`);
  },

  findWordByTopic: (topic: string, word: string, level?: string) => {
    const params = new URLSearchParams({ topic: topic, word: word });
    if (level) params.append('level', level);
    return apiClient.get(`/vocabulary/search/topic?${params}`);
  },
};

export const aiAPI = {
  // Check AI availability
  getStatus: () => apiClient.get('/ai/status'),

  // AI Chat Bot
  chat: (message: string, conversationHistory: Array<{role: string, content: string}> = []) =>
    apiClient.post('/ai/chat', { message, conversationHistory }),

  // Generate example sentences
  generateExamples: (word: string, meaning: string) =>
    apiClient.post('/ai/generate-examples', { word, meaning }),

  // Assess word difficulty
  assessDifficulty: (word: string, meaning: string) =>
    apiClient.post('/ai/assess-difficulty', { word, meaning }),

  // Get pronunciation tips
  getPronunciationTip: (word: string) =>
    apiClient.get(`/ai/pronunciation-tip?word=${encodeURIComponent(word)}`),

  // Generate personalized learning path
  generateLearningPath: (userLevel: string, weakAreas: string[], interests: string[]) =>
    apiClient.post('/ai/learning-path', { userLevel, weakAreas, interests }),

  // Get study motivation
  getMotivation: () => apiClient.get('/ai/study-motivation'),
};

export default apiClient;
