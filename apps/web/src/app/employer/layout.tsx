'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/useUser';
import { EmployerSidebar } from '@/components/employer/employerSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
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
    if (isLoading) return;

    if (isError) {
      router.push('/login');
      return;
    }

    if (!user) {
      router.push('/login');
      return;
    }

    if (user.role !== 'employer') {
      router.push('/unauthorized');
    }
  }, [user, isLoading, isError, router]);

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

  if (user && user.role === 'employer') {
    return (
      <EmployerProfileProvider>
        <SidebarProvider>
          <EmployerSidebar />
          <main className="w-full flex flex-col h-screen lg:h-screen overflow-hidden bg-white">
            <EmployerTopBar />
            <div className="flex-1 flex flex-col overflow-auto hidden-scrollbar">
              {children}
            </div>
          </main>
        </SidebarProvider>
      </EmployerProfileProvider>
    );
  }

  // useEffect above will redirect; show a spinner so the parent layout doesn't flash empty content.
  return (
    <div className="flex items-center justify-center min-h-screen w-full bg-white px-4 sm:px-6 md:px-8">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground text-sm sm:text-base">
          Redirecting...
        </p>
      </div>
    </div>
  );
}
