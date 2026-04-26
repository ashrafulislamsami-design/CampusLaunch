import axios from 'axios';
import { API_BASE_URL } from '@/config';

const API = axios.create({ 
  baseURL: `${API_BASE_URL}/curriculum` 
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getAllModules = () => API.get('/modules');

export const getModuleByWeek = (weekNumber) => API.get(`/modules/${weekNumber}`);

export const createModule = (data) => API.post('/modules', data);

export const updateModule = (weekNumber, data) => API.put(`/modules/${weekNumber}`, data);

export const deleteModule = (weekNumber) => API.delete(`/modules/${weekNumber}`);

export const getStudentProgress = () => API.get('/progress');

export const markVideoWatched = (weekNumber) => API.post('/progress/video', { weekNumber });

export const submitQuiz = (weekNumber, answers) => API.post('/progress/quiz', { weekNumber, answers });

export const submitAssignment = (weekNumber, text) => API.post('/progress/assignment', { weekNumber, text });

export const getCertificateEligibility = () => API.get('/progress/certificate');
