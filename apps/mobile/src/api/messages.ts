import { apiClient } from './config';
import { ChatSummary } from '../types/message';

export async function getChatSummary(userId: string): Promise<ChatSummary[]> {
  const response = await apiClient.get<ChatSummary[]>('/chats/summary', { params: { userId } });
  return response.data;
}
