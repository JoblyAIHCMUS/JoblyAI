import axios from 'axios';
import { Platform } from 'react-native';

// Handle Expo environment variables and Android emulator networking
const baseUrl = Platform.OS === 'android' 
  ? process.env.EXPO_PUBLIC_API_URL?.replace('localhost', '10.0.2.2') || 'http://10.0.2.2:3000/api'
  : process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

export const API_BASE_URL = baseUrl;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Needed for cookie-based auth
});
