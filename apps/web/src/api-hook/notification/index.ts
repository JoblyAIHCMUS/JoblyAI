import { useCallback, useState } from 'react';
import {
  listNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from '@/api-client/notification';
import { NotificationsQuery } from '@/api-client/notification/types';

export function useNotificationsApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const fetchNotifications = useCallback(async (query?: NotificationsQuery) => {
    setLoading(true);
    setError(null);
    try {
      const result = await listNotifications(query);
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (id: number) => {
    try {
      return await markNotificationAsRead(id);
    } catch (err) {
      setError(err);
      throw err;
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      return await markAllNotificationsAsRead();
    } catch (err) {
      setError(err);
      throw err;
    }
  }, []);

  const removeNotification = useCallback(async (id: number) => {
    try {
      await deleteNotification(id);
    } catch (err) {
      setError(err);
      throw err;
    }
  }, []);

  return {
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    removeNotification,
    loading,
    error,
  };
}
