'use client';

import type { ReactNode } from 'react';
import { useEffect } from 'react';

import { CandidateSidebar } from '@/components/candidate/candidateSidebar';
import { CandidateTopBar } from '@/components/candidate/candidateTopBar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { CandidateProvider } from '@/features/candidate/context/candidate-context';
import {
  CandidateProfileProvider,
  useCandidateProfileContext,
} from '@/api-hook/candidate';
import { useRouteProtection } from '@/hooks/useRouteProtection';

function CandidateLayoutContent({ children }: { children: ReactNode }) {
  const { fetchCandidateProfile } = useCandidateProfileContext();

  // Auto-fetch profile on mount (only once)
  useEffect(() => {
    fetchCandidateProfile();
  }, [fetchCandidateProfile]);

  return (
    <SidebarProvider>
      <CandidateSidebar />
      <main className="flex h-screen w-full flex-col overflow-hidden bg-white">
        <CandidateTopBar />
        <div className="flex-1 overflow-auto">{children}</div>
      </main>
    </SidebarProvider>
  );
}

export default function CandidateLayout({ children }: { children: ReactNode }) {
  // Protect this route: guests are redirected to /login
  // Returns null while loading or if unauthorized to prevent UI flicker
  const { isLoading, isAuthorized } = useRouteProtection({
    requiredRoles: ['candidate'],
    redirectTo: '/login',
  });

  // Render nothing while checking authentication
  // This prevents any UI from flashing before redirect
  if (isLoading || !isAuthorized) {
    return null;
  }

  // Only render protected content after auth is confirmed
  return (
    <CandidateProfileProvider>
      <CandidateProvider>
        <CandidateLayoutContent>{children}</CandidateLayoutContent>
      </CandidateProvider>
    </CandidateProfileProvider>
  );
}
