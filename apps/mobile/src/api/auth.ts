import { apiClient } from './config';

export interface LoginPayload {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface SignupPayload {
  name: string;
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

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
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
    emailVerified: boolean;
    image?: string;
  };
  session?: {
    id: string;
    userId: string;
    expiresAt: string;
  };
}

export const login = async (
  data: LoginPayload,
  signal?: AbortSignal
): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>(
    '/auth/sign-in/email',
    data,
    {
      signal,
    }
  );
  return response.data;
};

export const signup = async (
  data: SignupPayload,
  signal?: AbortSignal
): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>(
    '/auth/sign-up/email',
    data,
    {
      signal,
    }
  );
  return response.data;
};

export const sendOTP = async (
  data: SendOTPPayload,
  signal?: AbortSignal
): Promise<{ status: boolean }> => {
  const response = await apiClient.post(
    '/auth/email-otp/send-verification-otp',
    data,
    { signal }
  );
  return response.data;
};

export const resetPassword = async (
  data: ResetPasswordPayload,
  signal?: AbortSignal
): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>(
    '/auth/email-otp/reset-password',
    data,
    { signal }
  );
  return response.data;
};

export const changePassword = async (
  data: ChangePasswordPayload,
  signal?: AbortSignal
): Promise<{ success?: boolean; message?: string }> => {
  const response = await apiClient.post('/auth/change-password', data, {
    signal,
  });
  return response.data;
};

export const getSession = async (
  signal?: AbortSignal
): Promise<AuthResponse> => {
  const response = await apiClient.get<AuthResponse>('/auth/session', {
    signal,
  });
  return response.data;
};

export const logout = async (signal?: AbortSignal): Promise<void> => {
  await apiClient.post('/auth/sign-out', undefined, {
    signal,
  });
};
