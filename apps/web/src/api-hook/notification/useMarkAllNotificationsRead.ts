import { useCallback, useState } from 'react';
import { markAllNotificationsAsRead } from '@/api-client/notification';
import { MarkAllNotificationsAsReadResponse } from '@/types/notification';

interface UseMarkAllNotificationsReadOptions {
  onSuccess?: (data: MarkAllNotificationsAsReadResponse) => void;
  onError?: (error: unknown) => void;
}

export function useMarkAllNotificationsRead(
  options?: UseMarkAllNotificationsReadOptions
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const markAllAsRead = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await markAllNotificationsAsRead();
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
    markAllAsRead,
    loading,
    error,
  };
}
