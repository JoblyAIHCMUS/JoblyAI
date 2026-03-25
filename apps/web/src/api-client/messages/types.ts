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
  senderName: string;
  senderAvatar: string;
  content: string;
  timestamp: Date;
  isOwn: boolean; // Whether the message is from the current user
}

export interface SendMessageRequest {
  recipientId: string;
  text: string;
}

export interface SendMessageResponse {
  success: boolean;
  message?: ChatMessage;
}
