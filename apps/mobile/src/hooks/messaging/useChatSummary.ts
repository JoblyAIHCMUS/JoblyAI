import { useQuery } from '@tanstack/react-query';
import { getChatSummary } from '../../api/messages';

export function useChatSummary(userId: string | undefined) {
  return useQuery({
    queryKey: ['chat-summary', userId],
    queryFn: () => getChatSummary(userId!),
    enabled: !!userId,
    staleTime: 30_000,
  });
}
