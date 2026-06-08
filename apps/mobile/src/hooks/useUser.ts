import { authClient } from '../lib/auth-client';

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
  const session = authClient.useSession();

  return {
    ...session,
    data: session.data?.user as User | null | undefined,
    session: session.data ?? null,
  };
}

/**
 * Helper to safely extract a greeting name from the user object.
 * Uses firstName first, then name, then email prefix.
 */
export function getGreetingName(user: User | null | undefined): string {
  if (!user) return '';

  // Prefer firstName, then name, then email username.
  const nameToSplit =
    user.firstName || user.name || user.email?.split('@')[0] || '';

  if (nameToSplit) {
    return nameToSplit.trim().split(/\s+/)[0] || '';
  }

  return '';
}

/**
 * Helper to get full display name from user object.
 */
export function getFullName(user: User | null | undefined): string {
  if (!user) return '';

  // Try full name first
  if (user.name?.trim()) return user.name.trim();

  // Try firstName + lastName
  const fullName = [user.firstName, user.lastName]
    .filter(Boolean)
    .join(' ')
    .trim();
  if (fullName) return fullName;

  // Try firstName only
  if (user.firstName?.trim()) return user.firstName.trim();

  // Fallback to email prefix
  return user.email?.split('@')[0] || '';
}
