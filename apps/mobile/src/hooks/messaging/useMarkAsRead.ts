import { useMutation, useQueryClient } from '@tanstack/react-query';
import { emitMarkRead } from '../../hooks/useMessagesSocket';
import type { MarkReadAck } from '../../types/message';

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
        emitMarkRead(opts.friendId, (ack) => {
          if (ack.status === 'ok') resolve(ack);
          else reject(new Error(ack.error));
        });
      }),
    onSuccess: () => {
      // Optimistically clear the unread flag in the summary cache
      queryClient.setQueryData<unknown[] | undefined>(
        ['chat-summary', opts.userId],
        (old) => {
          if (!old) return old;
          return (old as { chatId: string; hasUnread: boolean }[]).map((c) =>
            c.chatId === opts.chatId ? { ...c, hasUnread: false } : c
          );
        }
      );
    },
  });
}
