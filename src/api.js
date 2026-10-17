import axios from "axios";

export const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:2011";
export const api = axios.create({ baseURL: API_BASE, timeout: 10000 });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("fmt_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export function friendlyError(error) {
  if (error?.response) {
    const data = error.response.data;
    return (
      data?.message ||
      data?.error ||
      `Request failed (${error.response.status})`
    );
  }
  if (error?.code === "ECONNABORTED")
    return "The backend took too long to respond.";
  return `Cannot reach backend at ${API_BASE}. Is Spring Boot running?`;
}

export const authApi = {
  login: (payload) => api.post("/api/auth/login", payload),
  register: (payload) => api.post("/api/auth/register", payload),
};
export const skillApi = {
  list: () => api.get("/api/skills"),
};
export const studentApi = {
  list: (params = {}) => api.get("/api/students", { params }),
  get: (id) => api.get(`/api/students/${id}`),
  search: (params = {}) => api.get("/api/students/search", { params }),
  update: (id, payload) => api.put(`/api/students/${id}`, payload),
  assignSkills: (id, skillsIds) =>
    api.put(`/api/students/${id}/skills`, { skillsIds }),
};
export const teamApi = {
  list: (params = {}) => api.get("/api/teams", { params }),
  get: (id) => api.get(`/api/teams/${id}`),
  create: (payload) => api.post("/api/teams", payload),
  update: (id, payload) => api.put(`/api/teams/${id}`, payload),
  updateStatus: (id, status) =>
    api.patch(`/api/teams/${id}/status`, null, { params: { status } }),
  updateJoiningMode: (id, joiningMode) =>
    api.patch(`/api/teams/${id}/joining-mode`, null, {
      params: { "joining-mode": joiningMode },
    }),
  updateCapacity: (id, maxMembersCount) =>
    api.patch(`/api/teams/${id}/capacity`, null, {
      params: { maxMembersCount },
    }),
  remove: (id) => api.delete(`/api/teams/${id}`),
  members: (id) => api.get(`/api/teams/${id}/members`),
  join: (id) => api.post(`/api/teams/${id}/members`),
  leave: (id) => api.delete(`/api/teams/${id}/members/me`),
  removeMember: (teamId, studentId) =>
    api.delete(
      `/api/teams/${teamId}/members/${encodeURIComponent(studentId)}`,
    ),
};
export const matchmakingApi = {
  bestCandidate: (teamId, params = {}) =>
    api.get(`/api/matchmaking/teams/${teamId}/best-candidate`, { params }),
  autoAssign: (teamId, payload) =>
    api.post(`/api/matchmaking/teams/${teamId}/auto-assign`, payload),
};
export const queueApi = {
  mine: () => api.get("/api/matchmaking/requests/mine"),
  submit: (payload) => api.post("/api/matchmaking/requests", payload),
  cancel: (id) => api.delete(`/api/matchmaking/requests/${id}`),
};

export function unwrapList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.students)) return data.students;
  if (Array.isArray(data?.teams)) return data.teams;
  if (Array.isArray(data?.members)) return data.members;
  if (Array.isArray(data?.requests)) return data.requests;
  return [];
}
