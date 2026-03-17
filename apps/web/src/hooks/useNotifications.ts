import { UIEvent, useEffect, useRef, useState } from 'react';

import { notificationService } from '@/services/notificationService';

function formatNotificationTime(createdAt: string) {
  const createdAtDate = new Date(createdAt);
  const now = new Date();
  const diffInMinutes = Math.floor(
    (now.getTime() - createdAtDate.getTime()) / 60000
  );

  if (diffInMinutes < 1) {
    return 'Just now';
  }

  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    year: 'numeric',
  }).format(createdAtDate);
}

export function useNotifications() {
  const PAGE_SIZE = 7;
  const notifications = notificationService.getCandidateNotifications();
  const [isBellEnabled, setIsBellEnabled] = useState(false);
  const [showNotificationMenu, setShowNotificationMenu] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const notificationWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationWrapperRef.current &&
        !notificationWrapperRef.current.contains(event.target as Node)
      ) {
        setShowNotificationMenu(false);
        setIsBellEnabled(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleBellToggle = () => {
    const nextState = !isBellEnabled;
    setIsBellEnabled(nextState);
    setShowNotificationMenu(nextState);
    if (nextState) {
      setVisibleCount(PAGE_SIZE);
    }
  };

  const closeNotificationMenu = () => {
    setShowNotificationMenu(false);
    setIsBellEnabled(false);
  };

  const visibleNotifications = notifications.slice(0, visibleCount);
  const hasMoreNotifications = visibleCount < notifications.length;

  const handleNotificationScroll = (event: UIEvent<HTMLUListElement>) => {
    if (!hasMoreNotifications) {
      return;
    }

    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
    const isNearBottom = scrollTop + clientHeight >= scrollHeight - 24;

    if (isNearBottom) {
      setVisibleCount((prev) =>
        Math.min(prev + PAGE_SIZE, notifications.length)
      );
    }
  };

  return {
    notifications,
    visibleNotifications,
    hasMoreNotifications,
    isBellEnabled,
    showNotificationMenu,
    notificationWrapperRef,
    handleBellToggle,
    handleNotificationScroll,
    closeNotificationMenu,
    formatNotificationTime,
  };
}
