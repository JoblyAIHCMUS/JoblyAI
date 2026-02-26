'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // The OAuth callback is handled automatically by better-auth
        // Just validate the session and redirect
        const session = await authClient.getSession();

        if (session?.data?.user) {
          // Redirect to home on successful auth
          router.push('/');
        } else {
          // Redirect back to login if no session
          router.push('/login');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        router.push('/login');
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Completing Sign In...</h1>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-solid mx-auto"></div>
      </div>
    </div>
  );
}
