'use client';

import { useEffect, ReactNode } from 'react';
import { authClient } from '@/lib/auth-client';

export function SessionProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Initialize better-auth session in background (don't block render)
    // ProtectedRoute will handle auth checks for protected pages
    const initializeSession = async () => {
      try {
        await authClient.getSession();
      } catch {
        // Session fetch failed, user is not authenticated
        console.debug('No active session found');
      }
    };

    // Fire and forget - don't wait for session
    initializeSession();
  }, []);

  // Render immediately without waiting for session initialization
  // ProtectedRoute component will handle redirects for protected pages
  // This improves FCP and prevents hydration mismatches
  return <>{children}</>;
}
