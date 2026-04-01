'use client';

import Link from 'next/link';
import { Bell, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
// Dropdown menu imports removed (unused)
import { cn } from '@/lib/utils';
// useEffect import removed (unused)
import { useGetEmployerProfile } from '@/api-hook/employer/useGetEmployerProfile';
import { useEffect } from 'react';

// Optional: notification count
// const notificationCount = 3;

export function EmployerTopBar() {
  const {
    data: profile,
    loading,
    error,
    fetchEmployerProfile,
  } = useGetEmployerProfile();
  const company = profile?.company;
  const canPostJob = Boolean(company?.id) && !loading;

  useEffect(() => {
    fetchEmployerProfile();
  }, []);

  return (
    <header
      className={cn(
        'w-full',
        'px-6 md:px-8 py-4',
        'bg-white',
        'shadow-[inset_0_-1px_0_0] shadow-slate-200/80',
        'border-b border-border'
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        {/* Left side - Company logo + name or Not Affiliated */}
        <div className="flex items-center gap-4">
          {/* Company logo or placeholder */}
          <div className="h-12 w-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 text-xs font-medium">
            {company?.logoUrl ? (
              <img
                src={company.logoUrl}
                alt={company.name}
                className="h-12 w-12 rounded-full object-cover"
              />
            ) : (
              'Logo'
            )}
          </div>

          {/* Company name or Not Affiliated + Register link or Error */}
          <div className="flex flex-col items-start">
            <span className="text-sm text-[var(--text-secondary)] font-normal leading-5">
              Company
            </span>
            <div className="flex items-center gap-1.5">
              {error ? (
                <span className="text-red-600 text-base font-semibold">
                  Error loading profile
                </span>
              ) : (
                <span className="text-xl font-semibold text-[var(--text-primary)] leading-6">
                  {loading
                    ? 'Loading...'
                    : company?.name
                    ? company.name
                    : 'Not Affiliated'}
                </span>
              )}
              {!company && !loading && !error && (
                <Link
                  href="/employer/new-company"
                  className="ml-3 text-indigo-600 font-bold hover:underline"
                >
                  Register Company
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Right side - Notification + Post job */}
        <div className="flex items-center gap-6 md:gap-8">
          {/* Notification bell button */}
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            aria-label="Open notifications"
            // onClick={() => openNotificationCenter()} // ← implement later
          >
            <Bell className="h-6 w-6 text-[var(--icon-primary)]" />
            {/* Red dot badge */}
            <span className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-red-500 border-2 border-white" />
          </Button>

          {/* Post a job button */}
          {canPostJob ? (
            <Button
              asChild
              className="gap-2 px-6 py-2.5 h-11 bg-[var(--bg-accent-solid)] hover:bg-[var(--bg-accent-solid-hover)] text-[var(--text-white)]"
            >
              <Link href="/employer/new-job">
                <Plus className="h-5 w-5" />
                Post a job
              </Link>
            </Button>
          ) : (
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <Button
                      type="button"
                      disabled
                      className="gap-2 px-6 py-2.5 h-11 bg-[var(--bg-disabled)] text-[var(--text-disabled)] cursor-not-allowed"
                    >
                      <Plus className="h-5 w-5" />
                      Post a job
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  Register your company first to post jobs
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>
    </header>
  );
}
