// src/utils/api.js
import axios from 'axios';
import BACKEND_URL from '../../Config';

const api = axios.create({
  baseURL: BACKEND_URL,
  // timeout: 10000, // optional
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Server says token invalid/expired -> broadcast logout
      window.dispatchEvent(new Event('logout'));
    }
    return Promise.reject(error);
  }
);

export default api;
