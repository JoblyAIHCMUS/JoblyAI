'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useUser } from './useUser';
import type { AppRole } from '@/contexts/role-context';
import { getPostAuthRedirect } from '@/lib/utils';

interface ProtectionConfig {
  requiredRoles?: AppRole[];
  redirectTo?: string;
  unauthorizedRedirectTo?: string;
}

/**
 * Hook to protect routes based on authentication, email verification, and role.
 */
export function useRouteProtection(config: ProtectionConfig = {}) {
  const {
    requiredRoles = ['candidate'],
    redirectTo = '/login',
    unauthorizedRedirectTo = '/unauthorized',
  } = config;

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: user, isLoading } = useUser();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.push(redirectTo);
      return;
    }

    if (user.emailVerified === false) {
      const queryString = searchParams?.toString();
      const currentPath = queryString ? `${pathname}?${queryString}` : pathname;
      router.push(getPostAuthRedirect(user, currentPath));
      return;
    }

    if (!user.role) {
      return;
    }

    const isAuthorized = requiredRoles.includes(user.role as AppRole);

    if (!isAuthorized) {
      router.push(unauthorizedRedirectTo);
    }
  }, [
    user,
    isLoading,
    requiredRoles,
    redirectTo,
    unauthorizedRedirectTo,
    pathname,
    searchParams,
    router,
  ]);

  const isAuthorized =
    !isLoading &&
    user &&
    user.emailVerified !== false &&
    requiredRoles.includes((user.role || 'candidate') as AppRole);

  return { isLoading, isAuthorized };
}
