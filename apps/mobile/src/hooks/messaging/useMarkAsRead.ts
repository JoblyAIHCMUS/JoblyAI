import { useMutation, useQueryClient } from '@tanstack/react-query';
import { emitMarkRead, getOrCreateSocket } from '../../hooks/useMessagesSocket';
import { applyMarkReadToSummary } from '../../contexts/cacheUpdaters';
import type { ChatSummary, MarkReadAck } from '../../types/message';

interface UseMarkAsReadOptions {
  chatId: string;
  friendId: string;
  userId: string;
}

export function useMarkAsRead(opts: UseMarkAsReadOptions) {
  const queryClient = useQueryClient();
  return useMutation<MarkReadAck, Error, void>({
    mutationFn: () =>
      new Promise<MarkReadAck>((resolve, reject) => {
        // Safety net: a dead socket would otherwise leave this hanging forever.
        const timer = setTimeout(() => {
          console.log('[mark-read] timeout', {
            chatId: opts.chatId,
            connected: getOrCreateSocket().connected,
          });
          reject(new Error('mark_read_timeout'));
        }, 10_000);

        emitMarkRead(opts.friendId, (ack) => {
          clearTimeout(timer);
          console.log('[mark-read] ack', {
            chatId: opts.chatId,
            status: ack.status,
          });
          if (ack.status === 'ok') resolve(ack);
          else reject(new Error(ack.error));
        });
      }),
    onSuccess: () => {
      // Partial-key setQueriesData. No invalidateQueries: Scylla is
      // eventually consistent and an immediate refetch would clobber the write.
      queryClient.setQueriesData<ChatSummary[] | undefined>(
        { queryKey: ['chat-summary'] },
        (old) => {
          const prev = old?.find((c) => c.chatId === opts.chatId)?.hasUnread;
          const result = applyMarkReadToSummary(old, opts.chatId);
          const next = result?.find((c) => c.chatId === opts.chatId)?.hasUnread;
          console.log('[mark-read] cached', {
            chatId: opts.chatId,
            prev,
            next,
          });
          return result;
        }
      );
    },
    onError: (err) => {
      console.log('[mark-read] error', {
        chatId: opts.chatId,
        msg: err.message,
      });
    },
  });
}
