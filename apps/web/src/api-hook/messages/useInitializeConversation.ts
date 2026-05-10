import { useCallback, useState } from 'react';
import { initConversation, getChatSummary } from '@/api-client/messages';

interface UseInitializeConversationOptions {
  onSuccess?: (chatId: string) => void;
  onError?: (error: unknown) => void;
}

/**
 * Hook for initializing or retrieving a conversation with a recruiter.
 * If conversation already exists, returns the chatId.
 * If not, creates a new conversation and returns the chatId.
 */
export function useInitializeConversation(
  options?: UseInitializeConversationOptions
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown | null>(null);

  const initChat = useCallback(
    async (userId: string, recruiterId: string): Promise<string> => {
      setLoading(true);
      setError(null);
      try {
        // First, fetch existing conversations to check if one already exists
        const existingConversations = await getChatSummary(userId);
        const existingChat = existingConversations.find(
          (conv) => conv.participantId === recruiterId
        );

        // If conversation exists, return its chatId
        if (existingChat) {
          options?.onSuccess?.(existingChat.chatId);
          return existingChat.chatId;
        }

        // If not, create a new conversation
        await initConversation(recruiterId);

        // Fetch updated conversations to get the new chatId
        const updatedConversations = await getChatSummary(userId);
        const newChat = updatedConversations.find(
          (conv) => conv.participantId === recruiterId
        );

        if (!newChat) {
          throw new Error('Failed to initialize conversation');
        }

        options?.onSuccess?.(newChat.chatId);
        return newChat.chatId;
      } catch (err: unknown) {
        setError(err);
        options?.onError?.(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [options]
  );

  return {
    loading,
    error,
    initChat,
  };
}
