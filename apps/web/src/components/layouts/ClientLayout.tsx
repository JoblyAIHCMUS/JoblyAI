'use client';
import { useUser } from '@/hooks/useUser';
import LandingLayout from '@/components/landing/LandingLayout';
import { useCallback, useMemo, useEffect } from 'react';
import type { ReactNode } from 'react';
import RoleContext from '@/contexts/role-context';
import type { AppRole } from '@/contexts/role-context';
import { PageTitleProvider } from '@/contexts/page-title-context';
import { usePathname, useRouter } from 'next/navigation';

export default function ClientLayout({ children }: { children: ReactNode }) {
  // === ALL HOOKS MUST BE CALLED UNCONDITIONALLY AT TOP (Rules of Hooks) ===
  const { data: user, isLoading } = useUser();
  const pathname = usePathname();
  const router = useRouter();

  // Determine the role to use in context
  const userRole: AppRole = useMemo(() => {
    if (!user) return 'guest';
    const role = (user.role as AppRole) || 'candidate';
    return role;
  }, [user]);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useCallback(() => userRole, [userRole])();

  // Handle root path redirect when user is authenticated
  // Redirect '/' to role-specific dashboard based on actual user role from API
  useEffect(() => {
    if (!isLoading && user && pathname === '/') {
      const targetPath = user.role === 'employer' ? '/employer' : '/candidate';
      router.push(targetPath);
    }
  }, [user, isLoading, pathname, router]);

  // === CONDITIONAL LOGIC AFTER ALL HOOKS ===

  // Show loading state while fetching user data
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  // Guard render for authenticated users on guest-only routes
  // This blocks rendering before middleware redirect, preventing:
  // - PageTitleProvider errors
  // - Wrong layout renders
  // - UI flicker
  const isGuestOnlyRoute =
    pathname === '/find-jobs' ||
    pathname.startsWith('/find-jobs/') ||
    pathname === '/browse-companies' ||
    pathname.startsWith('/browse-companies/');

  if (user && isGuestOnlyRoute) {
    // Authenticated user on guest route - don't render anything
    // Middleware will redirect this, keep as safety net
    return null;
  }

  // Guest users see landing layout, wrapped with PageTitleProvider for consistency
  if (!user) {
    return (
      <PageTitleProvider>
        <RoleContext.Provider value="guest">
          <LandingLayout>{children}</LandingLayout>
        </RoleContext.Provider>
      </PageTitleProvider>
    );
  }

  // Authenticated users see children with their actual role, wrapped with PageTitleProvider
  return (
    <PageTitleProvider>
      <RoleContext.Provider value={contextValue}>
        {children}
      </RoleContext.Provider>
    </PageTitleProvider>
  );
}
