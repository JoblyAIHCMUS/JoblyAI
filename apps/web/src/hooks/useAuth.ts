'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
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

  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await authClient.signIn.email(
        {
          email: credentials.email,
          password: credentials.password,
        },
        {
          onSuccess: () => {
            // Invalidate user query to refetch updated user data
            queryClient.invalidateQueries({ queryKey: ['user'] });
          },
          onError: (error) => {
            // Log the error; actual rejection is handled via response.error below
            console.error('Login failed', error);
          },
        }
      );
      
      if (response.error) {
        throw new Error(response.error?.message || 'Login failed');
      }
      
      return response.data?.user as User;
    },
    onSuccess: () => {
      // Invalidate user query to refetch updated user data
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
}

export function useSignup() {
  const queryClient = useQueryClient();

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
      
      return response.data?.user as User;
    },
    onSuccess: () => {
      // Invalidate user query to refetch updated user data
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await authClient.signOut();
    },
    onSuccess: () => {
      // Clear user cache
      queryClient.setQueryData(['user'], null);
      // Remove all queries
      queryClient.clear();
      // Redirect to login
      window.location.href = '/login';
    },
  });
}
