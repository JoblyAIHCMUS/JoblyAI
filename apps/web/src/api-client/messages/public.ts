import apiClient from '@/lib/api';
import { ChatSummary, ChatMessage } from '@/api-client/messages/types';

/**
 * Fetch conversations summary for the current user
 */
export async function getChatSummary(userId: string): Promise<ChatSummary[]> {
  try {
    const response = await apiClient.get<ChatSummary[]>('/chats/summary', {
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
    const response = await apiClient.get<{ messages: ChatMessage[] }>(
      `/chats/history/${friendId}`,
      {
        params: { limit },
      }
    );
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
