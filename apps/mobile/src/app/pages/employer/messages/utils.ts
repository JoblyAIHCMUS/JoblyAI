import { ChatSummary } from '../../../../types/message';
import { Conversation } from './types';

export function mapChatSummaryToConversation(chat: ChatSummary): Conversation {
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

export function formatTimestamp(date: Date): string {
  if (Number.isNaN(date.getTime())) return 'Now';
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
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
