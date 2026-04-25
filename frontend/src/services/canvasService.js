import axios from 'axios';
import { API_BASE } from '../components/canvas/canvasConstants';

const authHeaders = (token) => ({ headers: { Authorization: `Bearer ${token}` } });
const url = (path) => `${API_BASE}/api/canvas${path}`;

export const canvasService = {
  getCanvas: (token, teamId) =>
    axios.get(url(`/team/${teamId}`), authHeaders(token)).then((r) => r.data),

  addCard: (token, teamId, sectionKey, content = '', color = 'yellow') =>
    axios
      .post(url(`/team/${teamId}/card`), { sectionKey, content, color }, authHeaders(token))
      .then((r) => r.data),

  updateCard: (token, teamId, cardId, sectionKey, { content, color } = {}) =>
    axios
      .put(url(`/team/${teamId}/card/${cardId}`), { sectionKey, content, color }, authHeaders(token))
      .then((r) => r.data),

  deleteCard: (token, teamId, cardId, sectionKey) =>
    axios
      .delete(url(`/team/${teamId}/card/${cardId}`), {
        ...authHeaders(token),
        data: { sectionKey }
      })
      .then((r) => r.data),

  updateSection: (token, teamId, sectionKey, cards) =>
    axios
      .put(url(`/team/${teamId}/section`), { sectionKey, cards }, authHeaders(token))
      .then((r) => r.data),

  reorderSection: (token, teamId, sectionKey, cardOrder) =>
    axios
      .put(url(`/team/${teamId}/section/${sectionKey}/reorder`), { cardOrder }, authHeaders(token))
      .then((r) => r.data),

  toggleLock: (token, teamId, sectionKey) =>
    axios
      .put(url(`/team/${teamId}/section/${sectionKey}/lock`), {}, authHeaders(token))
      .then((r) => r.data),

  // Versions
  listVersions: (token, teamId) =>
    axios.get(url(`/team/${teamId}/versions`), authHeaders(token)).then((r) => r.data),

  createVersion: (token, teamId, label = '', isAutoSave = false) =>
    axios
      .post(url(`/team/${teamId}/versions`), { label, isAutoSave }, authHeaders(token))
      .then((r) => r.data),

  getVersion: (token, teamId, vId) =>
    axios.get(url(`/team/${teamId}/versions/${vId}`), authHeaders(token)).then((r) => r.data),

  restoreVersion: (token, teamId, vId) =>
    axios.post(url(`/team/${teamId}/versions/${vId}/restore`), {}, authHeaders(token)).then((r) => r.data),

  // Comments
  listComments: (token, teamId, section) =>
    axios.get(url(`/team/${teamId}/comments/${section}`), authHeaders(token)).then((r) => r.data),

  addComment: (token, teamId, sectionKey, content) =>
    axios
      .post(url(`/team/${teamId}/comments`), { sectionKey, content }, authHeaders(token))
      .then((r) => r.data),

  editComment: (token, commentId, content) =>
    axios.put(url(`/comments/${commentId}`), { content }, authHeaders(token)).then((r) => r.data),

  deleteComment: (token, commentId) =>
    axios.delete(url(`/comments/${commentId}`), authHeaders(token)).then((r) => r.data),

  // Share
  enableShare: (token, teamId) =>
    axios.post(url(`/team/${teamId}/share/enable`), {}, authHeaders(token)).then((r) => r.data),

  disableShare: (token, teamId) =>
    axios.post(url(`/team/${teamId}/share/disable`), {}, authHeaders(token)).then((r) => r.data),

  getPublicCanvas: (shareToken) =>
    axios.get(url(`/share/${shareToken}`)).then((r) => r.data)
};

export default canvasService;
