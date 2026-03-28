export interface ChatSummary {
  chatId: string;
  participantId: string;
  participantName: string | null;
  participantRole: string | null;
  participantAvatar: string | null;
  latestMessage: string | null;
  hasUnread: boolean;
  lastMessageAt: Date;
  isActive: boolean;
}

export interface ChatMessage {
  messageId: string;
  senderId: string;
  content: string;
  timestamp: Date;
}

export interface SocketChatMessage {
  senderId: string;
  content: string;
  timestamp: Date;
}

export interface SendMessageRequest {
  recipientId: string;
  text: string;
}

export interface SendMessageResponse {
  success: boolean;
  message?: ChatMessage;
}
