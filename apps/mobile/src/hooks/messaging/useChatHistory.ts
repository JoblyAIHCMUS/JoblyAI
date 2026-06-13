import { useInfiniteQuery } from '@tanstack/react-query';
import { getChatHistory } from '../../api/messages';
import type { ChatMessage } from '../../types/message';

export function useChatHistory(
  chatId: string | undefined,
  friendId: string | undefined
) {
  return useInfiniteQuery<ChatMessage[]>({
    queryKey: ['chat-history', chatId],
    queryFn: async ({ pageParam }) => {
      // pageParam is the cursor (the oldest messageId loaded so far) or undefined for first page
      const response = await getChatHistory(friendId!, 50);
      // The backend's `getChatHistory` returns messages in some order; the
      // server-side is responsible for cursor-based pagination in a future
      // iteration. For now we just return the first page.
      if (pageParam) {
        // Subsequent pages not yet supported server-side; return empty to stop
        return [];
      }
      return response.messages;
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: () => undefined, // disable pagination until server supports cursors
    enabled: !!chatId && !!friendId,
  });
}
