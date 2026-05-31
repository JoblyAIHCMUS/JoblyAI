'use client';

import { useEffect, useState, useCallback } from 'react';
import { useUser } from '@/hooks/useUser';
import { useGetChatSummary } from '@/api-hook/messages';
import { useSocket } from '@/contexts/socket-provider';

interface UseUnreadMessagesDotReturn {
  hasUnreadMessages: boolean;
  loading: boolean;
  error: unknown | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to track unread messages for the current employer
 * Fetches initial unread status and subscribes to real-time updates via WebSocket
 * Returns a boolean indicator for displaying unread message dot in sidebar
 */
export function useUnreadMessagesDot(): UseUnreadMessagesDotReturn {
  const { data: user } = useUser();
  const {
    fetchChatSummary,
    loading,
    error,
    data: chatSummaries,
  } = useGetChatSummary();
  const { onNewMessage, onMessageRead, activeChatId } = useSocket();
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);

  // Compute unread status from chat summaries
  const computeUnreadStatus = useCallback((summaries: typeof chatSummaries) => {
    if (!summaries || summaries.length === 0) {
      setHasUnreadMessages(false);
      return;
    }
    const hasUnread = summaries.some((chat) => chat.hasUnread);
    setHasUnreadMessages(hasUnread);
  }, []);

  // Initial load: fetch chat summary on mount
  useEffect(() => {
    if (user?.id) {
      fetchChatSummary(user.id).catch(() => {
        // Fail silently - default to false on error
        setHasUnreadMessages(false);
      });
    }
  }, [user?.id, fetchChatSummary]);

  // Update unread status when chat summaries change
  useEffect(() => {
    computeUnreadStatus(chatSummaries);
  }, [chatSummaries, computeUnreadStatus]);

  // Subscribe to real-time new messages
  useEffect(() => {
    const off = onNewMessage((message) => {
      // Ignore messages from the currently active chat
      if (activeChatId === message.senderId) {
        console.debug(
          `[useUnreadMessagesDot] Ignoring new message from active chat: ${message.senderId}`
        );
        return;
      }

      // When a new message arrives, immediately set unread indicator
      // eslint-disable-next-line no-console
      console.debug(
        '[useUnreadMessagesDot] onNewMessage fired, setting hasUnreadMessages=true'
      );
      setHasUnreadMessages(true);

      // Refetch summaries to update the sidebar with the latest message and unread status
      if (user?.id) {
        fetchChatSummary(user.id).catch(() => {
          /* fail silently */
        });
      }
    });
    return () => {
      off?.();
    };
  }, [onNewMessage, activeChatId]);

  // Subscribe to message read receipts
  useEffect(() => {
    const off = onMessageRead(() => {
      // When we receive a read receipt, refetch to get updated unread status
      // This handles the case where the user might have marked everything as read
      if (user?.id) {
        fetchChatSummary(user.id).catch(() => {
          // Fail silently
        });
      }
    });
    return () => {
      off?.();
    };
  }, [onMessageRead, user?.id, fetchChatSummary]);

  // Manual refetch function
  const refetch = useCallback(async () => {
    if (user?.id) {
      try {
        await fetchChatSummary(user.id);
      } catch {
        // Fail silently
        setHasUnreadMessages(false);
      }
    }
  }, [user?.id, fetchChatSummary]);

  return {
    hasUnreadMessages,
    loading,
    error,
    refetch,
  };
}
