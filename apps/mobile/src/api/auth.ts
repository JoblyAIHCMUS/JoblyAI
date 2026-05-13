import { apiClient } from './config';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface SignupPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'candidate' | 'employer';
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  email: string;
  otp: string;
  password: string;
}

export interface SendOTPPayload {
  email: string;
  type: 'forget-password';
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    role: 'candidate' | 'employer';
  };
  token?: string;
}

export const login = async (
  data: LoginPayload,
  signal?: AbortSignal
): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/auth/login', data, {
    signal,
  });
  return response.data;
};

export const signup = async (
  data: SignupPayload,
  signal?: AbortSignal
): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/auth/signup', data, {
    signal,
  });
  return response.data;
};

export const sendOTP = async (
  data: SendOTPPayload,
  signal?: AbortSignal
): Promise<{ success: boolean }> => {
  const response = await apiClient.post('/auth/send-otp', data, { signal });
  return response.data;
};

export const resetPassword = async (
  data: ResetPasswordPayload,
  signal?: AbortSignal
): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>(
    '/auth/reset-password',
    data,
    { signal }
  );
  return response.data;
};
