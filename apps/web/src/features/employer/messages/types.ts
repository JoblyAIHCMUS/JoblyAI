export interface Conversation {
  chatId: string;
  participantId: string;
  name: string;
  role: string;
  avatar: string;
  lastMessage?: string;
  timestamp: string;
  unread: boolean;
  isActive: boolean;
  lastMessageAt?: Date;
}

export interface Message {
  messageId: string;
  senderId: string;
  sender: string;
  senderAvatar: string;
  isSent: boolean;
  content: string;
  timestamp: Date;
  timestamp24: string;
}
