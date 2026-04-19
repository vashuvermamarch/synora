import axios from 'axios';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// JWT interceptor — attach access token to every request
api.interceptors.request.use((config) => {
  const tokens = localStorage.getItem('synora_tokens');
  if (tokens) {
    const { access } = JSON.parse(tokens);
    config.headers.Authorization = `Bearer ${access}`;
  }
  return config;
});

// Response interceptor — auto-refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const tokens = localStorage.getItem('synora_tokens');
        if (tokens) {
          const { refresh } = JSON.parse(tokens);
          const res = await axios.post(`${API_BASE}/auth/token/refresh/`, { refresh });
          const newTokens = { access: res.data.access, refresh: res.data.refresh || refresh };
          localStorage.setItem('synora_tokens', JSON.stringify(newTokens));
          originalRequest.headers.Authorization = `Bearer ${newTokens.access}`;
          return api(originalRequest);
        }
      } catch {
        localStorage.removeItem('synora_tokens');
        localStorage.removeItem('synora_user');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;
