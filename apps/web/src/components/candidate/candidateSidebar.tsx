'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Building2,
  FileText,
  HelpCircle,
  House,
  LogOut,
  MessageSquareText,
  Search,
  Settings,
  UserRound,
} from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

type NavItem = {
  title: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  badge?: string;
  destructive?: boolean;
};

const mainNav: NavItem[] = [
  { title: 'Dashboard', href: '/candidate/dashboard', icon: House },
  {
    title: 'Messages',
    href: '/candidate/messages',
    icon: MessageSquareText,
    badge: '1',
  },
  {
    title: 'My Applications',
    href: '/candidate/applications',
    icon: FileText,
  },
  { title: 'Find Jobs', href: '/candidate/find-jobs', icon: Search },
  {
    title: 'Browse Companies',
    href: '/browse-companies',
    icon: Building2,
  },
  {
    title: 'My Public Profile',
    href: '/candidate/profile',
    icon: UserRound,
  },
];

const secondaryNav: NavItem[] = [
  {
    title: 'Settings',
    href: '/candidate/settings',
    icon: Settings,
  },
  {
    title: 'Help Center',
    href: '/candidate/help',
    icon: HelpCircle,
  },
  { title: 'Logout', href: '/logout', icon: LogOut, destructive: true },
];

function BrandMark() {
  return (
    <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-[#4640de]">
      <div className="absolute inset-[5px] rounded-full border-[3px] border-white border-r-transparent border-t-transparent rotate-45" />
      <div className="absolute left-[9px] top-[7px] h-2.5 w-2.5 rounded-full bg-white" />
    </div>
  );
}

function CandidateSidebarItem({
  item,
  active,
}: {
  item: NavItem;
  active: boolean;
}) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={active}
        tooltip={item.title}
        className={cn(
          'h-12 rounded-none px-0 hover:bg-transparent',
          'group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0',
          active && 'bg-transparent'
        )}
      >
        <Link href={item.href} className="flex w-full items-center">
          <span
            className={cn(
              'h-8 w-1 rounded-r-md bg-transparent transition-colors',
              active && 'bg-[#4640de]'
            )}
          />
          <span
            className={cn(
              'ml-3 flex h-12 flex-1 items-center gap-4 rounded-md px-4 text-[16px] font-normal text-[#7c8493] transition-colors',
              'group-data-[collapsible=icon]:ml-0 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0',
              active && 'bg-[#e9ebfd] text-[#4640de]',
              item.destructive && 'text-[#ff6550]'
            )}
          >
            <item.icon className="h-5 w-5 shrink-0" strokeWidth={1.8} />
            <span className="truncate group-data-[collapsible=icon]:hidden">
              {item.title}
            </span>
            {item.badge ? (
              <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-[#4640de] px-1.5 text-[11px] font-semibold text-white group-data-[collapsible=icon]:hidden">
                {item.badge}
              </span>
            ) : null}
          </span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export function CandidateSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar
      collapsible="icon"
      className="h-screen max-h-screen border-r border-[#d6ddeb] bg-white"
    >
      <SidebarHeader className="border-b border-transparent px-4 pb-0 pt-8 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:px-2">
        <Link href="/candidate/dashboard" className="flex items-center gap-2.5">
          <BrandMark />
          <span className="font-[family-name:var(--family-primary)] text-[24px] font-semibold tracking-[-0.15px] text-[#25324b] group-data-[collapsible=icon]:hidden">
            JoblyAI
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="justify-between px-0 pb-0 pt-8">
        <div>
          <SidebarGroup className="px-0">
            <SidebarMenu>
              {mainNav.map((item) => (
                <CandidateSidebarItem
                  key={item.title}
                  item={item}
                  active={pathname === item.href}
                />
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </div>

        <div className="relative overflow-hidden pt-4">
          <SidebarSeparator className="mx-0 mb-4 bg-[#d6ddeb]" />
          <SidebarGroup className="relative z-10 px-0 pb-8">
            <SidebarMenu>
              {secondaryNav.map((item) => (
                <CandidateSidebarItem
                  key={item.title}
                  item={item}
                  active={pathname === item.href}
                />
              ))}
            </SidebarMenu>
          </SidebarGroup>
          <div className="pointer-events-none relative hidden h-48 overflow-hidden group-data-[collapsible=icon]:hidden md:block">
            <Image
              src="/applicant/Pattern.png"
              alt=""
              fill
              className="object-contain object-right-bottom opacity-95"
            />
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
