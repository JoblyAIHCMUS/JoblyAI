import { ChatMessage } from '../../../../types/message';
import { Conversation } from './types';

export interface Message extends ChatMessage {
  isSent: boolean;
  showDateSeparator?: boolean;
  dateLabel?: string;
}

export function mapChatSummaryToConversation(
  chat: import('../../../../types/message').ChatSummary
): Conversation {
  return {
    chatId: chat.chatId,
    participantId: chat.participantId,
    name: chat.participantName || 'Unknown',
    role: chat.participantRole,
    avatar: chat.participantAvatar || null,
    lastMessage: chat.latestMessage || '',
    lastMessageAt: new Date(chat.lastMessageAt),
    unread: chat.hasUnread,
    isActive: chat.isActive,
  };
}

export function mapChatHistoryToMessage(
  msg: ChatMessage,
  currentUserId: string
): Message {
  return {
    messageId: msg.messageId,
    senderId: msg.senderId,
    senderAvatar: msg.senderAvatar ?? null,
    senderName: msg.senderName ?? null,
    content: msg.content,
    timestamp: new Date(msg.timestamp),
    isSent: msg.senderId === currentUserId,
  };
}

export function formatTimestamp(date: Date): string {
  if (Number.isNaN(date.getTime())) return 'Now';
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function getDateLabel(d: Date): string {
  const today = new Date();
  if (sameDay(d, today)) return 'Today';
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (sameDay(d, yesterday)) return 'Yesterday';
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function withDateSeparators(messages: ChatMessage[]): Message[] {
  if (messages.length === 0) return [];
  return messages.map((m, i) => {
    const ts = new Date(m.timestamp);
    const prev = i > 0 ? new Date(messages[i - 1].timestamp) : null;
    const showDateSeparator = !prev || !sameDay(prev, ts);
    const base = mapChatHistoryToMessage(m, '');
    return {
      ...base,
      showDateSeparator,
      dateLabel: showDateSeparator ? getDateLabel(ts) : undefined,
    };
  });
}

export function filterBySearch(
  conversations: Conversation[],
  query: string
): Conversation[] {
  if (!query.trim()) return conversations;
  const q = query.toLowerCase();
  return conversations.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.lastMessage.toLowerCase().includes(q)
  );
}
