'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authClient } from '../lib/auth-client';
import type { User } from './useUser';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials extends LoginCredentials {
  name?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
}

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await authClient.signIn.email({
        email: credentials.email,
        password: credentials.password,
      });

      // 1. Check for explicit API errors
      if (response.error) {
        throw new Error(response.error.message || 'Login failed');
      }

      // 2. RUNTIME GUARD: Check if data or user is missing
      if (!response.data || !response.data.user) {
        throw new Error('Login successful but no user data returned');
      }

      // 3. Safe to return (Typescript now knows this is not undefined)
      return response.data.user as User;
    },
    onSuccess: (user) => {
      // OPTIMIZATION: Manually update the cache.
      // We already have the user data, so we don't need to fetch it again.
      queryClient.setQueryData(['user'], user);

      // Component is responsible for routing
    },
  });
}

export function useSignup() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (credentials: SignupCredentials) => {
      const response = await authClient.signUp.email({
        email: credentials.email,
        password: credentials.password,
        name: credentials.name || '',
        ...(credentials.firstName && { firstName: credentials.firstName }),
        ...(credentials.lastName && { lastName: credentials.lastName }),
        ...(credentials.role && { role: credentials.role }),
      });

      if (response.error) {
        throw new Error(response.error?.message || 'Signup failed');
      }

      // RUNTIME GUARD
      if (!response.data || !response.data.user) {
        throw new Error('Signup successful but no user data returned');
      }

      return response.data.user as User;
    },
    onSuccess: (user) => {
      // OPTIMIZATION: Manually set cache
      queryClient.setQueryData(['user'], user);
      router.push('/dashboard');
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async () => {
      
      try {
        const response = await authClient.signOut();
        
        // Check for errors
        if (response?.error) {
          throw new Error(response.error.message || 'Logout failed');
        }
      } catch (error) {
        // Provide detailed error diagnostics
        if (error instanceof TypeError && error.message === 'Failed to fetch') {
          const detailedError = new Error(
            `Network Error: Cannot reach backend ` +
            'Please ensure the backend server is running and accessible.'
          );
          (detailedError as any).isNetworkError = true;
          throw detailedError;
        }
        throw error;
      }
    },
    onSuccess: () => {
      // Clear user-specific cached data
      queryClient.removeQueries({ queryKey: ['user'] });

      // Redirect to login (middleware + backend will clear cookies)
      router.push('/login');
    },
    onError: (error) => {
      const isNetworkError = (error as any)?.isNetworkError === true;
      const isAuthError =
        (error instanceof Error && error.message.includes('401')) ||
        (error instanceof Error && error.message.includes('Unauthorized')) ||
        (error instanceof Error && error.message.includes('not authenticated'));

      if (isNetworkError) {
        // Network error - log for debugging, keep user in app
        console.error('❌ LOGOUT NETWORK ERROR:', error.message);
        throw error; // UI can show error toast
      } else if (isAuthError) {
        // User is already logged out on backend, clear frontend state
        console.log('✅ User logged out (auth error detected)');
        queryClient.removeQueries({ queryKey: ['user'] });
        router.push('/login');
      } else {
        // Unknown error
        console.error('❌ Logout failed:', error);
        throw error; // Re-throw so UI can show error message
      }
    },
    retry: 1, // Retry once on failure
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
