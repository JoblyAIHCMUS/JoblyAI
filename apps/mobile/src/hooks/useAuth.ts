import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { authClient } from '../lib/auth-client';
import {
  LoginPayload,
  SignupPayload,
  SendOTPPayload,
  ResetPasswordPayload,
  AuthResponse,
} from '../api/auth';

function getAuthErrorMessage(error: unknown, fallback: string): string {
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
      const { data, error } = await authClient.signIn.email({
        email: payload.email,
        password: payload.password,
        rememberMe: payload.rememberMe,
      });

      if (error) {
        throw error;
      }

      setData(data as AuthResponse);
      return data as AuthResponse;
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
      const { data, error } = await authClient.signUp.email({
        name: payload.name,
        email: payload.email,
        password: payload.password,
        firstName: payload.firstName,
        lastName: payload.lastName,
        role: payload.role,
      });

      if (error) {
        throw error;
      }

      setData(data as AuthResponse);
      return data as AuthResponse;
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
      const { data, error } = await authClient.emailOtp.sendVerificationOtp({
        email: payload.email,
        type: payload.type,
      });

      if (error) {
        throw error;
      }

      return data;
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
      const { data, error } = await authClient.emailOtp.resetPassword({
        email: payload.email,
        otp: payload.otp,
        password: payload.password,
      });

      if (error) {
        throw error;
      }

      setData(data as AuthResponse);
      return data as AuthResponse;
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
