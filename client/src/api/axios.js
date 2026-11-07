import axios from 'axios';
import { authStorage } from './authStorage';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 60000, // Render free tier can take ~50s to wake up
});

api.interceptors.request.use((config) => {
  const token = authStorage.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    // Expired/invalid session: clear it and send the user to the login page.
    const isAuthCall = err.config?.url?.startsWith('/auth/login') || err.config?.url?.startsWith('/auth/register');
    if (err.response?.status === 401 && !isAuthCall && authStorage.getToken()) {
      authStorage.clear();
      window.location.assign('/login?expired=1');
    }
    if (!err.response) {
      err.response = {
        data: { message: 'Cannot reach the server. It may be waking up — please try again in a few seconds.' },
      };
    }
    return Promise.reject(err);
  }
);

export const errorMessage = (err, fallback = 'Something went wrong') =>
  err?.response?.data?.message || fallback;

export default api;
