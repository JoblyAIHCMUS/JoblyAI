import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { authClient } from '../lib/auth-client';
import {
  signup as signupRequest,
  LoginPayload,
  SignupPayload,
  ChangePasswordPayload,
  SendOTPPayload,
  ResetPasswordPayload,
  AuthResponse,
  changePassword as changePasswordRequest,
  resetPassword as resetPasswordRequest,
  sendOTP as sendOTPRequest,
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

export function useLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<AuthResponse | null>(null);

  const login = async (payload: LoginPayload) => {
    setLoading(true);
    setError(null);

    try {
      const { data: result, error } = await authClient.signIn.email({
        email: payload.email,
        password: payload.password,
        rememberMe: payload.rememberMe,
      });

      if (error) {
        throw error;
      }
      if (!result || !result.user) {
        throw new Error('Login successful but no user data returned');
      }
      const session = await authClient.getSession();

      if (!session.data) {
        throw new Error('Session was not created');
      }

      const user = session.data.user as typeof session.data.user & {
        role: 'candidate' | 'employer';
      };

      const authResponse: AuthResponse = {
        user: {
          id: user.id,
          email: user.email,
          emailVerified: user.emailVerified,
          role: user.role,
          image: user.image ?? undefined,
        },
        session: {
          id: session.data.session.id,
          userId: session.data.session.userId,
          expiresAt: session.data.session.expiresAt.toISOString(),
        },
      };

      setData(authResponse);

      return authResponse;
    } catch (err) {
      const error = new Error(getAuthErrorMessage(err, 'Login failed'));
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { login, loading, error, data };
}

export function useSignup() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<AuthResponse | null>(null);

  const signup = async (payload: SignupPayload) => {
    setLoading(true);
    setError(null);
    try {
      const data = await signupRequest(payload);

      setData(data);
      return data;
    } catch (err) {
      const error = new Error(getAuthErrorMessage(err, 'Signup failed'));
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { signup, loading, error, data };
}

export function useSendOTP() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const sendOTP = async (payload: SendOTPPayload) => {
    setLoading(true);
    setError(null);
    try {
      return await sendOTPRequest(payload);
    } catch (err) {
      const error = new Error(getAuthErrorMessage(err, 'Failed to send OTP'));
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { sendOTP, loading, error };
}

export function useResetPassword() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<AuthResponse | null>(null);

  const resetPassword = async (payload: ResetPasswordPayload) => {
    setLoading(true);
    setError(null);
    try {
      const data = await resetPasswordRequest(payload);

      setData(data);
      return data;
    } catch (err) {
      const error = new Error(
        getAuthErrorMessage(err, 'Password reset failed')
      );
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { resetPassword, loading, error, data };
}

export function useChangePassword() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const changePassword = async (payload: ChangePasswordPayload) => {
    setLoading(true);
    setError(null);

    try {
      return await changePasswordRequest(payload);
    } catch (err) {
      const error = new Error(
        getAuthErrorMessage(err, 'Failed to change password')
      );
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { changePassword, loading, error };
}

export function useLogout() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const queryClient = useQueryClient();
  const router = useRouter();

  const clearSessionAndRedirect = () => {
    queryClient.removeQueries({ queryKey: ['user'] });
    queryClient.removeQueries({ queryKey: ['employer-profile'] });
    queryClient.removeQueries({ queryKey: ['candidate-profile'] });
    router.dismissTo('/');
  };

  const logout = async () => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await authClient.signOut();
      if (error) {
        throw error;
      }

      clearSessionAndRedirect();
    } catch (err) {
      if (err && typeof err === 'object' && 'status' in err) {
        const status = (err as { status?: number }).status;
        if (status === 401) {
          clearSessionAndRedirect();
          return;
        }
      }

      const logoutError = new Error(getAuthErrorMessage(err, 'Logout failed'));
      setError(logoutError);
      throw logoutError;
    } finally {
      setLoading(false);
    }
  };

  return { logout, loading, error };
}
