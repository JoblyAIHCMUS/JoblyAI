export interface ChatStatusResponse {
  chatId: string;
  latestMessage?: string;
  hasUnread: boolean;
}

export interface ChatHistoryResponse {
  messages: {
    messageId: string;
    senderId: string;
    content: string;
    timestamp: Date;
  }[];
}