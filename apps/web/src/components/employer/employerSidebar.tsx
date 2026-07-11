'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Toaster } from 'sonner';

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
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { useLogout } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { useUser } from '@/hooks/useUser';
import { useUnreadDot } from '@/hooks/messaging/useUnreadDot';
import { useGetEmployerProfile } from '@/api-hook/employer';

// Icons (use lucide-react)
import {
  House,
  MessageSquareText,
  Building2,
  Users,
  Briefcase,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Logo } from '@/components/ui/jobly-logo';

// Navigation items structure
const navMain = [
  {
    title: 'Dashboard',
    url: '/employer/dashboard',
    icon: House,
  },
  {
    title: 'Messages',
    url: '/employer/messages',
    icon: MessageSquareText,
    badge: true,
  },
  {
    title: 'Company Profile',
    url: '/employer/company-profile',
    icon: Building2,
  },
  {
    title: 'All Applications',
    url: '/employer/all-applications',
    icon: Users,
  },
  {
    title: 'Job Listing',
    url: '/employer/job-listing',
    icon: Briefcase,
  },
];

const navSecondary = [
  {
    title: 'Settings',
    url: '/employer/settings',
    icon: Settings,
  },
  {
    title: 'Logout',
    url: '/logout',
    icon: LogOut,
    variant: 'destructive' as const,
  },
];

export function EmployerSidebar() {
  const pathname = usePathname();
  const { state, toggleSidebar, isMobile, openMobile } = useSidebar();
  const logout = useLogout();
  const { toast } = useToast();
  const { data: currentUser } = useUser();
  const hasUnreadMessages = useUnreadDot(currentUser?.id);
  const { data: employerProfile, fetchEmployerProfile } =
    useGetEmployerProfile();
  const [avatarError, setAvatarError] = useState(false);
  const showAvatarFallback = !employerProfile?.avatarUrl || avatarError;
  const userInitial = (employerProfile?.fullName || 'U').charAt(0).toUpperCase();

  const handleLogoutClick = () => {
    logout.mutate(undefined, {
      onError: (error) => {
        const message =
          error instanceof Error ? error.message : 'Logout failed';
        toast.error(message);
      },
    });
  };

  // Fetch employer profile on mount
  useEffect(() => {
    fetchEmployerProfile();
  }, []);

  // Derive the actual collapsed state based on mobile vs desktop
  const isCollapsed = isMobile ? !openMobile : state === 'collapsed';

  const handleRestrictedNavigation = () => {
    toast.warning('Must be affiliated with a company to access this page', {
      position: 'top-center',
    });
  };

  return (
    <Sidebar
      collapsible="icon"
      className="relative border-r border-[color:var(--border-primary)] hidden lg:flex"
    >
      {/* Pre-render Toaster for notifications */}
      <Toaster />

      {/* Collapse/Expand Toggle Button - Hidden on mobile/tablet, show on desktop */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-1/2 z-50 hidden lg:flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full border border-[color:var(--border-primary)] bg-white shadow-sm transition-colors hover:bg-gray-100"
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4 text-gray-600" />
        ) : (
          <ChevronLeft className="h-4 w-4 text-gray-600" />
        )}
      </button>

      <SidebarHeader className="border-b border-transparent px-3 sm:px-4 pb-0 pt-6 sm:pt-8 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:px-2">
        <Link href="/" className="flex items-center gap-2 sm:gap-2.5">
          <Logo size="md" />
          <span className="font-[family-name:var(--family-primary)] text-xl sm:text-2xl font-semibold tracking-[-0.15px] text-[#25324b] group-data-[collapsible=icon]:hidden">
            JoblyAI
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="flex flex-col px-0 pb-0 pt-8">
        <div>
          {/* Main Navigation */}
          <SidebarGroup className="px-0">
            <SidebarMenu>
              {navMain.map((item) => {
                const isActive =
                  pathname === item.url || pathname?.startsWith(`${item.url}/`);

                // Determine if badge should show (for Messages, use dynamic unread state)
                const shouldShowBadge =
                  item.title === 'Messages' ? hasUnreadMessages : item.badge;

                // Restricted pages require a company affiliation.
                const restrictedItems = [
                  'Company Profile',
                  'All Applications',
                  'Job Listing',
                ];
                const isRestrictedItem = restrictedItems.includes(item.title);
                const companyId = employerProfile?.company?.id ?? null;
                const isDisabled =
                  isRestrictedItem && employerProfile && !companyId;

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild={!isDisabled}
                      isActive={isActive}
                      tooltip={isDisabled ? undefined : item.title}
                      className={cn(
                        'h-10 sm:h-12 rounded-none px-0 hover:bg-transparent',
                        'group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0',
                        isActive && 'bg-transparent',
                        isDisabled && 'opacity-50 cursor-not-allowed'
                      )}
                      onClick={
                        isDisabled ? handleRestrictedNavigation : undefined
                      }
                    >
                      {isDisabled ? (
                        <div className="flex w-full items-center">
                          <span
                            className={cn(
                              'h-8 w-1 rounded-r-md bg-transparent transition-colors group-data-[collapsible=icon]:hidden',
                              isActive && 'bg-[#4640de]'
                            )}
                          />
                          <span
                            className={cn(
                              'ml-2 sm:ml-3 flex h-10 sm:h-12 flex-1 items-center gap-3 sm:gap-4 rounded-md px-3 sm:px-4 text-sm sm:text-base font-normal text-[#7c8493] transition-colors',
                              'group-data-[collapsible=icon]:ml-0 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0',
                              isActive && 'bg-[#e9ebfd] text-[#4640de]'
                            )}
                          >
                            <item.icon
                              className="h-5 w-5 shrink-0"
                              strokeWidth={1.8}
                            />
                            <span className="truncate group-data-[collapsible=icon]:hidden">
                              {item.title}
                            </span>
                            {shouldShowBadge && (
                              <span className="ml-auto h-2.5 w-2.5 rounded-full bg-[#4640de] group-data-[collapsible=icon]:hidden" />
                            )}
                          </span>
                        </div>
                      ) : (
                        <Link
                          href={item.url}
                          className="flex w-full items-center"
                        >
                          <span
                            className={cn(
                              'h-8 w-1 rounded-r-md bg-transparent transition-colors group-data-[collapsible=icon]:hidden',
                              isActive && 'bg-[#4640de]'
                            )}
                          />
                          <span
                            className={cn(
                              'ml-2 sm:ml-3 flex h-10 sm:h-12 flex-1 items-center gap-3 sm:gap-4 rounded-md px-3 sm:px-4 text-sm sm:text-base font-normal text-[#7c8493] transition-colors',
                              'group-data-[collapsible=icon]:ml-0 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0',
                              isActive && 'bg-[#e9ebfd] text-[#4640de]'
                            )}
                          >
                            <item.icon
                              className="h-5 w-5 shrink-0"
                              strokeWidth={1.8}
                            />
                            <span className="truncate group-data-[collapsible=icon]:hidden">
                              {item.title}
                            </span>
                            {shouldShowBadge && (
                              <span className="ml-auto h-2.5 w-2.5 rounded-full bg-[#4640de] group-data-[collapsible=icon]:hidden" />
                            )}
                          </span>
                        </Link>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
        </div>

        <div className="relative overflow-hidden pt-4">
          <SidebarSeparator className="mx-0 mb-4 bg-[#d6ddeb]" />
          {/* Secondary Navigation */}
          <SidebarGroup className="relative z-10 px-0 pb-8">
            <SidebarMenu>
              {navSecondary.map((item) => {
                const isActive = pathname === item.url;

                // Special handling for Logout
                if (item.title === 'Logout') {
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        onClick={handleLogoutClick}
                        disabled={logout.isPending}
                        tooltip={item.title}
                        className={cn(
                          'h-10 sm:h-12 rounded-none px-0 hover:bg-transparent',
                          'group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0',
                          'bg-transparent'
                        )}
                      >
                        <span className="h-8 w-1 rounded-r-md bg-transparent transition-colors group-data-[collapsible=icon]:hidden" />
                        <span
                          className={cn(
                            'ml-2 sm:ml-3 flex h-10 sm:h-12 flex-1 items-center gap-3 sm:gap-4 rounded-md px-3 sm:px-4 text-sm sm:text-base font-normal text-[#ff6550] transition-colors',
                            'group-data-[collapsible=icon]:ml-0 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0'
                          )}
                        >
                          <item.icon
                            className="h-5 w-5 shrink-0"
                            strokeWidth={1.8}
                          />
                          <span className="truncate group-data-[collapsible=icon]:hidden">
                            {logout.isPending ? 'Logging out...' : item.title}
                          </span>
                        </span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                }

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                      className={cn(
                        'h-10 sm:h-12 rounded-none px-0 hover:bg-transparent',
                        'group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0',
                        isActive && 'bg-transparent'
                      )}
                    >
                      <Link
                        href={item.url}
                        className="flex w-full items-center"
                      >
                        <span
                          className={cn(
                            'h-8 w-1 rounded-r-md bg-transparent transition-colors group-data-[collapsible=icon]:hidden',
                            isActive && 'bg-[#4640de]'
                          )}
                        />
                        <span
                          className={cn(
                            'ml-2 sm:ml-3 flex h-10 sm:h-12 flex-1 items-center gap-3 sm:gap-4 rounded-md px-3 sm:px-4 text-sm sm:text-base font-normal text-[#7c8493] transition-colors',
                            'group-data-[collapsible=icon]:ml-0 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0',
                            isActive && 'bg-[#e9ebfd] text-[#4640de]'
                          )}
                        >
                          <item.icon
                            className="h-5 w-5 shrink-0"
                            strokeWidth={1.8}
                          />
                          <span className="truncate group-data-[collapsible=icon]:hidden">
                            {item.title}
                          </span>
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
        </div>
      </SidebarContent>
      {/* Profile - always at bottom */}
      <SidebarFooter className="border-t border-[color:var(--border-primary)] p-3 sm:p-4 group-data-[collapsible=icon]:p-2 group-data-[collapsible=icon]:justify-center">
        <div className="flex items-center gap-2.5 sm:gap-3 group-data-[collapsible=icon]:justify-center min-h-fit sm:min-h-16">
          <div
            className={cn(
              'h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 rounded-full flex items-center justify-center group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:w-8',
              showAvatarFallback
                ? 'bg-indigo-100 text-indigo-700'
                : 'bg-slate-200 text-slate-500'
            )}
          >
            {showAvatarFallback ? (
              <span className="text-base sm:text-lg font-semibold leading-none">
                {userInitial}
              </span>
            ) : (
              <img
                src={employerProfile?.avatarUrl}
                alt={employerProfile?.fullName || 'User'}
                className="h-full w-full rounded-full object-cover"
                onError={() => setAvatarError(true)}
              />
            )}
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden overflow-hidden">
            <span className="text-xs sm:text-sm font-medium text-[color:var(--text-primary)] leading-4 sm:leading-6">
              {employerProfile?.fullName || 'Loading...'}
            </span>
            <span className="text-xs text-[color:var(--text-secondary)] font-[family-name:var(--family-secondary)] truncate">
              {employerProfile?.email || ''}
            </span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
