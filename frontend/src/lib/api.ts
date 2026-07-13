import axios from 'axios';

const api = axios.create({
  baseURL: `${window.location.protocol}//${window.location.hostname}${window.location.port === '5173' ? ':8000' : ''}`,
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
      const currentToken = localStorage.getItem('token');
      const requestAuthHeader = error.config?.headers?.Authorization;
      const requestToken = requestAuthHeader ? requestAuthHeader.replace('Bearer ', '') : null;

      // Only log out if the request was made with the current token
      // This prevents old pre-login requests from logging the user out due to a race condition
      if (!currentToken || currentToken === requestToken) {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        window.dispatchEvent(new Event('open-login-modal'));
        if (window.location.pathname.startsWith('/profile') || window.location.pathname.startsWith('/appointments') || window.location.pathname.startsWith('/favorites') || window.location.pathname.startsWith('/admin')) {
          window.location.href = '/';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
