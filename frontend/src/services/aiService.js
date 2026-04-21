import axios from 'axios';

const API = axios.create({ baseURL: '/api/ai' });

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// AI Validation
export const validateIdea = (ideaData) => API.post('/validate', ideaData);