import { useCallback, useState } from 'react';
import { getChatSummary } from '../api/messages';
import { ChatSummary } from '../types/message';

export function useGetChatSummary() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [data, setData] = useState<ChatSummary[] | null>(null);

  const fetchChatSummary = useCallback(async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await getChatSummary(userId);
      setData(result);
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { fetchChatSummary, loading, error, data };
}
