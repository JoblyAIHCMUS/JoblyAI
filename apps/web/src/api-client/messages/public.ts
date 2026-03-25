import axios from 'axios';
import { ChatSummary, ChatMessage } from '@/api-client/messages/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

/**
 * Fetch conversations summary for the current user
 */
export async function getChatSummary(userId: string): Promise<ChatSummary[]> {
  try {
    const response = await axios.get<ChatSummary[]>(
      `${API_BASE_URL}/api/chats/summary`,
      {
        params: { userId },
        withCredentials: true,
      }
    );
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
    const response = await axios.get<{ messages: ChatMessage[] }>(
      `${API_BASE_URL}/api/chats/history/${friendId}`,
      {
        params: { limit },
        withCredentials: true,
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
    await axios.post(`${API_BASE_URL}/api/chats/read/${friendId}`, undefined, {
      withCredentials: true,
    });
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
    await axios.post(`${API_BASE_URL}/api/chats/init/${friendId}`, undefined, {
      withCredentials: true,
    });
  } catch (error) {
    console.error('Error initializing conversation:', error);
    throw error;
  }
}
