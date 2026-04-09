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
      const response = await authClient.signOut();
      
      // Check for errors
      if (response?.error) {
        throw new Error(response.error.message || 'Logout failed');
      }
    },
    onSuccess: () => {
      // Clear user-specific cached data
      queryClient.removeQueries({ queryKey: ['user'] });

      // Redirect to login (middleware + backend will clear cookies)
      router.push('/login');
    },
    onError: (error) => {
      console.error('Logout error:', error);
      
      // CRITICAL: Only clear cache and redirect if it's an auth error (401)
      // Network/server errors should NOT trigger logout state on frontend
      const isAuthError =
        (error instanceof Error && error.message.includes('401')) ||
        (error instanceof Error && error.message.includes('Unauthorized')) ||
        (error instanceof Error && error.message.includes('not authenticated'));

      if (isAuthError) {
        // User is already logged out on backend, clear frontend state
        queryClient.removeQueries({ queryKey: ['user'] });
        router.push('/login');
      } else {
        // Network/server error - keep user in app and show error
        // User should retry or manually navigate
        console.error('Logout failed due to network error - user session may still be active');
        throw error; // Re-throw so UI can show error message
      }
    },
  });
}
