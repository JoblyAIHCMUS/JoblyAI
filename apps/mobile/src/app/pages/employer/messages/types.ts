export interface Conversation {
  chatId: string;
  participantId: string;
  name: string;
  role: string | null;
  avatar: string | null;
  lastMessage: string;
  lastMessageAt: Date;
  unread: boolean;
  isActive: boolean;
}
