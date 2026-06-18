// apps/web/src/hooks/messaging/useMarkAsRead.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { emitMarkRead } from '@/hooks/useMessagesSocket';
import { applyMarkReadToSummary } from '@/lib/query/cacheUpdaters';
import type { MarkReadAck, ChatSummary } from '@/api-client/messages/types';

interface Opts {
  chatId: string;
  friendId?: string;
  userId: string;
}

const TEN_SECONDS_MS = 10_000;

export function useMarkAsRead(opts: Opts) {
  const queryClient = useQueryClient();
  return useMutation<MarkReadAck, Error, void>({
    mutationFn: async () => {
      const { friendId } = opts;
      if (!friendId) throw new Error('friendId is required');
      return new Promise<MarkReadAck>((resolve, reject) => {
        const timer = setTimeout(
          () => reject(new Error('mark_read_timeout')),
          TEN_SECONDS_MS
        );
        emitMarkRead(friendId)
          .then((ack) => {
            clearTimeout(timer);
            if (!ack || ack.status !== 'ok') {
              reject(new Error(ack?.error ?? 'unknown_mark_read_error'));
              return;
            }
            resolve(ack);
          })
          .catch((err) => {
            clearTimeout(timer);
            reject(err);
          });
      });
    },
    onSuccess: () => {
      // Partial-key match — updates every ['chat-summary', *] entry regardless
      // of userId suffix. No invalidateQueries: would race Scylla's eventual
      // consistency and clobber the optimistic write
      // (see messaging-architecture.md §4 'markAsRead' caveat).
      queryClient.setQueriesData({ queryKey: ['chat-summary'] }, (old) =>
        applyMarkReadToSummary(old as ChatSummary[] | undefined, opts.chatId)
      );
    },
    onError: () => {
      // No user-facing feedback (matches mobile).
      // The cache self-heals on the next 'new_message' / 'message_read' WS event,
      // or on the next refetchOnReconnect / document.visibilitychange → visible invalidation.
    },
  });
}
