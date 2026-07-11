'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Bell, Menu, X, CheckCheck } from 'lucide-react';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { usePageTitle } from '@/contexts/page-title-context';
import { useNotifications } from '@/hooks/useNotifications';
import { useCandidateProfileContext } from '@/api-hook/candidate';
import { getInitials } from '@/lib/utils';

export function CandidateTopBar() {
  const { title: pageTitle } = usePageTitle();
  const { data: candidateProfile } = useCandidateProfileContext();

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
    handleMarkAllAsRead,
    handleDeleteNotification,
  } = useNotifications();

  const fullName = candidateProfile?.name;
  const email = candidateProfile?.email;
  const initials = getInitials(fullName || 'Candidate');
  const avatarUrl = candidateProfile?.avatarUrl;
  const [avatarError, setAvatarError] = useState(false);
  const showAvatarFallback = !avatarUrl || avatarError;

  return (
    <>
      <header className="flex items-center justify-between border-b border-[#d6ddeb] bg-white px-3 py-3 sm:px-4 sm:py-4 md:px-8 md:py-6">
        <div className="flex items-center gap-3">
          <SidebarTrigger className="h-9 w-9 md:hidden">
            <Menu className="h-6 w-6" />
          </SidebarTrigger>
          <h1 className="font-[family-name:var(--family-primary)] text-[20px] font-semibold leading-7 tracking-[-0.15px] text-[#25324b] sm:text-[24px] md:text-[40px] md:leading-[48px]">
            {pageTitle || 'Dashboard'}
          </h1>
        </div>

        <div className="flex items-center gap-3 md:gap-8">
          <Link
            href="/candidate/profile"
            className="flex items-center gap-4 hover:opacity-80 transition-opacity"
          >
            {showAvatarFallback ? (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 font-[family-name:var(--family-primary)] text-sm font-semibold leading-none text-indigo-700 cursor-pointer">
                {initials}
              </div>
            ) : (
              <img
                src={avatarUrl}
                alt={fullName}
                className="h-12 w-12 rounded-full object-cover cursor-pointer"
                onError={() => setAvatarError(true)}
              />
            )}

            <div className="min-w-0 hidden md:block ">
              <p className="truncate font-[family-name:var(--family-primary)] text-[20px] font-medium leading-6 text-[#25324b]">
                {fullName}
              </p>
              <p className="truncate text-sm text-[#7c8493]">{email}</p>
            </div>
          </Link>

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
                <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#ff6550] px-0.5 text-[10px] font-bold leading-none text-white">
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
                  <div className="flex items-center justify-between border-b border-[#eef1f6] px-4 py-3">
                    <p className="font-[family-name:var(--family-primary)] text-lg font-semibold text-[#25324b]">
                      Notifications
                    </p>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllAsRead}
                        className="flex items-center gap-1.5 text-xs font-medium text-[#4640de] transition-colors hover:text-[#3731bb]"
                      >
                        <CheckCheck className="h-3.5 w-3.5" />
                        Mark all as read
                      </button>
                    )}
                  </div>

                  <ul
                    className="max-h-[calc(100vh-180px)] overflow-auto py-2 sm:max-h-[360px]"
                    onScroll={handleNotificationScroll}
                  >
                    {visibleNotifications.length === 0 ? (
                      <li className="px-4 py-8 text-center text-sm text-[#7c8493]">
                        No notifications yet
                      </li>
                    ) : (
                      visibleNotifications.map((notification) => (
                        <li
                          key={notification.id}
                          className="group relative transition-colors hover:bg-[#f8fafc]"
                        >
                          <Link
                            href={notification.link || '#'}
                            onClick={() => {
                              handleMarkAsRead(notification.id);
                              closeNotificationMenu();
                            }}
                            className="flex gap-3 px-4 py-3 pr-10"
                          >
                            <span
                              className={`mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full ${
                                !notification.isRead
                                  ? 'bg-[#4640de]'
                                  : 'bg-[#d6ddeb]'
                              }`}
                            />
                            <div className="min-w-0">
                              <p
                                className={`line-clamp-2 text-sm ${
                                  !notification.isRead
                                    ? 'font-medium text-[#25324b]'
                                    : 'text-[#7c8493]'
                                }`}
                              >
                                {notification.content}
                              </p>
                              <p className="mt-1 text-xs text-[#7c8493]">
                                {formatNotificationTime(notification.createdAt)}
                              </p>
                            </div>
                          </Link>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleDeleteNotification(notification.id);
                            }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-[#7c8493] opacity-0 transition-all hover:bg-[#f1f3f9] hover:text-[#ff6550] group-hover:opacity-100"
                            aria-label="Delete notification"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </li>
                      ))
                    )}

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
        </div>
      </header>
    </>
  );
}
