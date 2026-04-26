import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = window.localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const register = (payload) => api.post('/auth/register', payload);
const login = (payload) => api.post('/auth/login', payload);
const createShortUrl = (payload) => api.post('/urls', payload);
const fetchUrls = () => api.get('/urls');
const fetchClicksLast7Days = () => api.get('/urls/analytics/last-7-days');

export default {
  register,
  login,
  createShortUrl,
  fetchUrls,
  fetchClicksLast7Days,
};
