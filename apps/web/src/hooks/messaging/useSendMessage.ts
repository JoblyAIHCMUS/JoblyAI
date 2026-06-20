// apps/web/src/hooks/messaging/useSendMessage.ts
import { useRef } from 'react';
import {
  useMutation,
  useQueryClient,
  type InfiniteData,
} from '@tanstack/react-query';
import { emitSendMessage } from '@/hooks/useMessagesSocket';
import type { ChatMessage, SendMessageAck } from '@/api-client/messages/types';

interface Opts {
  chatId: string;
  friendId?: string;
  userId: string;
}

const TEN_SECONDS_MS = 10_000;

export function useSendMessage(opts: Opts) {
  const queryClient = useQueryClient();
  const localIdRef = useRef<string | null>(null);

  return useMutation<{ messageId: string; timestamp: string }, Error, string>({
    mutationFn: async (text) => {
      const { friendId } = opts;
      if (!friendId) throw new Error('friendId is required');
      return new Promise<{ messageId: string; timestamp: string }>(
        (resolve, reject) => {
          const timer = setTimeout(
            () => reject(new Error('send_timeout')),
            TEN_SECONDS_MS
          );
          emitSendMessage({ recipientId: friendId, text })
            .then((ack: SendMessageAck) => {
              clearTimeout(timer);
              if (!ack) {
                reject(new Error('unknown_send_error'));
                return;
              }
              if (ack.status !== 'ok') {
                reject(new Error(ack.error));
                return;
              }
              if (!ack.messageId) {
                reject(new Error('unknown_send_error'));
                return;
              }
              resolve({ messageId: ack.messageId, timestamp: ack.timestamp });
            })
            .catch((err) => {
              clearTimeout(timer);
              reject(err);
            });
        }
      );
    },
    onMutate: (text) => {
      const localId = `local-${crypto.randomUUID()}`;
      localIdRef.current = localId;
      queryClient.setQueryData<InfiniteData<ChatMessage[]>>(
        ['chat-history', opts.chatId],
        (old) => {
          if (!old) return old;
          const optimistic: ChatMessage = {
            messageId: localId,
            senderId: opts.userId,
            content: text,
            timestamp: new Date().toISOString(),
          };
          return {
            pages: [[optimistic, ...old.pages[0]], ...old.pages.slice(1)],
            pageParams: old.pageParams,
          };
        }
      );
    },
    onSuccess: ({ messageId, timestamp }) => {
      queryClient.setQueryData<InfiniteData<ChatMessage[]>>(
        ['chat-history', opts.chatId],
        (old) => {
          if (!old || !old.pages[0]) return old;
          const next = old.pages[0].map((m) =>
            m.messageId === localIdRef.current
              ? { ...m, messageId, timestamp }
              : m
          );
          return {
            pages: [next, ...old.pages.slice(1)],
            pageParams: old.pageParams,
          };
        }
      );
      localIdRef.current = null;
    },
    onError: () => {
      const localId = localIdRef.current;
      if (localId) {
        queryClient.setQueryData<InfiniteData<ChatMessage[]>>(
          ['chat-history', opts.chatId],
          (old) => {
            if (!old || !old.pages[0]) return old;
            return {
              pages: [
                old.pages[0].map((m) =>
                  m.messageId === localId ? { ...m, failed: true } : m
                ),
                ...old.pages.slice(1),
              ],
              pageParams: old.pageParams,
            };
          }
        );
        localIdRef.current = null;
      }
    },
  });
}
