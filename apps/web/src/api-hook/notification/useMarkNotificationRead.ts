import { useCallback, useState } from 'react';
import { markNotificationAsRead } from '@/api-client/notification';
import { MarkNotificationAsReadResponse } from '@/types/notification';

interface UseMarkNotificationReadOptions {
  onSuccess?: (data: MarkNotificationAsReadResponse) => void;
  onError?: (error: unknown) => void;
}

export function useMarkNotificationRead(
  options?: UseMarkNotificationReadOptions
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const markAsRead = useCallback(
    async (id: number) => {
      setLoading(true);
      setError(null);
      try {
        const result = await markNotificationAsRead(id);
        options?.onSuccess?.(result);
        return result;
      } catch (err) {
        setError(err);
        options?.onError?.(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [options]
  );

  return {
    markAsRead,
    loading,
    error,
  };
}
