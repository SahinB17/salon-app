import axios from 'axios';

const api = axios.create({
  baseURL: `http://${window.location.hostname}${window.location.port === '5173' ? ':8000' : ''}`,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token is invalid or expired
      localStorage.removeItem('token');
      window.dispatchEvent(new Event('open-login-modal'));
      if (window.location.pathname.startsWith('/profile') || window.location.pathname.startsWith('/appointments') || window.location.pathname.startsWith('/favorites')) {
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
