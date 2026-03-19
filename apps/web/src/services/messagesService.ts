import { apiClient } from '@/lib/api';

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

/**
 * Fetch conversations summary for the current user
 */
export async function getChatSummary(userId: string): Promise<ChatSummary[]> {
  try {
    const response = await apiClient.get(`/chats/summary`, {
      params: { userId },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching chat summary:', error);
    throw error;
  }
}

/**
 * Fetch message history for a specific conversation
 */
export async function getChatHistory(
  friendId: string,
  limit = 50
): Promise<ChatMessage[]> {
  try {
    const response = await apiClient.get(`/chats/history/${friendId}`, {
      params: { limit },
    });
    return response.data.messages || [];
  } catch (error) {
    console.error('Error fetching chat history:', error);
    throw error;
  }
}

/**
 * Mark a conversation as read
 */
export async function markChatRead(friendId: string): Promise<void> {
  try {
    await apiClient.post(`/chats/read/${friendId}`);
  } catch (error) {
    console.error('Error marking chat as read:', error);
    throw error;
  }
}

/**
 * Initialize a new conversation
 */
export async function initConversation(friendId: string): Promise<void> {
  try {
    await apiClient.post(`/chats/init/${friendId}`);
  } catch (error) {
    console.error('Error initializing conversation:', error);
    throw error;
  }
}
