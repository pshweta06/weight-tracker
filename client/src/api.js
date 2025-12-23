import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors (unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  signup: (email, password, name) =>
    api.post('/auth/signup', { email, password, name }),
  login: (username, password) =>
    api.post('/auth/login', { username, password }),
  changePassword: (currentPassword, newPassword) =>
    api.post('/auth/change-password', { currentPassword, newPassword }),
};

export const weightAPI = {
  getAll: () => api.get('/weight'),
  getByPeriod: (period) => api.get(`/weight/period?period=${period}`),
  getByDate: (date) => api.get(`/weight/date/${date}`),
  add: (weight, date) => api.post('/weight', { weight, date }),
  delete: (id) => api.delete(`/weight/${id}`),
};

export const userAPI = {
  getProfile: () => api.get('/user/profile'),
  updateTargetWeight: (targetWeight) =>
    api.put('/user/target-weight', { targetWeight }),
  updateEmail: (email) => api.put('/user/email', { email }),
  updateUsername: (username) => api.put('/user/username', { username }),
  updateName: (name) => api.put('/user/name', { name }),
  testEmail: () => api.post('/user/test-email'),
};

export default api;

