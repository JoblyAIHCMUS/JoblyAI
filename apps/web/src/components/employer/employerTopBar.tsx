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
import { cn } from '@/lib/utils';
import { useGetEmployerProfile } from '@/api-hook/employer/useGetEmployerProfile';
import { useNotifications } from '@/hooks/useNotifications';

// Optional: notification count
// const notificationCount = 3;

export function EmployerTopBar() {
  const {
    data: profile,
    loading: isPending,
    error,
  } = useGetEmployerProfile();
  const company = profile?.company;
  const canPostJob = Boolean(company?.id) && !isPending;

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
  } = useNotifications();

  return (
    <header
      className={cn(
        'w-full',
        'px-6 md:px-8 py-4',
        'bg-white',
        'border-b border-[#d6ddeb]'
      )}
    >
      <div className="flex items-center justify-between">
        {/* Left side - Company logo + name or Not Affiliated */}
        <div className="flex items-center gap-4">
          {/* Company logo or placeholder */}
          <div className="h-12 w-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 caption-caption-1-medium">
            {company?.logoUrl ? (
              <img
                src={company.logoUrl}
                alt={company.name}
                className="h-12 w-12 rounded-full object-cover"
              />
            ) : (
              <img
                src="https://placehold.co/48x48"
                alt="Company logo placeholder"
                className="h-12 w-12 rounded-full object-cover"
              />
            )}
          </div>

          {/* Company name or Not Affiliated + Register link or Error */}
          <div className="flex flex-col items-start">
            <span className="label-label-2-regular text-[var(--text-secondary)]">
              Company
            </span>
            <div className="flex items-center gap-1.5">
              {error ? (
                <span className="heading-h6-semi-bold text-[#ff6550]">
                  Error loading profile
                </span>
              ) : (
                <span className="heading-h6-semi-bold text-[#25324b]">
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
                  className="ml-3 text-[#4640de] label-label-2-semi-bold hover:underline"
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
          <div className="relative" ref={notificationWrapperRef}>
            <button
              type="button"
              aria-label="Notifications"
              aria-expanded={isBellEnabled}
              aria-haspopup="menu"
              onClick={handleBellToggle}
              className={`relative flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
                isBellEnabled
                  ? 'bg-[#eef0ff] text-[#4640de]'
                  : 'text-[#25324b] hover:bg-[#f8fafc] hover:text-[#4640de]'
              }`}
            >
              <Bell className="h-5 w-5" strokeWidth={1.8} />
              {unreadCount > 0 && (
                <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#ff6550] px-0.5 caption-caption-2-medium text-white">
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
                  className="fixed inset-0 z-40 bg-black/10 sm:hidden"
                />

                <div className="fixed inset-x-2 top-[72px] z-50 rounded-xl border border-[#d6ddeb] bg-white shadow-[0_12px_28px_rgba(37,50,75,0.14)] sm:absolute sm:inset-x-auto sm:right-0 sm:top-12 sm:w-[360px]">
                  <div className="border-b border-[#eef1f6] px-4 py-3">
                    <p className="heading-h6-semi-bold text-[#25324b]">
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
                          href={notification.href}
                          onClick={closeNotificationMenu}
                          className="flex gap-3 px-4 py-3 transition-colors hover:bg-[#f8fafc]"
                        >
                          <span
                            className={`mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full ${
                              notification.unread
                                ? 'bg-[#4640de]'
                                : 'bg-[#d6ddeb]'
                            }`}
                          />
                          <div className="min-w-0">
                            <p className="line-clamp-2 text-sm text-[#25324b]">
                              {notification.title}
                            </p>
                            <p className="mt-1 text-xs text-[#7c8493]">
                              {formatNotificationTime(notification.createdAt)}
                            </p>
                          </div>
                        </Link>
                      </li>
                    ))}

                    {hasMoreNotifications && (
                      <li className="px-4 py-2 text-center text-xs text-[#7c8493]">
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
