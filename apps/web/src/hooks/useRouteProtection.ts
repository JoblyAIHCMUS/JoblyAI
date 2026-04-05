'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useUser } from './useUser';
import type { AppRole } from '@/contexts/role-context';

interface ProtectionConfig {
  requiredRoles?: AppRole[];
  redirectTo?: string;
  unauthorizedRedirectTo?: string;
}

/**
 * Hook to protect routes based on user authentication and role
 * Returns authorization state to control UI rendering
 *
 * @param config - Configuration for route protection
 *
 * @example
 * // In a protected layout:
 * const { isLoading, isAuthorized } = useRouteProtection();
 *
 * // Return null while loading to prevent UI flicker
 * if (isLoading) return null;
 *
 * // Only render if authorized
 * if (!isAuthorized) return null;
 *
 * return <ProtectedContent />;
 */
export function useRouteProtection(config: ProtectionConfig = {}) {
  const {
    requiredRoles = ['candidate'],
    redirectTo = '/login',
    unauthorizedRedirectTo = '/unauthorized',
  } = config;

  const router = useRouter();
  const { data: user, isLoading } = useUser();

  useEffect(() => {
    // Don't redirect while loading
    if (isLoading) return;

    // Check if user is unauthenticated
    if (!user) {
      // Guest trying to access protected route - redirect to login
      router.push(redirectTo);
      return;
    }

    // User is authenticated, check role
    if (!user.role) {
      return; // hoặc redirect
    }

    // Check if user has required role
    const isAuthorized = requiredRoles.includes(user.role as AppRole);

    if (!isAuthorized) {
      // User is authenticated but lacks required role - redirect
      router.push(unauthorizedRedirectTo);
    }
  }, [
    user,
    isLoading,
    requiredRoles,
    redirectTo,
    unauthorizedRedirectTo,
    router,
  ]);

  // Determine if user is authorized
  const isAuthorized =
    !isLoading &&
    user &&
    requiredRoles.includes((user.role || 'candidate') as AppRole);

  return { isLoading, isAuthorized };
}
