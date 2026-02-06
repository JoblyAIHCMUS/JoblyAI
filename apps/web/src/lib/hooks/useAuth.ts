'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api';
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
    mutationFn: async (_credentials: LoginCredentials) => {
      // Redirect to backend auth endpoint for Logto OIDC flow
      // The backend will handle redirecting to Logto
      const baseUrl = apiClient.defaults.baseURL || 'http://localhost:3000';
      window.location.href = `${baseUrl}/auth/login`;
      // Return a placeholder - the redirect will take over
      return {} as User;
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
    mutationFn: async (_credentials: SignupCredentials) => {
      // Redirect to backend auth endpoint for Logto OIDC flow
      // The backend will handle redirecting to Logto
      const baseUrl = apiClient.defaults.baseURL || 'http://localhost:3000';
      window.location.href = `${baseUrl}/auth/register`;
      // Return a placeholder - the redirect will take over
      return {} as User;
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
      // Redirect to backend logout endpoint for Logto logout flow
      const baseUrl = apiClient.defaults.baseURL || 'http://localhost:3000';
      window.location.href = `${baseUrl}/auth/logout`;
    },
    onSuccess: () => {
      // Clear user cache
      queryClient.setQueryData(['user'], null);
      // Remove all queries
      queryClient.clear();
    },
  });
}
