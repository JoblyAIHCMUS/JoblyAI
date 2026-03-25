import { useState } from 'react';
import { ChatMessage, getChatHistory } from '@/api-client/messages';

interface UseChatHistoryOptions {
  onSuccess?: (data: ChatMessage[]) => void;
  onError?: (error: unknown) => void;
}

/**
 * Hook for fetching message history for a specific conversation
 */
export function useChatHistory(options?: UseChatHistoryOptions) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown | null>(null);
  const [data, setData] = useState<ChatMessage[] | null>(null);

  const fetchChatHistory = async (friendId: string, limit = 50) => {
    setLoading(true);
    setError(null);
    try {
      const result = await getChatHistory(friendId, limit);
      setData(result);
      options?.onSuccess?.(result);
      return result;
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
    data,
    fetchChatHistory,
  };
}
