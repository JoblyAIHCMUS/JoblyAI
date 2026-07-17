import * as SecureStore from 'expo-secure-store';
import { createAuthClient } from 'better-auth/react';
import { expoClient } from '@better-auth/expo/client';
import { API_BASE_URL } from './api-base';

export const authClient = createAuthClient({
  baseURL: `${API_BASE_URL}/auth`,
  plugins: [
    expoClient({
      scheme: 'jobly',
      storagePrefix: 'jobly',
      storage: SecureStore,
    }),
  ],
});
