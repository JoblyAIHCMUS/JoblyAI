'use client';

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { authClient } from '../lib/auth-client';

export interface User {
  id: string;
  email: string;
  emailVerified: boolean;
  name: string;
  image?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
  [key: string]: any;
}

export function useUser(): UseQueryResult<User | null, Error> {
  return useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      try {
        const session = await authClient.getSession();
        return (session?.data?.user as User) || null;
      } catch (error) {
        // If session fetch fails, user is not authenticated
        return null;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    refetchOnWindowFocus: true, // Refetch when user returns to tab
    refetchOnMount: true, // Refetch on mount if stale
    retry: 1, // Retry once on failure
  });
}
