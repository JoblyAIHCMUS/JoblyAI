export interface Conversation {
  chatId: string;
  participantId: string;
  name: string | null;
  role: string | null;
  avatar: string | null;
  lastMessage: string | null;
  timestamp: string;
  unread: boolean;
  isActive: boolean;
  lastMessageAt: string | Date;
}

export interface Message {
  messageId: string;
  senderId: string;
  sender: string;
  senderAvatar: string;
  isSent: boolean;
  content: string;
  timestamp: string | Date;
  timestamp24: string;
  showDateSeparator?: boolean;
  dateLabel?: string;
}
