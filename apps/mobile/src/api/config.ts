import axios from 'axios';
import { Platform } from 'react-native';

// Handle Expo environment variables and Android emulator networking
const baseUrl =
  Platform.OS === 'android'
    ? process.env.EXPO_PUBLIC_API_URL?.replace('localhost', '10.0.2.2') ||
      'http://10.0.2.2:3000/api'
    : process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

export const API_BASE_URL = baseUrl;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Needed for cookie-based auth
});

// --- Refresh-token machinery for mobile ---
// On 401, attempt a silent refresh at `/auth/refresh` and retry the original request.
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (error: unknown) => void;
  config: any;
}> = [];

const processQueue = (error: any, tokenAvailable = false) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(tokenAvailable);
    }
  });
  failedQueue = [];
};

// Create a lightweight client without this interceptor to call refresh endpoint
const refreshClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.response.use(
  (r) => r,
  async (error) => {
    const originalRequest = error.config;

    if (!originalRequest || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401) {
      // Avoid refreshing the refresh request itself
      if (originalRequest.url?.includes('/auth/refresh')) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // queue the request until refresh completes
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject, config: originalRequest });
        })
          .then(() => apiClient(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await refreshClient.post('/auth/refresh');
        isRefreshing = false;
        processQueue(null, true);
        // retry original request
        return apiClient(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        processQueue(refreshError, false);
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
