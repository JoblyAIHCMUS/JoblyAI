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
  [key: string]: unknown;
}

// Helper to safely identify Authentication Errors
function isAuthError(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) return false;

  const err = error as Record<string, unknown>;
  
  // Check for HTTP 401 in standard Axios/Fetch response shapes
  const status = (err.response as Record<string, unknown>)?.status;
  if (status === 401) return true;

  // Check for custom error codes
  if (err.code === 'UNAUTHENTICATED') return true;

  // Check error message content
  if (typeof err.message === 'string' && err.message.toLowerCase().includes('not authenticated')) {
    return true;
  }

  return false;
}

export function useUser(): UseQueryResult<User | null, Error> {
  return useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      try {
        const session = await authClient.getSession();
        return (session?.data?.user as User) || null;
      } catch (error: unknown) {
        // Treat 401/Auth errors as "Guest User"
        if (isAuthError(error)) {
          return null;
        }
        
        // Let actual network/server errors bubble up to React Query
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, 
    gcTime: 10 * 60 * 1000, 
    refetchOnWindowFocus: true, 
    refetchOnMount: true, 
    retry: (failureCount, error) => {
      // Don't retry if it's a 401 (waste of bandwidth)
      if (isAuthError(error)) return false;
      return failureCount < 1;
    },
  });
}
