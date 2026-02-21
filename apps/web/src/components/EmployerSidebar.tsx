"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

// Icons (use lucide-react)
import {
  LayoutDashboard,
  MessageSquare,
  Building2,
  Users,
  Briefcase,
  Settings,
  HelpCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// Navigation items structure
const navMain = [
  {
    title: "Dashboard",
    url: "/employer/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Messages",
    url: "/employer/messages",
    icon: MessageSquare,
    badge: "1",
  },
  {
    title: "Company Profile",
    url: "/employer/company-profile",
    icon: Building2,
  },
  {
    title: "All Applicants",
    url: "/employer/all-applicants",
    icon: Users,
  },
  {
    title: "Job Listing",
    url: "/employer/job-listing",
    icon: Briefcase,
  },
];

const navSecondary = [
  {
    title: "Settings",
    url: "/employer/settings",
    icon: Settings,
  },
  {
    title: "Help Center",
    url: "/employer/help",
    icon: HelpCircle,
  },
  {
    title: "Logout",
    url: "/logout",
    icon: LogOut,
    variant: "destructive" as const,
  },
];

export function EmployerSidebar() {
  const pathname = usePathname();
  const { state, toggleSidebar, isMobile, openMobile } = useSidebar();
  
  // Derive the actual collapsed state based on mobile vs desktop
  const isCollapsed = isMobile ? !openMobile : state === "collapsed";

  return (
    <Sidebar collapsible="icon" className="relative border-r border-[color:var(--border-primary)]">
      {/* Collapse/Expand Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-1/2 z-50 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full border border-[color:var(--border-primary)] bg-white shadow-sm transition-colors hover:bg-gray-100"
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4 text-gray-600" />
        ) : (
          <ChevronLeft className="h-4 w-4 text-gray-600" />
        )}
      </button>

      <SidebarHeader className="border-b border-[color:var(--border-primary)] px-4 py-5 group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:justify-center">
        <Link href="/" className="flex items-center gap-2.5">
          {/* Logo / Brand */}
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-indigo-600">
            <span className="text-lg font-bold text-white">J</span>
          </div>
          <span className="text-2xl font-semibold text-[color:var(--text-primary)] font-[family-name:var(--family-primary)] group-data-[collapsible=icon]:hidden">
            JoblyAI
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-2 py-6 group-data-[collapsible=icon]:px-2">
        {/* Main Navigation */}
        <SidebarGroup className="group-data-[collapsible=icon]:px-0">
          <SidebarMenu>
            {navMain.map((item) => {
              const isActive =
                pathname === item.url || pathname?.startsWith(`${item.url}/`);

              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    tooltip={item.title}
                    className={cn(
                      "group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0",
                      isActive &&
                        "bg-[color:var(--bg-accent-primary)] text-[color:var(--text-accent-primary)] hover:bg-[color:var(--bg-accent-primary-hover)]",
                      "data-[active=true]:border-l-4 data-[active=true]:border-[color:var(--bg-accent-solid)] data-[active=true]:pl-3",
                      "group-data-[collapsible=icon]:data-[active=true]:border-l-0 group-data-[collapsible=icon]:data-[active=true]:pl-0"
                    )}
                  >
                    <Link href={item.url}>
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      <span className="group-data-[collapsible=icon]:hidden">{item.title}</span>
                      {item.badge && (
                        <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-[color:var(--icon-accent-primary)] text-xs font-semibold text-[color:var(--icon-white)] group-data-[collapsible=icon]:hidden">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarSeparator className="my-6 bg-[color:var(--border-accent-primary)]" />

        {/* Secondary Navigation */}
        <SidebarGroup className="group-data-[collapsible=icon]:px-0">
          <SidebarMenu>
            {navSecondary.map((item) => {
              const isActive = pathname === item.url;

              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    tooltip={item.title}
                    className={cn(
                      "group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0",
                      item.variant === "destructive"
                        ? "text-red-600 hover:text-red-700"
                        : ""
                    )}
                  >
                    <Link href={item.url}>
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      <span className="group-data-[collapsible=icon]:hidden">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      {/* Profile - always at bottom */}
      <SidebarFooter className="border-t border-[color:var(--border-primary)] p-4 group-data-[collapsible=icon]:p-2 group-data-[collapsible=icon]:justify-center">
        <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
          <div className="h-12 w-12 flex-shrink-0 rounded-full bg-slate-200 group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:w-8">
            <img
              src="https://placehold.co/48x48"
              alt="Maria Kelly"
              className="h-full w-full rounded-full object-cover"
            />
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-lg font-medium text-[color:var(--text-primary)] font-[family-name:var(--family-primary)] leading-6">
              Maria Kelly
            </span>
            <span className="text-sm text-[color:var(--text-secondary)] font-[family-name:var(--family-secondary)]">
              MariaKelly@email.com
            </span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}