// apps/web/src/hooks/messaging/useEnsureSummaryLoaded.ts
import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { ChatSummary } from '@/api-client/messages/types';

// If `summary` is undefined (e.g. user landed on /employer/messages?candidateId=X
// with a cold ['chat-summary', userId] cache) AND the cache has any existing
// entry for this userId, invalidate once so the page picks up the missing
// conversation. A truly cold cache (no prior fetch) is a no-op — same
// documented edge case as the mobile version.
export function useEnsureSummaryLoaded(
  summary: ChatSummary | undefined,
  userId: string | undefined
) {
  const queryClient = useQueryClient();
  const didRefetchRef = useRef(false);

  useEffect(() => {
    if (summary) return;
    if (!userId) return;
    if (didRefetchRef.current) return;
    const existing = queryClient.getQueryData<ChatSummary[]>(['chat-summary', userId]);
    if (existing) {
      didRefetchRef.current = true;
      queryClient.invalidateQueries({ queryKey: ['chat-summary', userId] });
    }
  }, [summary, userId, queryClient]);
}
