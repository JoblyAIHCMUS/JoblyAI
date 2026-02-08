'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api';
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
      const response = await apiClient.post<User>('/auth/sign-in/email', {
        email: credentials.email,
        password: credentials.password,
      });
      return response.data;
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
      const response = await apiClient.post<User>('/auth/sign-up', {
        email: credentials.email,
        password: credentials.password,
        name: credentials.name,
      });
      return response.data;
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
      await apiClient.post('/auth/sign-out');
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
