import { EmployerSidebar } from "@/components/EmployerSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export default function EmployerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <EmployerSidebar />
      <main className="w-full">
        {/* Trigger allows collapsing/expanding on mobile or desktop if configured */}
        <SidebarTrigger className="p-4 md:hidden" /> 
        {children}
      </main>
    </SidebarProvider>
  );
}