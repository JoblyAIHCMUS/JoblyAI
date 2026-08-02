import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { authClient } from '../lib/auth-client';
import {
  clearLocalSession,
  getSession,
  invalidateSession,
  AUTH_QUERY_KEYS,
} from '../lib/auth';
import { USER_ROLE, type UserRole } from '@/app/constants/role';
import { getDashboardPath } from '@/utils/auth-route';
import { queryClient } from '../lib/query-client';
import type { SessionPayload, SessionUser } from '@/types/auth';
import {
  signup as signupRequest,
  sendOTP as sendOTPRequest,
  resetPassword as resetPasswordRequest,
  changePassword as changePasswordRequest,
  type LoginPayload,
  type SignupPayload,
  type ChangePasswordPayload,
  type SendOTPPayload,
  type ResetPasswordPayload,
  type AuthResponse,
} from '../api/auth';

function readErrorMessageFromData(data: unknown): string | null {
  if (!data) {
    return null;
  }
  if (typeof data === 'string') {
    return data.trim() || null;
  }
  if (typeof data !== 'object') {
    return null;
  }
  const record = data as Record<string, unknown>;
  const directMessage = record.message || record.error || record.detail;
  if (typeof directMessage === 'string' && directMessage.trim()) {
    return directMessage;
  }
  if (Array.isArray(record.message)) {
    const message = record.message
      .filter((item): item is string => typeof item === 'string')
      .join('\n')
      .trim();
    if (message) {
      return message;
    }
  }
  if (record.error && typeof record.error === 'object') {
    return readErrorMessageFromData(record.error);
  }
  if (record.errors && typeof record.errors === 'object') {
    return readErrorMessageFromData(record.errors);
  }
  return null;
}

function getAuthErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const responseMessage = readErrorMessageFromData(error.response?.data);
    if (responseMessage) {
      return responseMessage;
    }
    if (error.response?.status) {
      return `${fallback} (HTTP ${error.response.status})`;
    }
  }
  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === 'string' && message.trim()) {
      return message;
    }
  }
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  return fallback;
}

export function useAuth() {
  const { data: session, isPending, error, refetch } = authClient.useSession();

  const user = useMemo<SessionUser | null>(() => {
    const raw = session?.user;
    if (!raw) {
      return null;
    }
    return raw as unknown as SessionUser;
  }, [session]);

  const sessionPayload = useMemo<SessionPayload | null>(() => {
    if (!session) {
      return null;
    }
    return session as unknown as SessionPayload;
  }, [session]);

  const role = (user?.role as UserRole | undefined) ?? null;
  const isAuthenticated = Boolean(session && user);
  const isCandidate = role === USER_ROLE.CANDIDATE;
  const isEmployer = role === USER_ROLE.EMPLOYER;
  const isAdmin = role === USER_ROLE.ADMIN;

  return {
    user,
    session: sessionPayload,
    role,
    isAuthenticated,
    isPending,
    isCandidate,
    isEmployer,
    isAdmin,
    error,
    refetch: refetch as unknown as () => Promise<void>,
  };
}

export type UseAuthResult = ReturnType<typeof useAuth>;

export function useLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<AuthResponse | null>(null);

  const login = useCallback(async (payload: LoginPayload) => {
    setLoading(true);
    setError(null);
    try {
      const { data: result, error: signInError } =
        await authClient.signIn.email({
          email: payload.email,
          password: payload.password,
          rememberMe: payload.rememberMe,
        });
      if (signInError) {
        throw signInError;
      }
      if (!result) {
        throw new Error('Login successful but no user data returned');
      }
      // signIn.email doesn't return the session; Better Auth has already
      // stored it in SecureStore on the device, so read it back from there.
      const session = await getSession();
      if (!session) {
        throw new Error('Session was not created');
      }
      const authResponse: AuthResponse = {
        user: {
          id: session.user.id,
          email: session.user.email,
          emailVerified: session.user.emailVerified,
          role: (session.user.role ?? 'candidate') as 'candidate' | 'employer',
          image: session.user.image ?? undefined,
        },
        session: {
          id: session.session.id,
          userId: session.session.userId,
          expiresAt:
            typeof session.session.expiresAt === 'string'
              ? session.session.expiresAt
              : session.session.expiresAt.toISOString(),
        },
      };
      setData(authResponse);
      return authResponse;
    } catch (err) {
      const wrapped = new Error(getAuthErrorMessage(err, 'Login failed'));
      setError(wrapped);
      throw wrapped;
    } finally {
      setLoading(false);
    }
  }, []);

  return { login, loading, error, data };
}

export function useSignup() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<AuthResponse | null>(null);

  const signup = useCallback(async (payload: SignupPayload) => {
    setLoading(true);
    setError(null);
    try {
      const result = await signupRequest(payload);
      setData(result);
      return result;
    } catch (err) {
      const wrapped = new Error(getAuthErrorMessage(err, 'Signup failed'));
      setError(wrapped);
      throw wrapped;
    } finally {
      setLoading(false);
    }
  }, []);

  return { signup, loading, error, data };
}

export function useSendOTP() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const sendOTP = useCallback(async (payload: SendOTPPayload) => {
    setLoading(true);
    setError(null);
    try {
      return await sendOTPRequest(payload);
    } catch (err) {
      const wrapped = new Error(getAuthErrorMessage(err, 'Failed to send OTP'));
      setError(wrapped);
      throw wrapped;
    } finally {
      setLoading(false);
    }
  }, []);

  return { sendOTP, loading, error };
}

export function useResetPassword() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<AuthResponse | null>(null);

  const resetPassword = useCallback(async (payload: ResetPasswordPayload) => {
    setLoading(true);
    setError(null);
    try {
      const result = await resetPasswordRequest(payload);
      setData(result);
      return result;
    } catch (err) {
      const wrapped = new Error(
        getAuthErrorMessage(err, 'Password reset failed')
      );
      setError(wrapped);
      throw wrapped;
    } finally {
      setLoading(false);
    }
  }, []);

  return { resetPassword, loading, error, data };
}

export function useChangePassword() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const changePassword = useCallback(async (payload: ChangePasswordPayload) => {
    setLoading(true);
    setError(null);
    try {
      return await changePasswordRequest(payload);
    } catch (err) {
      const wrapped = new Error(
        getAuthErrorMessage(err, 'Failed to change password')
      );
      setError(wrapped);
      throw wrapped;
    } finally {
      setLoading(false);
    }
  }, []);

  return { changePassword, loading, error };
}

export function useLogout() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const router = useRouter();

  const clearSessionAndRedirect = useCallback(() => {
    queryClient.removeQueries({ queryKey: AUTH_QUERY_KEYS.user });
    queryClient.removeQueries({ queryKey: AUTH_QUERY_KEYS.employerProfile });
    queryClient.removeQueries({ queryKey: AUTH_QUERY_KEYS.candidateProfile });
    if (router.canGoBack()) {
      router.dismissAll();
    }
    router.replace('/');
  }, [router]);

  const logout = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { error: signOutError } = await authClient.signOut();
      if (signOutError) {
        throw signOutError;
      }
      await clearLocalSession();
      clearSessionAndRedirect();
    } catch (err) {
      const status = (err as { status?: number } | null | undefined)?.status;
      if (status === 401) {
        await clearLocalSession();
        clearSessionAndRedirect();
        return;
      }
      await clearLocalSession();
      clearSessionAndRedirect();
      const wrapped = new Error(getAuthErrorMessage(err, 'Logout failed'));
      setError(wrapped);
      throw wrapped;
    } finally {
      setLoading(false);
    }
  }, [clearSessionAndRedirect]);

  return { logout, loading, error };
}

export function useDashboardPath() {
  return useCallback((role: UserRole | null | undefined) => {
    return getDashboardPath(role);
  }, []);
}

export {
  getSession,
  getDashboardPath,
  invalidateSession,
  clearLocalSession,
  AUTH_QUERY_KEYS,
};
