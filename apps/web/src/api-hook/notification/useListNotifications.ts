import { useCallback, useState } from 'react';
import { listNotifications, getUnreadCount } from '@/api-client/notification';
import { Notification } from '@/types/notification';

interface UseListNotificationsOptions {
  onSuccess?: (data: { notifications: Notification[]; unreadCount: number }) => void;
  onError?: (error: unknown) => void;
}

export function useListNotifications(options?: UseListNotificationsOptions) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [notifications, unreadData] = await Promise.all([
        listNotifications(),
        getUnreadCount(),
      ]);

      const result = {
        notifications,
        unreadCount: unreadData.count,
      };

      options?.onSuccess?.(result);
      return result;
    } catch (err) {
      setError(err);
      options?.onError?.(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [options]);

  return {
    fetchNotifications,
    loading,
    error,
  };
}