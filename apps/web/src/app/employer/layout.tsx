'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/useUser';
import { EmployerSidebar } from '@/components/employer/employerSidebar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { EmployerTopBar } from '@/components/employer/employerTopBar';
import { EmployerProfileProvider } from '@/api-hook/employer';
import type { ReactNode } from 'react';

interface EmployerLayoutProps {
  children: ReactNode;
}

export default function EmployerLayout({ children }: EmployerLayoutProps) {
  const router = useRouter();
  const { data: user, isLoading, isError } = useUser();

  useEffect(() => {
    // Redirect based on auth state
    if (!isLoading) {
      // If error occurred during auth check, redirect to login
      if (isError) {
        router.push('/login');
        return;
      }

      // If user is authenticated but lacks employer role, redirect to unauthorized
      if (user && user.role !== 'employer') {
        router.push('/unauthorized');
        return;
      }

      // If user is null, it could be logout in progress or unauthenticated
      // Don't redirect here - let middleware handle unauthenticated requests
      // and let logout mutation handle its own redirect
    }
  }, [user, isLoading, isError, router]);

  // Show loading state while checking authentication and role
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen w-full bg-white px-4 sm:px-6 md:px-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground text-sm sm:text-base">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  // Show error if authentication check failed
  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-screen w-full bg-white px-4 sm:px-6 md:px-8">
        <div className="text-center">
          <p className="text-destructive mb-4 text-sm sm:text-base">
            Unable to verify your identity
          </p>
          <button
            onClick={() => router.push('/unauthorized')}
            className="px-4 py-2 sm:px-6 sm:py-2.5 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors text-sm sm:text-base"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  // If user passed authorization checks, render the employer dashboard
  if (user && user.role === 'employer') {
    return (
      <EmployerProfileProvider>
        <SidebarProvider>
          <EmployerSidebar />
          <main className="w-full flex flex-col h-screen lg:h-screen overflow-hidden bg-white">
            <EmployerTopBar />
            <div className="flex-1 overflow-auto hidden-scrollbar">
              {/* Trigger allows collapsing/expanding on mobile - positioned for accessibility */}
              <SidebarTrigger className="absolute top-20 left-4 z-30 lg:hidden" />
              {children}
            </div>
          </main>
        </SidebarProvider>
      </EmployerProfileProvider>
    );
  }

  // If user is null, show minimal loading state (logout redirect in progress)
  if (!user && isLoading === false) {
    return null;
  }

  // Fallback (user exists but doesn't have employer role) - redirect handled in effect
  // or still loading
  return null;
}
