/**
 * Centralized auth module for the mobile app.
 *
 * This is the SINGLE place that talks to the Better Auth client and the
 * React Query cache for session/profile data. Components and hooks should
 * import from here instead of reaching into `auth-client.ts` directly.
 *
 * 401 vs 403 contract (kept in sync with apps/web/src/lib/api.ts and
 * apps/web/src/proxy.ts, enforced by apps/mobile/src/api/config.ts):
 *   401 = session is gone. Sign out, clear cached profile queries, redirect
 *         to "/".
 *   403 = session is still valid, but the role doesn't match the resource.
 *         Re-route to the user's role-specific dashboard, keep the session.
 *
 * React Query keys owned by this module:
 *   ['auth', 'session']            — the canonical session
 *   ['user']                       — convenience alias for the session user
 *   ['employer-profile']           — profile data (set by useGetEmployerProfile)
 *   ['candidate-profile']          — profile data (set by useGetCandidateProfile)
 *
 * `invalidateSession()` clears all four and also calls Better Auth's
 * `signOut()` on the server. `clearLocalSession()` only clears the local
 * cache — used when we know the server session is already gone.
 */
import type { QueryClient } from '@tanstack/react-query';
import { authClient } from './auth-client';
import { queryClient } from './query-client';
import type {
  Role,
  SessionPayload,
  SessionRecord,
  SessionUser,
} from '@/types/auth';
import { USER_ROLE } from '@/app/constants/role';

export const AUTH_QUERY_KEYS = {
  session: ['auth', 'session'] as const,
  user: ['user'] as const,
  employerProfile: ['employer-profile'] as const,
  candidateProfile: ['candidate-profile'] as const,
} as const;

export const AUTH_COOKIE_KEY = 'better-auth.session_token';

function getQueryClient(): QueryClient {
  return queryClient;
}

function asSessionUser(value: unknown): SessionUser | null {
  if (!value || typeof value !== 'object') {
    return null;
  }
  const record = value as Record<string, unknown>;
  if (typeof record.id !== 'string' || typeof record.email !== 'string') {
    return null;
  }
  const role =
    typeof record.role === 'string' &&
    (record.role === USER_ROLE.CANDIDATE ||
      record.role === USER_ROLE.EMPLOYER ||
      record.role === USER_ROLE.ADMIN)
      ? (record.role as Role)
      : undefined;
  return { ...record, id: record.id, email: record.email, role } as SessionUser;
}

function asSessionRecord(value: unknown): SessionRecord | null {
  if (!value || typeof value !== 'object') {
    return null;
  }
  const record = value as Record<string, unknown>;
  if (typeof record.id !== 'string' || typeof record.userId !== 'string') {
    return null;
  }
  return record as unknown as SessionRecord;
}

export async function getSession(): Promise<SessionPayload | null> {
  try {
    const { data } = await authClient.getSession();
    if (!data) {
      return null;
    }
    const user = asSessionUser(data.user);
    const session = asSessionRecord(data.session);
    if (!user || !session) {
      return null;
    }
    return { user, session };
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const session = await getSession();
  return session?.user ?? null;
}

export function getCurrentRole(user: SessionUser | null | undefined): Role | null {
  return user?.role ?? null;
}

export function isCandidate(user: SessionUser | null | undefined): boolean {
  return getCurrentRole(user) === USER_ROLE.CANDIDATE;
}

export function isEmployer(user: SessionUser | null | undefined): boolean {
  return getCurrentRole(user) === USER_ROLE.EMPLOYER;
}

export function isAdmin(user: SessionUser | null | undefined): boolean {
  return getCurrentRole(user) === USER_ROLE.ADMIN;
}

export function getSessionCookie(): string {
  const client = authClient as unknown as {
    getCookie?: () => string;
  };
  return client.getCookie?.() ?? '';
}

export function isAuthErrorStatus(status: number | undefined): boolean {
  return status === 401;
}

export function isForbiddenStatus(status: number | undefined): boolean {
  return status === 403;
}

export async function invalidateSession(): Promise<void> {
  const client = getQueryClient();
  client.removeQueries({ queryKey: AUTH_QUERY_KEYS.session });
  client.removeQueries({ queryKey: AUTH_QUERY_KEYS.user });
  client.removeQueries({ queryKey: AUTH_QUERY_KEYS.employerProfile });
  client.removeQueries({ queryKey: AUTH_QUERY_KEYS.candidateProfile });
  client.setQueryData(AUTH_QUERY_KEYS.session, null);
  client.setQueryData(AUTH_QUERY_KEYS.user, null);
  try {
    await authClient.signOut();
  } catch {
    /* signOut is best-effort; local state is already cleared */
  }
}

export async function clearLocalSession(): Promise<void> {
  const client = getQueryClient();
  client.removeQueries({ queryKey: AUTH_QUERY_KEYS.session });
  client.removeQueries({ queryKey: AUTH_QUERY_KEYS.user });
  client.removeQueries({ queryKey: AUTH_QUERY_KEYS.employerProfile });
  client.removeQueries({ queryKey: AUTH_QUERY_KEYS.candidateProfile });
  client.setQueryData(AUTH_QUERY_KEYS.session, null);
  client.setQueryData(AUTH_QUERY_KEYS.user, null);
}

export const authModule = {
  getSession,
  getCurrentUser,
  getCurrentRole,
  isCandidate,
  isEmployer,
  isAdmin,
  getSessionCookie,
  isAuthErrorStatus,
  isForbiddenStatus,
  invalidateSession,
  clearLocalSession,
  queryKeys: AUTH_QUERY_KEYS,
};

export default authModule;
