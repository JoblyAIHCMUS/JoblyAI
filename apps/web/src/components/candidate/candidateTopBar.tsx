'use client';

import { Bell } from 'lucide-react';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { useUser } from '@/hooks/useUser';

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

export function CandidateTopBar() {
  const { data: user } = useUser();
  const fullName = user?.name ?? 'Jake Gyll';
  const email = user?.email ?? 'jakegyll@email.com';
  const initials = getInitials(fullName || 'Jake Gyll');

  return (
    <header className="flex items-center justify-between border-b border-[#d6ddeb] bg-white px-4 py-5 md:px-8 md:py-6">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="md:hidden" />
        <h1 className="font-[family-name:var(--family-primary)] text-[24px] font-semibold tracking-[-0.15px] text-[#25324b] md:text-[40px] md:leading-[48px]">
          Dashboard
        </h1>
      </div>

      <div className="flex items-center gap-3 md:gap-8">
        <div className="hidden items-center gap-4 sm:flex">
          {user?.image ? (
            <img
              src={user.image}
              alt={fullName}
              className="h-12 w-12 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#e9ebfd] font-[family-name:var(--family-primary)] text-sm font-semibold text-[#4640de]">
              {initials}
            </div>
          )}

          <div className="min-w-0">
            <p className="truncate font-[family-name:var(--family-primary)] text-[20px] font-medium leading-6 text-[#25324b]">
              {fullName}
            </p>
            <p className="truncate text-sm text-[#7c8493]">{email}</p>
          </div>
        </div>

        <button
          type="button"
          aria-label="Notifications"
          className="flex h-10 w-10 items-center justify-center rounded-full text-[#25324b] transition-colors hover:bg-[#f8fafc]"
        >
          <Bell className="h-5 w-5" strokeWidth={1.8} />
        </button>
      </div>
    </header>
  );
}