import axios from 'axios';

const API_BASE =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? 'https://vms-server-639r.onrender.com/api' : 'http://localhost:5000/api');

const api = axios.create({
  baseURL: API_BASE,
});

const healthUrl = `${API_BASE.replace(/\/$/, '')}/health`;

let lastHealthCheck = 0;
let retryTimer = null;

const ping = () =>
  axios
    .get(healthUrl, { timeout: 60000, headers: { 'Cache-Control': 'no-store' } })
    .catch(() => {});

export const triggerHealthCheck = (force = false) => {
  const now = Date.now();
  if (!force && now - lastHealthCheck < 20000) return;
  lastHealthCheck = now;
  ping();
  if (retryTimer) clearTimeout(retryTimer);
  retryTimer = setTimeout(() => ping(), 4000);
};

if (typeof window !== 'undefined') {
  triggerHealthCheck(true);

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) triggerHealthCheck();
  });

  window.addEventListener('focus', () => triggerHealthCheck());

  window.addEventListener('focusin', (e) => {
    const tag = e.target?.tagName;
    if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') {
      triggerHealthCheck();
    }
  });
}

api.interceptors.request.use(
  (config) => {
    triggerHealthCheck();
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

export default api;
