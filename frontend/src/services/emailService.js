import axios from 'axios';

const API = 'http://localhost:5000/api/email';

const authHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getEmailPreferences = async () => {
  const res = await axios.get(`${API}/preferences`, { headers: authHeaders() });
  return res.data;
};

export const updateEmailPreferences = async (payload) => {
  const res = await axios.put(`${API}/preferences`, payload, {
    headers: authHeaders(),
  });
  return res.data;
};

export const resetEmailPreferences = async () => {
  const res = await axios.post(
    `${API}/preferences/reset`,
    {},
    { headers: authHeaders() }
  );
  return res.data;
};

export const getEmailLog = async () => {
  const res = await axios.get(`${API}/log`, { headers: authHeaders() });
  return res.data;
};

export const sendTestEmail = async (emailType) => {
  const res = await axios.post(
    `${API}/test/${emailType}`,
    {},
    { headers: authHeaders() }
  );
  return res.data;
};
