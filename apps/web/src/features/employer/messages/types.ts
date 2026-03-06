export interface Conversation {
  id: number;
  name: string;
  role: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unread: boolean;
  isActive: boolean;
}

export interface Message {
  id: number;
  sender: string;
  senderAvatar: string;
  isSent: boolean;
  content: string;
  timestamp: string;
  timestamp24: string;
}
