import axios from 'axios';


// Use Fly.io backend URL instead of Render
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://learn-vocabulary-backend.fly.dev/api';
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
  updateProfile: (data: { name?: string }) =>
    apiClient.put('/user/profile', data),
  setDailyGoal: (dailyGoal: number) =>
    apiClient.put('/user/daily-goal', { dailyGoal }),

  // Topic history APIs
  saveTopicSelection: (topic: string | null) =>
    apiClient.post('/user/topic-selection', { topic }),
  getTopicHistory: () =>
    apiClient.get('/user/topic-history'),
  getLastSelectedTopic: () =>
    apiClient.get('/user/last-selected-topic'),
  updateTopicWordsLearned: (topic: string | null, wordsCount: number) =>
    apiClient.post('/user/topic-words-learned', { topic, wordsCount }),

  // Selected topics APIs
  getSelectedTopics: () =>
    apiClient.get('/user/selected-topics'),
  saveSelectedTopics: (topics: string[]) =>
    apiClient.post('/user/selected-topics', { topics }),
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

  getLearningDashboard: () =>
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

  // New Review by Period endpoints
  getReviewStats: () =>
    apiClient.get('/vocabulary/review/stats'),

  getWordsForReviewByPeriod: (period: string = 'today', limit = 20, level?: string) => {
    const params = new URLSearchParams({
      period,
      limit: limit.toString()
    });
    if (level) params.append('level', level);
    return apiClient.get(`/vocabulary/review/by-period?${params}`);
  },

  getReviewWordsByTopic: (topicId: number, limit = 20, period?: string, level?: string) => {
    const params = new URLSearchParams({ limit: limit.toString() });
    if (period) params.append('period', period);
    if (level) params.append('level', level);
    return apiClient.get(`/vocabulary/topics/${topicId}/review/by-period?${params}`);
  },

  // Process study session
  processStudySession: (sessionData: { vocabularyId: number; quality: number; responseTime: number }) =>
    apiClient.post('/vocabulary/learn/session', sessionData),

  // Generate test
  generateTest: (count = 10, mode: 'en-to-vi' | 'vi-to-en' | 'mixed' = 'mixed', inputType: 'multiple-choice' | 'text-input' | 'mixed' = 'multiple-choice') =>
    apiClient.get(`/vocabulary/test/generate?count=${count}&mode=${mode}&inputType=${inputType}`),

  // Submit test results
  submitTestResults: (testResults: any[]) =>
    apiClient.post('/vocabulary/test/submit', testResults),

  // Alias for submitTestResults
  submitTest: (testResults: any[]) =>
    apiClient.post('/vocabulary/test/submit', testResults),

  // Difficult words endpoints
  getDifficultWords: (limit = 20, level?: string) => {
    const params = new URLSearchParams({ limit: limit.toString() });
    if (level) params.append('level', level);
    return apiClient.get(`/vocabulary/learn/difficult?${params}`);
  },

  // Topic-based endpoints with level support - UPDATED for new topic structure
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

  getVocabularyByTopic: (topicId: number, page = 1, limit = 20, level?: string) => {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    if (level) params.append('level', level);
    return apiClient.get(`/vocabulary/topic/${topicId}?${params}`);
  },

  getNewWordsByTopic: (topicId: number, limit = 10, level?: string) => {
    const params = new URLSearchParams({ limit: limit.toString() });
    if (level) params.append('level', level);
    return apiClient.get(`/vocabulary/topics/${topicId}/new?${params}`);
  },

  generateTestByTopic: (topicId: number, count = 10, mode: 'en-to-vi' | 'vi-to-en' | 'mixed' = 'mixed', inputType: 'multiple-choice' | 'text-input' | 'mixed' = 'multiple-choice', level?: string) => {
    const params = new URLSearchParams({
      count: count.toString(),
      mode,
      inputType
    });
    if (level) params.append('level', level);
    return apiClient.get(`/vocabulary/topics/${topicId}/test?${params}`);
  },

  getProgressByTopic: (topicId: number, level?: string) => {
    const params = level ? `?level=${level}` : '';
    return apiClient.get(`/vocabulary/topics/${topicId}/progress${params}`);
  },

  // Bulk progress endpoint for multiple topics - NEW
  getProgressByMultipleTopics: (topics: string[], level?: string) => {
    const params = new URLSearchParams({ topics: topics.join(',') });
    if (level) params.append('level', level);
    return apiClient.get(`/vocabulary/progress/multiple?${params}`);
  },

  // Search words by topic with level support
  searchWordsByTopic: (topicId: number, word: string, limit = 10, level?: string) => {
    const params = new URLSearchParams({ word: word, limit: limit.toString() });
    if (level) params.append('level', level);
    return apiClient.get(`/vocabulary/topics/${topicId}/search?${params}`);
  },

  findWordByTopic: (topicName: string, word: string, level?: string) => {
    const params = new URLSearchParams({ topic: topicName, word: word });
    if (level) params.append('level', level);
    return apiClient.get(`/vocabulary/search/topic?${params}`);
  },

  // Get today's learned and reviewed words
  getTodayLearnedWords: () =>
    apiClient.get('/vocabulary/today/learned'),

  getTodayReviewedWords: () =>
    apiClient.get('/vocabulary/today/reviewed'),

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

// Add new Topics API for direct access to topics table
export const topicsAPI = {
  // Get all topics with vocabulary counts
  getAll: () => apiClient.get('/topics'),

  // Get topics with vocabulary counts (paginated)
  getWithCounts: () => apiClient.get('/topics/with-counts'),

  // Get topic by ID
  getById: (id: number) => apiClient.get(`/topics/${id}`),

  // Create new topic (admin only)
  create: (topicData: {
    name: string;
    nameVi: string;
    description?: string;
    descriptionVi?: string;
    icon?: string;
    displayOrder?: number;
  }) => apiClient.post('/topics', topicData),

  // Update topic (admin only)
  update: (id: number, topicData: Partial<{
    name: string;
    nameVi: string;
    description: string;
    descriptionVi: string;
    icon: string;
    displayOrder: number;
    isActive: boolean;
  }>) => apiClient.put(`/topics/${id}`, topicData),
};

export default apiClient;
