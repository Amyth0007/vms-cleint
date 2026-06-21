import axios from 'axios';

const api = axios.create({
  baseURL: 'https://vms-server-639r.onrender.com/api',
  // baseURL: 'http://localhost:5000/api',
});

// Warm up the server (Render free tier spin-up helper)
let lastHealthCheck = 0;
export const triggerHealthCheck = () => {
  const now = Date.now();
  if (now - lastHealthCheck > 45000) { // 45s throttle to prevent spamming
    lastHealthCheck = now;
    axios.get(`${api.defaults.baseURL}/health`).catch(() => {});
  }
};

// Global listener: trigger warm up when user starts interacting with any form input
if (typeof window !== 'undefined') {
  window.addEventListener('focusin', (e) => {
    if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA')) {
      triggerHealthCheck();
    }
  });
}

// Add a request interceptor to attach the JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If we receive a 401 Unauthorized, we could clear local storage and redirect to login
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Optionally emit an event or force reload
    }
    return Promise.reject(error);
  }
);

export default api;
