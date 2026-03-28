import { useCallback, useState } from 'react';
import { markChatRead } from '@/api-client/messages';

interface UseMarkChatReadOptions {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}

/**
 * Hook for marking a conversation as read
 */
export function useMarkChatRead(options?: UseMarkChatReadOptions) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown | null>(null);

  const markRead = useCallback(
    async (friendId: string) => {
      setLoading(true);
      setError(null);
      try {
        await markChatRead(friendId);
        options?.onSuccess?.();
      } catch (err: unknown) {
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
    loading,
    error,
    markRead,
  };
}
