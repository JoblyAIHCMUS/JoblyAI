'use client';

import Link from 'next/link';
import { Bell, ChevronDown, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useCompany } from '@/hooks/useCompany';

// Optional: notification count
// const notificationCount = 3;

export function EmployerTopBar() {
  const { companies, selectedCompany, setSelectedCompany } = useCompany();

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
        {/* Left side - Company logo + name dropdown */}
        <div className="flex items-center gap-4">
          {/* Company logo placeholder */}
          <div className="h-12 w-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 text-xs font-medium">
            {selectedCompany?.logo || 'Logo'}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-2 hover:opacity-90 transition"
              >
                <div className="flex flex-col items-start">
                  <span className="text-sm text-[var(--text-secondary)] font-normal leading-5">
                    Company
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xl font-semibold text-[var(--text-primary)] leading-6">
                      {selectedCompany?.name || 'Select Company'}
                    </span>
                    <ChevronDown className="h-5 w-5 text-[var(--icon-primary)]" />
                  </div>
                </div>
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel>Switch company</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {companies.map((company) => (
                <DropdownMenuItem
                  key={company.id}
                  onSelect={() => setSelectedCompany(company)}
                  className={cn(
                    selectedCompany?.id === company.id &&
                      'bg-accent font-medium'
                  )}
                >
                  {company.name}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="font-bold text-indigo-600">
                <Link href="/employer/new-company">+ Add new company</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
            {/* If show number instead / in addition */}
            {/* <Badge variant="destructive" className="absolute -top-2 -right-2 px-1.5 min-w-[1.25rem] h-5 text-xs">
              {notificationCount}
            </Badge> */}
          </Button>

          {/* Post a job button */}
          <Button
            asChild
            className="gap-2 px-6 py-2.5 h-11 bg-[var(--bg-accent-solid)] hover:bg-[var(--bg-accent-solid-hover)] text-[var(--text-white)]"
          >
            <Link href="/employer/new-job">
              <Plus className="h-5 w-5" />
              Post a job
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
