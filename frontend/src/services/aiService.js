import axios from 'axios';
import { API_BASE_URL } from '../config';

const API = axios.create({ 
  baseURL: `${API_BASE_URL}/ai` 
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// AI Validation
export const validateIdea = (ideaData) => API.post('/validate', ideaData);