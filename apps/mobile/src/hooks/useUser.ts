import { useAuth } from './useAuth';
import type { SessionUser } from '@/types/auth';

export type User = SessionUser;

/**
 * @deprecated Use `useAuth().user` from `./useAuth` instead. This hook is a
 * thin shim kept for backward compatibility while the rest of the app
 * migrates.
 */
export function useUser() {
  const { user, session, isPending, isAuthenticated, refetch } = useAuth();
  return {
    data: user,
    session,
    isPending,
    isAuthenticated,
    refetch,
  };
}

export function getGreetingName(user: User | null | undefined): string {
  if (!user) {
    return '';
  }
  const nameToSplit =
    user.firstName || user.name || user.email?.split('@')[0] || '';
  if (nameToSplit) {
    return nameToSplit.trim().split(/\s+/)[0] || '';
  }
  return '';
}

export function getFullName(user: User | null | undefined): string {
  if (!user) {
    return '';
  }
  if (user.name?.trim()) {
    return user.name.trim();
  }
  const fullName = [user.firstName, user.lastName]
    .filter(Boolean)
    .join(' ')
    .trim();
  if (fullName) {
    return fullName;
  }
  if (user.firstName?.trim()) {
    return user.firstName.trim();
  }
  return user.email?.split('@')[0] || '';
}
