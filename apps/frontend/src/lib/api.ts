import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = Cookies.get('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove('auth_token');
      window.location.href = '/auth';
    }
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
};

export const vocabularyAPI = {
  getAll: (page = 1, limit = 20) =>
    apiClient.get(`/vocabulary?page=${page}&limit=${limit}`),

  getRandom: (count = 10) =>
    apiClient.get(`/vocabulary/random?count=${count}`),

  getProgress: () =>
    apiClient.get('/vocabulary/progress'),

  updateProgress: (vocabularyId: number, isCorrect: boolean) =>
    apiClient.post('/vocabulary/progress', { vocabularyId, isCorrect }),

  create: (vocabulary: {
    word: string;
    meaning: string;
    pronunciation?: string;
    example?: string;
    level?: string;
    partOfSpeech?: string;
  }) => apiClient.post('/vocabulary', vocabulary),
};

export default apiClient;
