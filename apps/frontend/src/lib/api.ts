import axios from 'axios';
import Cookies from 'js-cookie';

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

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = Cookies.get('auth_token');
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
      Cookies.remove('auth_token');
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

  create: (vocabulary: {
    word: string;
    meaning: string;
    pronunciation?: string;
    example?: string;
    level?: string;
    partOfSpeech?: string;
  }) => apiClient.post('/vocabulary', vocabulary),

  // New Learning System endpoints
  getDashboard: () =>
    apiClient.get('/vocabulary/dashboard/stats'),

  getNewWords: (limit = 10) =>
    apiClient.get(`/vocabulary/learn/new?limit=${limit}`),

  getWordsForReview: (limit = 20) =>
    apiClient.get(`/vocabulary/review/due?limit=${limit}`),

  processStudySession: (sessionData: {
    vocabularyId: number;
    quality: number;
    responseTime: number;
  }) => apiClient.post('/vocabulary/learn/session', sessionData),

  generateTest: (count = 10) =>
    apiClient.get(`/vocabulary/test/generate?count=${count}`),

  submitTest: (results: Array<{
    vocabularyId: number;
    selectedOptionId: number;
    correctOptionId: number;
    timeSpent: number;
  }>) => apiClient.post('/vocabulary/test/submit', results),

  getTodayProgress: () =>
    apiClient.get('/vocabulary/progress/today'),
};

export default apiClient;
