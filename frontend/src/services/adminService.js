/**
 * adminService.js
 * All API calls to /api/admin/* routes.
 * Every call attaches the Bearer token from localStorage.
 */

const BASE = 'http://localhost:5000/api/admin';

function authHeaders(token) {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

async function request(method, url, token, body) {
  const opts = {
    method,
    headers: authHeaders(token),
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(url, opts);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

// ── Stats ────────────────────────────────────────────────────────────────
export const getStats = (token) => request('GET', `${BASE}/stats`, token);

// ── Mentors ──────────────────────────────────────────────────────────────
export const getMentors = (token, params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return request('GET', `${BASE}/mentors?${qs}`, token);
};
export const getPendingMentors = (token) =>
  request('GET', `${BASE}/mentors/pending`, token);
export const verifyMentor = (token, mentorId, action, note = '') =>
  request('PATCH', `${BASE}/mentors/${mentorId}/verify`, token, { action, note });

// ── Organizers ───────────────────────────────────────────────────────────
export const getOrganizers = (token, params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return request('GET', `${BASE}/organizers?${qs}`, token);
};
export const verifyOrganizer = (token, userId, action) =>
  request('PATCH', `${BASE}/organizers/${userId}/verify`, token, { action });

// ── Featured Content ─────────────────────────────────────────────────────
export const getFeatured = (token, params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return request('GET', `${BASE}/featured?${qs}`, token);
};
export const addFeatured = (token, payload) =>
  request('POST', `${BASE}/featured`, token, payload);
export const updateFeatured = (token, id, payload) =>
  request('PATCH', `${BASE}/featured/${id}`, token, payload);
export const deleteFeatured = (token, id) =>
  request('DELETE', `${BASE}/featured/${id}`, token);

// ── Profile Reports ──────────────────────────────────────────────────────
export const getReports = (token, params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return request('GET', `${BASE}/reports?${qs}`, token);
};
export const actOnReport = (token, reportId, action, adminNote = '') =>
  request('PATCH', `${BASE}/reports/${reportId}/action`, token, { action, adminNote });
export const submitReport = (token, reportedUser, reason, details = '') =>
  request('POST', `${BASE}/reports`, token, { reportedUser, reason, details });

// ── Users ────────────────────────────────────────────────────────────────
export const getUsers = (token, params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return request('GET', `${BASE}/users?${qs}`, token);
};
export const toggleSuspension = (token, userId, suspend, reason = '') =>
  request('PATCH', `${BASE}/users/${userId}/suspend`, token, { suspend, reason });
