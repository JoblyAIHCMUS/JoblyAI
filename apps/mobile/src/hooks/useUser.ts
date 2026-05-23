import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/config';
import axios from 'axios';

export type User = {
  id: string;
  email: string;
  emailVerified: boolean;
  name?: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  role?: 'candidate' | 'employer' | 'admin';
};

export function useUser() {
  return useQuery<User | null, Error>({
    queryKey: ['user'],
    queryFn: async ({ signal }) => {
      try {
        const response = await apiClient.get<User>('/user/me', { signal });
        return response.data;
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
  if (!user) return 'user';

  // Prefer firstName, then name, then email username.
  const nameToSplit =
    user.firstName || user.name || user.email?.split('@')[0] || '';

  if (nameToSplit) {
    return nameToSplit.trim().split(/\s+/)[0] || 'there';
  }

  return 'user';
}
