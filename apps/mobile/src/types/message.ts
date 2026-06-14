// REST API types (matches the server's ChatSummaryResponse)

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

// REST API types (matches the server's ChatHistoryResponse)

export interface ChatMessage {
  messageId: string;
  senderId: string;
  senderAvatar?: string | null;
  senderName?: string | null;
  content: string;
  timestamp: string | Date;
}

// WebSocket wire types

export interface NewMessageEvent {
  chatId: string;
  messageId: string;
  senderId: string;
  content: string;
  timestamp: string;
}

export type MessageReadEvent = { friendId: string } | { by: string };

export interface SendMessageRequest {
  recipientId: string;
  text: string;
}

export type SendMessageAck =
  | { status: 'ok'; messageId: string; timestamp: string }
  | { status: 'error'; error: string };

export type MarkReadAck =
  | { status: 'ok'; lastReadAt: string }
  | { status: 'error'; error: string };

export interface ChatHistoryResponse {
  messages: ChatMessage[];
}
