import { UIEvent, useEffect, useRef, useState, useCallback } from 'react';

import { 
  useListNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  useDeleteNotification
} from '@/api-hook/notification';
import { Notification } from '@/types/notification';

function formatNotificationTime(createdAt: string) {
  const createdAtDate = new Date(createdAt);
  const createdAtTime = createdAtDate.getTime();

  if (Number.isNaN(createdAtTime)) {
    return 'Just now';
  }

  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - createdAtTime) / 60000);

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
  const { fetchNotifications } = useListNotifications();
  const { markAsRead } = useMarkNotificationRead();
  const { markAllAsRead } = useMarkAllNotificationsRead();
  const { removeNotification } = useDeleteNotification();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isBellEnabled, setIsBellEnabled] = useState(false);
  const [showNotificationMenu, setShowNotificationMenu] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [isLoading, setIsLoading] = useState(false);
  const notificationWrapperRef = useRef<HTMLDivElement>(null);

  const loadNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchNotifications();
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, [fetchNotifications]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

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

  const handleMarkAsRead = async (id: number) => {
    try {
      const result = await markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? result.notification : n))
      );
      setUnreadCount(result.unreadCount);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const result = await markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(result.unreadCount);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const handleDeleteNotification = async (id: number) => {
    try {
      const result = await removeNotification(id);
      setNotifications((prev) =>
        prev.filter((n) => n.id !== result.deletedId)
      );
      setUnreadCount(result.unreadCount);
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
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
    unreadCount,
    isBellEnabled,
    showNotificationMenu,
    notificationWrapperRef,
    isLoading,
    handleBellToggle,
    handleNotificationScroll,
    closeNotificationMenu,
    formatNotificationTime,
    handleMarkAsRead,
    handleMarkAllAsRead,
    handleDeleteNotification,
  };
}
