import { useQuery } from '@tanstack/react-query';
import { getChatSummary } from '../../api/messages';

export function useChatSummary(userId: string | undefined) {
  return useQuery({
    queryKey: ['chat-summary', userId],
    queryFn: () => {
      if (!userId) {
        throw new Error('userId is required');
      }
      return getChatSummary(userId);
    },
    enabled: !!userId,
    staleTime: 30_000,
  });
}
