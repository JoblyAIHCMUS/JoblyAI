import { apiClient } from './config';
import { ChatSummary } from '../types/message';

export async function getChatSummary(userId: string): Promise<ChatSummary[]> {
  const response = await apiClient.get<ChatSummary[]>('/chats/summary', {
    params: { userId },
  });
  return response.data;
}

/**
 * Initialize (or re-fetch) a conversation with the given candidate.
 * Matches the web's POST /chats/init/{candidateId}.
 */
export async function initConversation(candidateId: string): Promise<void> {
  await apiClient.post(`/chats/init/${candidateId}`);
}
