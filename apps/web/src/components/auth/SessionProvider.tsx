'use client';

import { useEffect, useState, ReactNode } from 'react';
import { authClient } from '@/lib/auth-client';

export function SessionProvider({ children }: { children: ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Initialize better-auth session on mount
    const initializeSession = async () => {
      try {
        await authClient.getSession();
      } catch {
        // Session fetch failed, user is not authenticated
        console.debug('No active session found');
      } finally {
        setIsInitialized(true);
      }
    };

    initializeSession();
  }, []);

  // Don't render until session is initialized
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  return <>{children}</>;
}
