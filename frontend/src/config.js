export const API_BASE_URL = (import.meta.env.VITE_API_URL || 'https://4a636a41-00d1-4dd7-a409-e115424918a7-00-314ov3l9fq6x1.sisko.replit.dev/api').replace(/\/$/, '');

// For Socket.io/Canvas logic (Stripping /api for the base origin)
export const SOCKET_URL = API_BASE_URL.replace(/\/api\/?$/, '');

