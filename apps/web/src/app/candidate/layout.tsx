import type { ReactNode } from 'react';

import { CandidateSidebar } from '@/components/candidate/candidateSidebar';
import { CandidateTopBar } from '@/components/candidate/candidateTopBar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { CandidateProvider } from '@/hooks/useCandidate';

export default function CandidateLayout({ children }: { children: ReactNode }) {
  return (
    <CandidateProvider>
      <SidebarProvider>
        <CandidateSidebar />
        <main className="flex h-screen w-full flex-col overflow-hidden bg-white">
          <CandidateTopBar />
          <div className="flex-1 overflow-auto">{children}</div>
        </main>
      </SidebarProvider>
    </CandidateProvider>
  );
}