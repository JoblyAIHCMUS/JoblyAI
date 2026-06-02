import axios from 'axios';
import { authClient } from '../lib/auth-client';
import { API_BASE_URL } from '../lib/api-base';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Needed for cookie-based auth
});

apiClient.interceptors.request.use(async (config) => {
  const cookies = authClient.getCookie();

  if (cookies) {
    config.headers = config.headers ?? {};

    if (typeof config.headers.set === 'function') {
      config.headers.set('Cookie', cookies);
    } else {
      config.headers.Cookie = cookies;
    }
  }

  return config;
});
