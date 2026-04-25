import axios from 'axios';
import { API_BASE_URL } from '../config';

const API = axios.create({ 
  baseURL: `${API_BASE_URL}/pitch` 
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Events
export const listEvents = (params) => API.get('/events', { params });
export const getEvent = (id) => API.get(`/events/${id}`);
export const createEvent = (data) => API.post('/events', data);
export const updateEvent = (id, data) => API.put(`/events/${id}`, data);
export const deleteEvent = (id) => API.delete(`/events/${id}`);
export const startEvent = (id) => API.post(`/events/${id}/start`);
export const nextPresenter = (id) => API.post(`/events/${id}/next`);
export const endEvent = (id) => API.post(`/events/${id}/end`);
export const publishResults = (id) => API.post(`/events/${id}/publish`);

// Registration
export const registerTeam = (eventId, data) => API.post(`/events/${eventId}/register`, data);
export const getRegistrations = (eventId) => API.get(`/events/${eventId}/registrations`);
export const approveRegistration = (regId) => API.put(`/registrations/${regId}/approve`);
export const rejectRegistration = (regId) => API.put(`/registrations/${regId}/reject`);
export const getMyEvents = () => API.get('/my-events');

// Pitch deck upload
export const uploadPitchDeck = (file) => {
  const formData = new FormData();
  formData.append('pitchDeck', file);
  return API.post('/upload-deck', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

// Scoring
export const submitScore = (data) => API.post('/scores', data);
export const getEventScores = (eventId) => API.get(`/events/${eventId}/scores`);
export const getLeaderboard = (eventId) => API.get(`/events/${eventId}/leaderboard`);

// Voting
export const submitVote = (eventId, teamId) => API.post('/votes', { eventId, teamId });
export const getVoteCounts = (eventId) => API.get(`/events/${eventId}/votes`);

// Results & Stats
export const getResults = (eventId) => API.get(`/events/${eventId}/results`);
export const getEventStats = (eventId) => API.get(`/events/${eventId}/stats`);
