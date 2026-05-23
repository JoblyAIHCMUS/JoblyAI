import type { AuthResponse } from '../api/auth';

export type AuthUser = AuthResponse['user'] | null | undefined;

export const getPostAuthRoute = (user: AuthUser): string => {
  if (user?.role === 'employer') {
    return '/pages/employer/dashboard';
  }

  if (user?.role === 'candidate') {
    return '/pages/candidate/dashboard';
  }

  return '/';
};
