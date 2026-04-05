'use client';

import { ReactNode } from 'react';
import { useRouteProtection } from '@/hooks/useRouteProtection';
import type { AppRole } from '@/contexts/role-context';

interface ProtectedLayoutProps {
  children: ReactNode;
  requiredRoles?: AppRole[];
  redirectTo?: string;
  unauthorizedRedirectTo?: string;
}

/**
 * Reusable component for protecting routes with authentication
 *
 * Returns null while auth is being verified to prevent UI flicker
 * Only renders children if user is authenticated and authorized
 *
 * @example
 * // Protect candidate routes
 * export default function CandidateLayout({ children }: { children: ReactNode }) {
 *   return (
 *     <ProtectedLayout requiredRoles={['candidate']}>
 *       <CandidateProvider>
 *         {children}
 *       </CandidateProvider>
 *     </ProtectedLayout>
 *   );
 * }
 */
export function ProtectedLayout({
  children,
  requiredRoles = ['candidate'],
  redirectTo = '/login',
  unauthorizedRedirectTo = '/unauthorized',
}: ProtectedLayoutProps) {
  const { isLoading, isAuthorized } = useRouteProtection({
    requiredRoles,
    redirectTo,
    unauthorizedRedirectTo,
  });

  // Return null during auth check AND if not authorized
  // This prevents any UI from rendering before redirect
  if (isLoading || !isAuthorized) {
    return null;
  }

  // Only render if user is authenticated and authorized
  return children;
}
