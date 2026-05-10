import { useCallback, useState } from 'react';
import { ChatSummary, getChatSummary } from '@/api-client/messages';

interface UseGetChatSummaryOptions {
  onSuccess?: (data: ChatSummary[]) => void;
  onError?: (error: unknown) => void;
}

/**
 * Hook for fetching chat summary for the current user
 */
export function useGetChatSummary(options?: UseGetChatSummaryOptions) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown | null>(null);
  const [data, setData] = useState<ChatSummary[] | null>(null);

  const fetchChatSummary = useCallback(
    async (userId: string) => {
      setLoading(true);
      setError(null);
      try {
        const result = await getChatSummary(userId);
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
    },
    [options]
  );

  return {
    loading,
    error,
    data,
    fetchChatSummary,
  };
}
