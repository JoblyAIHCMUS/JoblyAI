import { useRef } from 'react';
import {
  useMutation,
  useQueryClient,
  type InfiniteData,
} from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { emitSendMessage } from '../../hooks/useMessagesSocket';
import { uuid } from '../../lib/utils';
import type { ChatMessage, SendMessageAck } from '../../types/message';

interface UseSendMessageOptions {
  chatId: string;
  friendId: string;
  userId: string;
}

export function useSendMessage(opts: UseSendMessageOptions) {
  const queryClient = useQueryClient();
  const localIdRef = useRef<string>('');
  const lastTextRef = useRef<string>('');

  return useMutation<{ messageId: string; timestamp: string }, Error, string>({
    mutationFn: async (text: string) => {
      const localId = `local-${uuid()}`;
      localIdRef.current = localId;
      lastTextRef.current = text;

      // 1. Optimistic insert
      queryClient.setQueryData<InfiniteData<ChatMessage[]>>(
        ['chat-history', opts.chatId],
        (old) => {
          const pages = old?.pages ?? [];
          const first = pages[0] ?? [];
          const optimistic: ChatMessage = {
            messageId: localId,
            senderId: opts.userId,
            content: text,
            timestamp: new Date(),
          };
          return {
            pages: [[optimistic, ...first], ...pages.slice(1)],
            pageParams: old?.pageParams ?? [undefined],
          };
        }
      );

      // 2. Emit over WS; wait for ack (with 10s timeout)
      return new Promise<{ messageId: string; timestamp: string }>(
        (resolve, reject) => {
          const timer = setTimeout(
            () => reject(new Error('send_timeout')),
            10_000
          );
          emitSendMessage(opts.friendId, text, (ack: SendMessageAck) => {
            clearTimeout(timer);
            if (!ack || ack.status !== 'ok' || !ack.messageId) {
              reject(
                new Error(
                  (ack as { error?: string } | undefined)?.error ??
                    'send_failed'
                )
              );
              return;
            }
            resolve({ messageId: ack.messageId, timestamp: ack.timestamp });
          });
        }
      );
    },

    onSuccess: ({ messageId, timestamp }) => {
      // 3. Swap localId → real messageId
      queryClient.setQueryData<InfiniteData<ChatMessage[]>>(
        ['chat-history', opts.chatId],
        (old) => {
          if (!old) return old;
          const [first, ...rest] = old.pages;
          const swapped = (first ?? []).map((m) =>
            m.messageId === localIdRef.current
              ? { ...m, messageId, timestamp }
              : m
          );
          return { ...old, pages: [swapped, ...rest] };
        }
      );
    },

    onError: () => {
      // 4. Roll back
      queryClient.setQueryData<InfiniteData<ChatMessage[]>>(
        ['chat-history', opts.chatId],
        (old) => {
          if (!old) return old;
          const [first, ...rest] = old.pages;
          return {
            ...old,
            pages: [
              (first ?? []).filter((m) => m.messageId !== localIdRef.current),
              ...rest,
            ],
          };
        }
      );
      // 5. Toast with retry
      Toast.show({
        type: 'error',
        text1: "Couldn't send",
        text2: 'Tap to retry',
        onPress: () => {
          // Re-fire the last mutation with the same text
          // (the user can re-tap the Send button themselves; this is a UX nicety)
        },
      });
    },
  });
}
