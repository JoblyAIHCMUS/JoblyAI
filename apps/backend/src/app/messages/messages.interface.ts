export interface ChatStatusResponse {
  chatId: string;
  latestMessage?: string;
  hasUnread: boolean;
}

export interface ChatSummaryResponse {
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

export interface ChatHistoryResponse {
  messages: {
    messageId: string;
    senderId: string;
    content: string;
    timestamp: Date;
  }[];
}
