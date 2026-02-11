'use client';

import { createAuthClient } from 'better-auth/react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const authClient = createAuthClient({
  baseURL: `${API_BASE_URL}/api/auth`,
  fetchOptions: {
    credentials: 'include', // Send cookies with cross-origin requests
  },
});

export type Session = typeof authClient.$Infer.Session;
