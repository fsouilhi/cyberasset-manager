import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 403) {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const res = await axios.post(
            `${api.defaults.baseURL}/auth/refresh`,
            { refreshToken }
          );
          localStorage.setItem('accessToken', res.data.accessToken);
          err.config.headers.Authorization = `Bearer ${res.data.accessToken}`;
          return api.request(err.config);
        } catch {
          localStorage.clear();
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(err);
  }
);

export default api;

export const authService = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
};

export const assetService = {
  getAll: (params) => api.get('/assets', { params }),
  create: (data) => api.post('/assets', data),
  update: (id, data) => api.put(`/assets/${id}`, data),
  delete: (id) => api.delete(`/assets/${id}`),
};

export const ebiosService = {
  getProjects: () => api.get('/ebios/projects'),
  createProject: (data) => api.post('/ebios/projects', data),
  getBusinessValues: (pId) => api.get(`/ebios/projects/${pId}/business-values`),
  createBusinessValue: (pId, data) => api.post(`/ebios/projects/${pId}/business-values`, data),
  getFearedEvents: (pId) => api.get(`/ebios/projects/${pId}/feared-events`),
  createFearedEvent: (pId, data) => api.post(`/ebios/projects/${pId}/feared-events`, data),
  getRiskSources: (pId) => api.get(`/ebios/projects/${pId}/risk-sources`),
  createRiskSource: (pId, data) => api.post(`/ebios/projects/${pId}/risk-sources`, data),
  getStrategicScenarios: (pId) => api.get(`/ebios/projects/${pId}/scenarios/strategic`),
  createStrategicScenario: (pId, data) => api.post(`/ebios/projects/${pId}/scenarios/strategic`, data),
  getOperationalScenarios: (pId) => api.get(`/ebios/projects/${pId}/scenarios/operational`),
  createOperationalScenario: (pId, data) => api.post(`/ebios/projects/${pId}/scenarios/operational`, data),
  getMeasures: (pId) => api.get(`/ebios/projects/${pId}/measures`),
  createMeasure: (pId, data) => api.post(`/ebios/projects/${pId}/measures`, data),
  getReport: (pId) => api.get(`/ebios/projects/${pId}/report`),
};