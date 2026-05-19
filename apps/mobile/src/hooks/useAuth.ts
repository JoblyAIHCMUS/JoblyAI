import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import axios from 'axios';
import {
  login as apiLogin,
  signup as apiSignup,
  sendOTP as apiSendOTP,
  resetPassword as apiResetPassword,
  logout as apiLogout,
  LoginPayload,
  SignupPayload,
  SendOTPPayload,
  ResetPasswordPayload,
  AuthResponse,
} from '../api/auth';

export function useLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<AuthResponse | null>(null);

  const login = async (payload: LoginPayload) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiLogin(payload);
      setData(result);
      return result;
    } catch (err) {
      let errorMessage = 'Login failed';
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      const error = new Error(errorMessage);
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
      const result = await apiSignup(payload);
      setData(result);
      return result;
    } catch (err) {
      let errorMessage = 'Signup failed';
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      const error = new Error(errorMessage);
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
      const result = await apiSendOTP(payload);
      return result;
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error('Failed to send OTP');
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
      const result = await apiResetPassword(payload);
      setData(result);
      return result;
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error('Password reset failed');
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
    router.dismissTo('/');
  };

  const logout = async () => {
    setLoading(true);
    setError(null);

    try {
      await apiLogout();
      clearSessionAndRedirect();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          clearSessionAndRedirect();
          return;
        }

        if (!err.response) {
          const networkError = new Error(
            'Network Error: Cannot reach backend. Please ensure the backend server is running and accessible.'
          );
          setError(networkError);
          throw networkError;
        }

        const errorMessage =
          err.response.data?.message || err.message || 'Logout failed';
        const logoutError = new Error(errorMessage);
        setError(logoutError);
        throw logoutError;
      }

      const logoutError =
        err instanceof Error ? err : new Error('Logout failed');
      setError(logoutError);
      throw logoutError;
    } finally {
      setLoading(false);
    }
  };

  return { logout, loading, error };
}
