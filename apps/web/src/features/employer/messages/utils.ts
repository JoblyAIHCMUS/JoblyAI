/**
 * Determines if two dates are different days
 */
export function isNewDate(prevDate: Date | null, currentDate: Date): boolean {
  if (!prevDate) return true;

  const prevDateOnly = new Date(prevDate);
  prevDateOnly.setHours(0, 0, 0, 0);

  const currentDateOnly = new Date(currentDate);
  currentDateOnly.setHours(0, 0, 0, 0);

  return prevDateOnly.getTime() !== currentDateOnly.getTime();
}

/**
 * Formats a date as a human-readable label for message grouping
 * Returns "Today", "Yesterday", or formatted date like "Mar 27"
 */
export function getDateLabel(date: Date): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const messageDate = new Date(date);
  messageDate.setHours(0, 0, 0, 0);

  if (messageDate.getTime() === today.getTime()) {
    return 'Today';
  }

  if (messageDate.getTime() === yesterday.getTime()) {
    return 'Yesterday';
  }

  // Format as "Mar 27"
  return messageDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

import type { ChatSummary, ChatMessage } from '@/api-client/messages/types';
import type { Conversation, Message } from './types';

/**
 * Map a ChatSummary from the API to the frontend Conversation shape used by
 * the messages page. Centralized here so both the employer and candidate
 * pages share the same mapping.
 */
export function mapChatSummaryToConversation(summary: ChatSummary): Conversation {
  return {
    chatId: summary.chatId,
    participantId: summary.participantId,
    name: summary.participantName,
    role: summary.participantRole,
    avatar: summary.participantAvatar || 'https://placehold.co/40x40',
    lastMessage: summary.latestMessage,
    timestamp: summary.lastMessageAt
      ? new Date(summary.lastMessageAt).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
        })
      : 'Now',
    unread: summary.hasUnread,
    isActive: false,
    lastMessageAt: summary.lastMessageAt,
  };
}

/**
 * Decorate raw ChatMessage rows with the UI fields the chat window needs
 * (avatar, formatted time, isSent, date separator). Sorts ASC so the chat
 * window can render oldest-first.
 */
export function withDateSeparators(
  messages: ChatMessage[],
  currentUserId: string,
  conversationName: string | null,
  conversationAvatar: string | null
): Message[] {
  const sorted = [...messages].sort(
    (a, b) =>
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
  return sorted.map((msg, index) => {
    const prevMsg = index > 0 ? sorted[index - 1] : null;
    const showDateSeparator = isNewDate(
      prevMsg ? new Date(prevMsg.timestamp) : null,
      new Date(msg.timestamp)
    );
    return {
      messageId: msg.messageId,
      senderId: msg.senderId,
      sender:
        msg.senderName ||
        (msg.senderId === currentUserId
          ? 'You'
          : conversationName || 'User'),
      senderAvatar: getSenderAvatar(
        msg.senderAvatar,
        msg.senderId,
        currentUserId,
        conversationAvatar
      ),
      isSent: msg.senderId === currentUserId,
      content: msg.content,
      timestamp: msg.timestamp,
      timestamp24: new Date(msg.timestamp).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      showDateSeparator,
      dateLabel: showDateSeparator
        ? getDateLabel(new Date(msg.timestamp))
        : undefined,
    };
  });
}

/**
 * Standardizes the sender avatar logic across the application.
 */
export function getSenderAvatar(
  msgAvatar: string | undefined | null,
  senderId: string,
  currentUserId: string,
  conversationAvatar: string | undefined | null
): string {
  // If we have a specific avatar for this message, use it
  if (msgAvatar) return msgAvatar;

  // Fallback based on who sent the message
  if (senderId === currentUserId) {
    return 'https://placehold.co/40x40'; // Fallback for current user
  }

  // Fallback for the participant
  return conversationAvatar || 'https://placehold.co/40x40';
}
