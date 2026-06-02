import { useCallback, useState } from 'react';
import { deleteNotification } from '@/api-client/notification';
import { DeleteNotificationResponse } from '@/types/notification';

interface UseDeleteNotificationOptions {
  onSuccess?: (data: DeleteNotificationResponse) => void;
  onError?: (error: unknown) => void;
}

export function useDeleteNotification(options?: UseDeleteNotificationOptions) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const removeNotification = useCallback(
    async (id: number) => {
      setLoading(true);
      setError(null);
      try {
        const result = await deleteNotification(id);
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
    removeNotification,
    loading,
    error,
  };
}
