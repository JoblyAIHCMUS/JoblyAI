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
