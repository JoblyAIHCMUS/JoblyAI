// apps/web/src/hooks/messaging/useChatHistory.ts
import { useInfiniteQuery } from '@tanstack/react-query';
import { getChatHistory } from '@/api-client/messages/public';
import type { ChatMessage } from '@/api-client/messages/types';

export function useChatHistory(
  chatId: string | undefined,
  friendId: string | undefined
) {
  return useInfiniteQuery<ChatMessage[], Error>({
    queryKey: ['chat-history', chatId],
    initialPageParam: undefined as undefined,
    queryFn: ({ pageParam }) => {
      if (pageParam) return Promise.resolve([] as ChatMessage[]);
      if (!friendId) return Promise.reject(new Error('friendId is required'));
      return getChatHistory(friendId, 50);
    },
    getNextPageParam: () => undefined,
    enabled: !!chatId && !!friendId,
  });
}
