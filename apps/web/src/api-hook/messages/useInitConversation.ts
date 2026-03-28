import { useState } from 'react';
import { initConversation } from '@/api-client/messages';

interface UseInitConversationOptions {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}

/**
 * Hook for initializing a new conversation
 */
export function useInitConversation(options?: UseInitConversationOptions) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown | null>(null);

  const initChat = async (friendId: string) => {
    setLoading(true);
    setError(null);
    try {
      await initConversation(friendId);
      options?.onSuccess?.();
    } catch (err: unknown) {
      setError(err);
      options?.onError?.(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    initChat,
  };
}
