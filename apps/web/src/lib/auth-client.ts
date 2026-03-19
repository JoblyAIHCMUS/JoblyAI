'use client';

import { createAuthClient } from 'better-auth/react';
import { emailOTPClient } from 'better-auth/client/plugins';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const authClient = createAuthClient({
  baseURL: `${API_BASE_URL}/api/auth`,
  fetchOptions: {
    credentials: 'include', // Send cookies with cross-origin requests
  },
  plugins: [emailOTPClient()],
});

export type Session = typeof authClient.$Infer.Session;
