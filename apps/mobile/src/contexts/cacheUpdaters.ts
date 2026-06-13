import type {
  ChatSummary,
  ChatMessage,
  NewMessageEvent,
} from '../types/message';
import type { InfiniteData } from '@tanstack/react-query';

export function applyNewMessageToSummary(
  old: ChatSummary[] | undefined,
  msg: NewMessageEvent
): ChatSummary[] {
  if (!old) return [];
  const next = old.map((c) =>
    c.participantId === msg.senderId
      ? {
          ...c,
          latestMessage: msg.content,
          lastMessageAt: msg.timestamp,
          hasUnread: true,
        }
      : c
  );
  return [...next].sort((a, b) => {
    if (a.participantId === msg.senderId) return -1;
    if (b.participantId === msg.senderId) return 1;
    return (
      new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
    );
  });
}

export function applyNewMessageToHistory(
  old: InfiniteData<ChatMessage[]> | undefined,
  msg: NewMessageEvent
): InfiniteData<ChatMessage[]> | undefined {
  if (!old || old.pages.length === 0) return old;
  const first = old.pages[0];
  // De-dup by real messageId (catches sender-self-echo and reconnect storms)
  if (first.some((m) => m.messageId === msg.messageId)) return old;
  // De-dup against pending localId entries by content+sender+time-window
  const msgTime = new Date(msg.timestamp).getTime();
  const localIdx = first.findIndex(
    (m) =>
      m.messageId.startsWith('local-') &&
      m.senderId === msg.senderId &&
      m.content === msg.content &&
      Math.abs(new Date(m.timestamp).getTime() - msgTime) < 5_000
  );
  const realMessage: ChatMessage = {
    messageId: msg.messageId,
    senderId: msg.senderId,
    content: msg.content,
    timestamp: msg.timestamp,
  };
  if (localIdx >= 0) {
    const cleaned = first.filter((_, i) => i !== localIdx);
    return {
      ...old,
      pages: [[...cleaned, realMessage], ...old.pages.slice(1)],
    };
  }
  return { ...old, pages: [[...first, realMessage], ...old.pages.slice(1)] };
}
