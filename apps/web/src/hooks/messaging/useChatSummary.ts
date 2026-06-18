// apps/web/src/hooks/messaging/useChatSummary.ts
import { useQuery } from '@tanstack/react-query';
import { getChatSummary } from '@/api-client/messages/public';
import type { ChatSummary } from '@/api-client/messages/types';

export function useChatSummary(userId: string | undefined) {
  return useQuery<ChatSummary[]>({
    queryKey: ['chat-summary', userId],
    queryFn: () => {
      if (!userId) throw new Error('userId is required');
      return getChatSummary(userId);
    },
    enabled: !!userId,
    staleTime: 30_000,
  });
}
