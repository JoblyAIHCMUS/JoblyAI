import { apiClient } from './config';
import type { ChatHistoryResponse, ChatSummary } from '../types/message';

export async function getChatSummary(userId: string): Promise<ChatSummary[]> {
  const response = await apiClient.get<ChatSummary[]>('/chats/summary', {
    params: { userId },
  });
  return response.data;
}

export async function getChatHistory(friendId: string, limit = 50): Promise<ChatHistoryResponse> {
  const response = await apiClient.get<ChatHistoryResponse>(`/chats/history/${friendId}`, {
    params: { limit },
  });
  return response.data;
}

export async function initConversation(friendId: string): Promise<{ chatId: string }> {
  const response = await apiClient.post<{ chatId: string }>(`/chats/init/${friendId}`);
  return response.data;
}
