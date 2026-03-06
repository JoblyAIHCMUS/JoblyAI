import { EmployerSidebar } from '@/components/employer/employerSidebar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { EmployerTopBar } from '@/components/employer/employerTopBar';
import { CompanyProvider } from '@/hooks/useCompany';
import type { ReactNode } from 'react';

export default function EmployerLayout({ children }: { children: ReactNode }) {
  return (
    <CompanyProvider>
      <SidebarProvider>
        <EmployerSidebar />
        <main className="w-full flex flex-col h-screen overflow-hidden">
          <EmployerTopBar />
          <div className="flex-1 overflow-hidden">
            {/* Trigger allows collapsing/expanding on mobile or desktop if configured */}
            <SidebarTrigger className="p-4 md:hidden" />
            {children}
          </div>
        </main>
      </SidebarProvider>
    </CompanyProvider>
  );
}
