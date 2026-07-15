'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Bell, Plus, Menu } from 'lucide-react';
import { useSidebar } from '@/components/ui/sidebar';

import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useGetEmployerProfile } from '@/api-hook/employer/useGetEmployerProfile';
import { useNotifications } from '@/hooks/useNotifications';

// Optional: notification count
// const notificationCount = 3;

export function EmployerTopBar() {
  const { data: profile, loading: isPending, error } = useGetEmployerProfile();
  const company = profile?.company;
  const canPostJob = Boolean(company?.id) && !isPending;
  const { toggleSidebar, isMobile } = useSidebar();
  const [logoError, setLogoError] = useState(false);
  const showLogoFallback = !company?.logoUrl || logoError;
  const companyInitial = (company?.name ?? 'C').charAt(0).toUpperCase();

  const {
    visibleNotifications,
    hasMoreNotifications,
    unreadCount,
    isBellEnabled,
    showNotificationMenu,
    notificationWrapperRef,
    handleBellToggle,
    handleNotificationScroll,
    closeNotificationMenu,
    formatNotificationTime,
    handleMarkAsRead,
  } = useNotifications();

  return (
    <header
      className={cn(
        'w-full',
        'px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4',
        'bg-white',
        'border-b border-[#d6ddeb]',
        'sticky top-0 z-20'
      )}
    >
      <div className="flex items-center justify-between gap-3 sm:gap-4">
        {/* Left side - Menu toggle (mobile) + Company logo + name or Not Affiliated */}
        <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-shrink-0">
          {/* Mobile menu toggle */}
          {isMobile && (
            <button
              type="button"
              onClick={toggleSidebar}
              aria-label="Toggle sidebar"
              className="lg:hidden p-0 text-[#25324b] hover:text-[#4640de] transition-colors"
            >
              <Menu className="h-4 w-4" strokeWidth={2} />
            </button>
          )}

          {/* Company logo or placeholder */}
          <div
            className={cn(
              'h-10 w-10 sm:h-12 sm:w-12 rounded-full flex items-center justify-center caption-caption-1-medium flex-shrink-0',
              showLogoFallback
                ? 'bg-indigo-100 text-indigo-700'
                : 'bg-slate-200 text-slate-500'
            )}
          >
            {showLogoFallback ? (
              <span className="text-base sm:text-lg font-semibold leading-none">
                {companyInitial}
              </span>
            ) : (
              <img
                src={company.logoUrl ?? undefined}
                alt={company.name}
                className="h-12 w-12 rounded-full object-cover"
                onError={() => setLogoError(true)}
              />
            )}
          </div>

          {/* Company name or Not Affiliated + Register link or Error */}
          <div className="flex flex-col items-start">
            <span className="label-label-2-regular text-[var(--text-secondary)] text-xs sm:text-sm">
              Company
            </span>
            <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
              {error ? (
                <span className="heading-h6-semi-bold text-[#ff6550] text-sm sm:text-base">
                  Error loading profile
                </span>
              ) : (
                <span className="heading-h6-semi-bold text-[#25324b] text-sm sm:text-base truncate">
                  {isPending
                    ? 'Loading...'
                    : company?.name
                    ? company.name
                    : 'Not Affiliated'}
                </span>
              )}
              {!company && !isPending && !error && (
                <Link
                  href="/employer/new-company"
                  className="ml-1 sm:ml-3 text-[#4640de] label-label-2-semi-bold hover:underline text-xs sm:text-sm whitespace-nowrap"
                >
                  Register
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Right side - Notification + Post job */}
        <div className="flex items-center gap-3 sm:gap-4 md:gap-6 lg:gap-8 flex-shrink-0">
          {/* Notification bell button */}
          <div className="relative" ref={notificationWrapperRef}>
            <button
              type="button"
              aria-label="Notifications"
              aria-expanded={isBellEnabled}
              aria-haspopup="menu"
              onClick={handleBellToggle}
              className={`relative flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full transition-colors ${
                isBellEnabled
                  ? 'bg-[#eef0ff] text-[#4640de]'
                  : 'text-[#25324b] hover:bg-[#f8fafc] hover:text-[#4640de]'
              }`}
            >
              <Bell className="h-5 w-5" strokeWidth={1.8} />
              {unreadCount > 0 && (
                <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#ff6550] px-0.5 caption-caption-2-medium text-white text-xs">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            {showNotificationMenu && (
              <>
                <button
                  type="button"
                  aria-label="Close notifications"
                  onClick={closeNotificationMenu}
                  className="fixed inset-0 z-40 bg-black/10 lg:hidden"
                />

                <div className="fixed inset-x-2 top-[72px] sm:inset-x-4 z-50 rounded-xl border border-[#d6ddeb] bg-white shadow-[0_12px_28px_rgba(37,50,75,0.14)] lg:absolute lg:inset-x-auto lg:right-0 lg:top-12 lg:w-[360px]">
                  <div className="border-b border-[#eef1f6] px-3 sm:px-4 py-2 sm:py-3">
                    <p className="heading-h6-semi-bold text-[#25324b] text-sm sm:text-base">
                      Notifications
                    </p>
                  </div>

                  <ul
                    className="max-h-[calc(100vh-180px)] overflow-auto py-2 sm:max-h-[360px]"
                    onScroll={handleNotificationScroll}
                  >
                    {visibleNotifications.map((notification) => (
                      <li key={notification.id}>
                        <Link
                          href={notification.link || '#'}
                          onClick={() => {
                            handleMarkAsRead(notification.id);
                            closeNotificationMenu();
                          }}
                          className="flex gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 transition-colors hover:bg-[#f8fafc]"
                        >
                          <span
                            className={`mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full ${
                              !notification.isRead
                                ? 'bg-[#4640de]'
                                : 'bg-[#d6ddeb]'
                            }`}
                          />
                          <div className="min-w-0">
                            <p className="line-clamp-2 text-xs sm:text-sm text-[#25324b]">
                              {notification.content}
                            </p>
                            <p className="mt-0.5 sm:mt-1 text-xs text-[#7c8493]">
                              {formatNotificationTime(notification.createdAt)}
                            </p>
                          </div>
                        </Link>
                      </li>
                    ))}

                    {hasMoreNotifications && (
                      <li className="px-3 sm:px-4 py-2 text-center text-xs text-[#7c8493]">
                        Scroll to load more
                      </li>
                    )}
                  </ul>
                </div>
              </>
            )}
          </div>

          {/* Post a job button */}
          {canPostJob ? (
            <Button
              asChild
              className="gap-1 sm:gap-2 px-3 sm:px-6 py-2 sm:py-2.5 h-9 sm:h-11 bg-[var(--bg-accent-solid)] hover:bg-[var(--bg-accent-solid-hover)] text-[var(--text-white)] text-xs sm:text-sm md:text-base"
            >
              <Link href="/employer/new-job">
                <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">Post a job</span>
                <span className="sm:hidden">Post</span>
              </Link>
            </Button>
          ) : (
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span
                    tabIndex={0}
                    role="button"
                    aria-disabled="true"
                    aria-label="Post a job is unavailable until you register your company"
                    className="inline-flex"
                  >
                    <Button
                      type="button"
                      disabled
                      className="gap-1 sm:gap-2 px-3 sm:px-6 py-2 sm:py-2.5 h-9 sm:h-11 bg-[var(--bg-disabled)] text-[var(--text-disabled)] cursor-not-allowed text-xs sm:text-sm md:text-base"
                    >
                      <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span className="hidden sm:inline">Post a job</span>
                      <span className="sm:hidden">Post</span>
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
