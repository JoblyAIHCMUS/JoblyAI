import type { UserRole } from '@/app/constants/role';

export type Role = UserRole;

export type SessionUser = {
  id: string;
  email: string;
  emailVerified: boolean;
  name?: string;
  firstName?: string;
  lastName?: string;
  image?: string | null;
  avatarUrl?: string | null;
  role?: Role;
  [key: string]: unknown;
};

export type SessionRecord = {
  id: string;
  userId: string;
  expiresAt: string | Date;
  token?: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
};

export type SessionPayload = {
  user: SessionUser;
  session: SessionRecord;
};

export type AuthErrorKind =
  | 'network'
  | 'invalid_credentials'
  | 'unauthorized'
  | 'rate_limited'
  | 'unknown';

export type AuthError = {
  kind: AuthErrorKind;
  message: string;
  status?: number;
  cause?: unknown;
};

export function isSessionPayload(value: unknown): value is SessionPayload {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const candidate = value as { user?: unknown; session?: unknown };
  return Boolean(candidate.user) && Boolean(candidate.session);
}
