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

  // Prefer firstName, fallback to name
  const nameToSplit = user.firstName || user.name;

  if (nameToSplit) {
    return nameToSplit.trim().split(/\s+/)[0] || 'User';
  }

  return 'User';
}
