import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const API_PATH = '/api';

export const apiClient: AxiosInstance = axios.create({
  baseURL: `${API_BASE_URL}${API_PATH}`,
  withCredentials: true, // Enable cookies for cross-origin requests
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor to handle 401 errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Clear user data and redirect to login
      // This will be triggered via React Query cache invalidation
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// // Optional: CSRF token interceptor (if your backend requires it)
// apiClient.interceptors.request.use((config) => {
//   // You can add CSRF token extraction here if needed
//   // const csrfToken = document.cookie.split('; ').find(row => row.startsWith('csrf='))?.split('=')[1];
//   // if (csrfToken) {
//   //   config.headers['X-CSRF-Token'] = csrfToken;
//   // }
//   return config;
// });

export default apiClient;
