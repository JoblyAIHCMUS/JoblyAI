import axios from 'axios';
import { router } from 'expo-router';
import { authClient } from '../lib/auth-client';
import { API_BASE_URL } from '../lib/api-base';
import { queryClient } from '../lib/query-client';

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

// On any 401 from a non-auth endpoint, the session is no longer valid.
// Clear local state and redirect to login so the app stops firing requests.
let handling401 = false;

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      !handling401 &&
      !error.config?.url?.includes('/auth/')
    ) {
      handling401 = true;
      try {
        // Best-effort sign out. May itself 401; that's fine.
        try {
          await authClient.signOut();
        } catch {
          /* ignore */
        }
        // Clear cached auth/profile queries so the app re-evaluates as logged out.
        queryClient.removeQueries({ queryKey: ['user'] });
        queryClient.removeQueries({ queryKey: ['employer-profile'] });
        queryClient.removeQueries({ queryKey: ['candidate-profile'] });
        // Send the user to the root, which the SessionResumeGate will
        // route to /pages/login if no session is present.
        router.dismissTo('/');
      } finally {
        // Reset the flag after a short delay so a real 401 after redirect
        // (e.g. on a fresh login attempt) can still be handled.
        setTimeout(() => {
          handling401 = false;
        }, 2000);
      }
    }
    return Promise.reject(error);
  }
);
