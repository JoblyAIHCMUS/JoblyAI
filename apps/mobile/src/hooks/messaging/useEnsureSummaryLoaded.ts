import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { ChatSummary } from '../../types/message';

/**
 * If the `['chat-summary', userId]` cache has been loaded but does not contain
 * `chatId`, refetch it once. Bounded to one refetch to prevent infinite loops
 * (e.g. if the user was removed from the conversation).
 */
export function useEnsureSummaryLoaded(
  summary: ChatSummary | undefined,
  userId: string | undefined
): void {
  const queryClient = useQueryClient();
  const didRefetchRef = useRef(false);

  useEffect(() => {
    if (summary || !userId || didRefetchRef.current) return;
    const cached = queryClient.getQueryData<ChatSummary[]>([
      'chat-summary',
      userId,
    ]);
    if (cached) {
      // We had a cache, but the target chat isn't in it — refetch once
      didRefetchRef.current = true;
      queryClient.invalidateQueries({ queryKey: ['chat-summary', userId] });
    }
  }, [summary, userId, queryClient]);
}
