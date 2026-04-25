export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// For Socket.io/Canvas logic (Stripping /api for the base origin)
export const SOCKET_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001/api').replace('/api', '');
