import { useQuery } from '@tanstack/react-query';
import { getSession } from '../api/auth';
import type { AuthResponse } from '../api/auth';
import axios from 'axios';

// Extract the user type from the AuthResponse and extend it
export type User = AuthResponse['user'] & {
  name?: string;
};

export function useUser() {
  return useQuery<User | null, Error>({
    queryKey: ['user'],
    queryFn: async ({ signal }) => {
      try {
        const data = await getSession(signal);
        return data.user || null;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          return null;
        }
        throw error;
      }
    },
    retry: (failureCount, error) => {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        return false;
      }
      return failureCount < 1;
    },
  });
}

/**
 * Helper to safely extract a greeting name from the user object
 */
export function getGreetingName(user: User | null | undefined): string {
  if (!user) return 'User';
  
  // 1. Prefer explicit firstName
  if (user.firstName) return user.firstName;
  
  // 2. Fallback to name split
  if (user.name) {
    return user.name.trim().split(' ')[0] || 'User';
  }
  
  return 'User';
}
