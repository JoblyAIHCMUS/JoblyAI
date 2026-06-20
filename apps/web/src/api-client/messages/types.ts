export interface ChatSummary {
  chatId: string;
  participantId: string;
  participantName: string | null;
  participantRole: string | null;
  participantAvatar: string | null;
  latestMessage: string | null;
  hasUnread: boolean;
  lastMessageAt: string | Date;
  isActive: boolean;
}

export interface ChatMessage {
  messageId: string;
  senderId: string;
  senderAvatar?: string | null;
  senderName?: string | null;
  content: string;
  timestamp: string | Date;
  // UI-only optimistic state; never set by the server. Set to true by
  // useSendMessage.onError to flag an unsent optimistic message.
  failed?: boolean;
}

// Widened to match what the backend emits on the 'new_message' WS event.
// chatId and messageId were previously dropped — they're now required for the
// cache bus to de-dup by messageId. timestamp is ISO string (matches mobile).
export interface SocketChatMessage {
  chatId: string;
  messageId: string;
  senderId: string;
  content: string;
  timestamp: string;
}

// WS wire type for the 'new_message' event payload (alias of SocketChatMessage).
export type NewMessageEvent = SocketChatMessage;

export interface SendMessageRequest {
  recipientId: string;
  text: string;
}

// Matches the backend's send_message ack shape
// (apps/backend/src/app/messages/messages.gateway.ts:65-81).
// The previously-declared SendMessageResponse type was never constructed;
// replaced by this typed ack.
export type SendMessageAck =
  | { status: 'ok'; messageId: string; timestamp: string }
  | { status: 'error'; error: string };

// Matches the backend's mark_read ack shape.
export type MarkReadAck =
  | { status: 'ok'; lastReadAt: string }
  | { status: 'error'; error: string };

// WS wire type for the 'message_read' event payload.
export type MessageReadEvent = { friendId: string } | { by: string };
