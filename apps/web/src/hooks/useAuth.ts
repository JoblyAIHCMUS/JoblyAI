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
}

export function useLogin() {
  const queryClient = useQueryClient();
  const router = useRouter();

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

      // Optional: Redirect immediately
      router.push('/dashboard');
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
      await authClient.signOut();
    },
    onSuccess: () => {
      // 1. Update cache immediately to reflect logged out state
      queryClient.setQueryData(['user'], null);

      // 2. Remove queries that shouldn't exist without a user
      // (Optional: safer than .clear() if you have public data)
      // queryClient.removeQueries({ queryKey: ['dashboard'] });

      // 3. Smooth client-side redirect
      router.push('/login');
    },
  });
}
