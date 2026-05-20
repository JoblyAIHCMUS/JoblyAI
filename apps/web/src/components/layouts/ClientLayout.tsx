'use client';
import { useUser } from '@/hooks/useUser';
import LandingLayout from '@/components/landing/LandingLayout';
import { useMemo } from 'react';
import type { ReactNode } from 'react';
import RoleContext from '@/contexts/role-context';
import type { AppRole } from '@/contexts/role-context';
import { PageTitleProvider } from '@/contexts/page-title-context';
import { usePathname } from 'next/navigation';

export default function ClientLayout({ children }: { children: ReactNode }) {
  // === ALL HOOKS MUST BE CALLED UNCONDITIONALLY AT TOP (Rules of Hooks) ===
  const { data: user, isLoading } = useUser();
  const pathname = usePathname();

  // Determine the role to use in context
  const userRole: AppRole = useMemo(() => {
    if (!user) return 'guest';
    const role = (user.role as AppRole) || 'candidate';
    return role;
  }, [user]);

  // === SHOW LOADING WHILE FETCHING USER DATA ===
  // isLoading prevents hydration mismatches by ensuring consistent render
  // between server and client during the initial user query
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  // Auth pages (login/signup) should not show header and footer
  const isAuthPage = pathname === '/login' || pathname === '/signup';

  if (!user) {
    return (
      <PageTitleProvider>
        <RoleContext.Provider value="guest">
          {isAuthPage ? children : <LandingLayout>{children}</LandingLayout>}
        </RoleContext.Provider>
      </PageTitleProvider>
    );
  }

  // Authenticated users see children with their actual role, wrapped with PageTitleProvider
  return (
    <PageTitleProvider>
      <RoleContext.Provider value={userRole}>{children}</RoleContext.Provider>
    </PageTitleProvider>
  );
}
