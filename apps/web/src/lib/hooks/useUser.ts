'use client';

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { apiClient } from '../api';

export interface User {
  id: string;
  email?: string;
  name?: string;
  avatar?: string;
  [key: string]: string | undefined;
}

export function useUser(): UseQueryResult<User | null, Error> {
  return useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      try {
        const { data } = await apiClient.get<User>('/api/auth/me');
        return data;
      } catch (error: unknown) {
        // Handle 401 as "not authenticated" (not an error)
        if (
          error instanceof Error &&
          'response' in error &&
          (error as AxiosError).response?.status === 401
        ) {
          return null;
        }
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    refetchOnWindowFocus: true, // Refetch when user returns to tab
    refetchOnMount: true, // Refetch on mount if stale
    retry: 1, // Retry once on failure
  });
}
