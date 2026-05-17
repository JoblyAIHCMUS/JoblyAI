import { useState } from 'react';
import axios from 'axios';
import {
  login as apiLogin,
  signup as apiSignup,
  sendOTP as apiSendOTP,
  resetPassword as apiResetPassword,
  LoginPayload,
  SignupPayload,
  SendOTPPayload,
  ResetPasswordPayload,
  AuthResponse,
} from '../api/auth';

interface UseAuthResult {
  data: AuthResponse | null;
  loading: boolean;
  error: Error | null;
}

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
