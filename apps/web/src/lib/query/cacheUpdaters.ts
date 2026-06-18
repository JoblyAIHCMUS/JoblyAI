// apps/web/src/lib/query/cacheUpdaters.ts
import type { InfiniteData } from '@tanstack/react-query';
import type { ChatSummary, ChatMessage } from '@/api-client/messages/types';

interface NewMessageEvent {
  chatId: string;
  messageId: string;
  senderId: string;
  content: string;
  timestamp: string;
}

export function applyNewMessageToSummary(
  old: ChatSummary[] | undefined,
  msg: NewMessageEvent
): ChatSummary[] | undefined {
  if (!old) return undefined;
  const updated = old.map((c) =>
    c.participantId === msg.senderId
      ? {
          ...c,
          latestMessage: msg.content,
          lastMessageAt: msg.timestamp,
          hasUnread: true,
        }
      : c
  );
  return updated.sort((a, b) => {
    if (a.participantId === msg.senderId) return -1;
    if (b.participantId === msg.senderId) return 1;
    return (
      new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
    );
  });
}

export function applyMessageReadToSummary(
  old: ChatSummary[] | undefined,
  readBy: string
): ChatSummary[] | undefined {
  if (!old) return undefined;
  return old.map((c) =>
    c.participantId === readBy ? { ...c, hasUnread: false } : c
  );
}

export function applyMarkReadToSummary(
  old: ChatSummary[] | undefined,
  chatId: string
): ChatSummary[] | undefined {
  if (!old) return undefined;
  return old.map((c) => (c.chatId === chatId ? { ...c, hasUnread: false } : c));
}

const FIVE_SECONDS_MS = 5_000;

export function applyNewMessageToHistory(
  old: InfiniteData<ChatMessage[]> | undefined,
  msg: NewMessageEvent
): InfiniteData<ChatMessage[]> | undefined {
  if (!old || !old.pages.length) return old;
  const first = old.pages[0];
  if (first.some((m) => m.messageId === msg.messageId)) return old;
  const msgTime = new Date(msg.timestamp).getTime();
  const localIdx = first.findIndex(
    (m) =>
      m.messageId.startsWith('local-') &&
      m.senderId === msg.senderId &&
      m.content === msg.content &&
      Math.abs(new Date(m.timestamp).getTime() - msgTime) < FIVE_SECONDS_MS
  );
  const next =
    localIdx >= 0
      ? [
          ...first.slice(0, localIdx),
          ...first.slice(localIdx + 1),
          {
            messageId: msg.messageId,
            senderId: msg.senderId,
            content: msg.content,
            timestamp: msg.timestamp,
          },
        ]
      : [
          ...first,
          {
            messageId: msg.messageId,
            senderId: msg.senderId,
            content: msg.content,
            timestamp: msg.timestamp,
          },
        ];
  return { pages: [next, ...old.pages.slice(1)], pageParams: old.pageParams };
}
