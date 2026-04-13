'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useUser } from '@/hooks/useUser';
import { useMessagesSocket } from '@/hooks/useMessagesSocket';
import { ConversationSidebar } from './ConversationSidebar';
import { ChatWindow } from './ChatWindow';
import { Conversation, Message } from './types';
import { ChatSummary } from '@/api-client/messages';
import { useGetChatSummary } from '@/api-hook/messages';

export default function EmployerMessagesPage() {
  const { data: currentUser, isPending: userLoading } = useUser();
  const { sendMessage, onNewMessage, onMessageRead } = useMessagesSocket();
  const { fetchChatSummary } = useGetChatSummary();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationsLoading, setConversationsLoading] = useState(false);

  // Refs for debounced conversation refetch
  const refetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const shouldRefetchAgainRef = useRef(false);

  // Fetch conversations on component mount
  useEffect(() => {
    const getConversations = async () => {
      if (!currentUser?.id) return;

      setConversationsLoading(true);
      try {
        const summaries = await fetchChatSummary(currentUser.id);

        // Transform backend response to frontend Conversation type
        const transformedConversations: Conversation[] = summaries.map(
          (summary: ChatSummary) => ({
            chatId: summary.chatId,
            participantId: summary.participantId,
            name: summary.participantName,
            role: summary.participantRole,
            avatar: summary.participantAvatar || 'https://placehold.co/40x40',
            lastMessage: summary.latestMessage,
            timestamp: summary.lastMessageAt
              ? new Date(summary.lastMessageAt).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : 'Now',
            unread: summary.hasUnread,
            isActive: false,
            lastMessageAt: summary.lastMessageAt,
          })
        );

        setConversations(transformedConversations);

        // Select first conversation by default if available and none is selected
        setSelectedConversation(
          (prev) => prev || transformedConversations[0] || null
        );
      } catch (error) {
        console.error('Error fetching conversations:', error);
      } finally {
        setConversationsLoading(false);
      }
    };

    getConversations();
  }, [currentUser?.id, fetchChatSummary]);

  // Refetch conversations with debounce to avoid excessive API calls
  // Uses a flag to track if another refetch was requested during the debounce period
  const refetchConversations = useCallback(async () => {
    if (!currentUser?.id) return;

    // Mark that a refetch was requested
    shouldRefetchAgainRef.current = true;

    // Clear any pending debounce timer
    if (refetchTimeoutRef.current) {
      clearTimeout(refetchTimeoutRef.current);
    }

    // Set debounce timer (500ms) before making API call
    refetchTimeoutRef.current = setTimeout(async () => {
      shouldRefetchAgainRef.current = false;

      try {
        const summaries = await fetchChatSummary(currentUser.id);
        const transformedConversations: Conversation[] = summaries.map(
          (summary: ChatSummary) => ({
            chatId: summary.chatId,
            participantId: summary.participantId,
            name: summary.participantName,
            role: summary.participantRole,
            avatar: summary.participantAvatar || 'https://placehold.co/40x40',
            lastMessage: summary.latestMessage,
            timestamp: summary.lastMessageAt
              ? new Date(summary.lastMessageAt).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : 'Now',
            unread: summary.hasUnread,
            isActive: false,
            lastMessageAt: summary.lastMessageAt,
          })
        );

        // ✨ Merge with current state to preserve locally-set unread statuses
        setConversations((prevConversations) =>
          transformedConversations.map((updated) => {
            const current = prevConversations.find(
              (c) => c.participantId === updated.participantId
            );
            // If current has unread=true and backend says unread=false, keep the local true
            // (message may not have synced to backend yet)
            if (current?.unread && !updated.unread) {
              console.log(
                `[refetch] Preserving unread status for ${updated.name || updated.participantId}`
              );
              return current;
            }
            return updated;
          })
        );

        // ✨ SYNC selectedConversation: if it exists in updated list, update it with new unread status
        setSelectedConversation((prev) => {
          if (!prev) return null;
          const updatedSelected = transformedConversations.find(
            (c) => c.participantId === prev.participantId
          );
          if (updatedSelected && updatedSelected.unread !== prev.unread) {
            console.log(
              `[refetch] Syncing selectedConversation unread: ${prev.unread} → ${updatedSelected.unread}`
            );
            return updatedSelected;
          }
          return prev;
        });

        // ✨ If another refetch was requested during the API call, run it again
        if (shouldRefetchAgainRef.current) {
          refetchConversations();
        }
      } catch (error) {
        console.error('Error refetching conversations:', error);
      }
    }, 500); // 500ms debounce
  }, [currentUser?.id, fetchChatSummary]);

  // Register callback for message read receipts
  useEffect(() => {
    onMessageRead((friendId) => {
      // Clear unread status for this conversation
      setConversations((prev) =>
        prev.map((conv) =>
          conv.participantId === friendId
            ? { ...conv, unread: false }
            : conv
        )
      );
      // Also update selectedConversation if it's the one being marked as read
      setSelectedConversation((prev) =>
        prev?.participantId === friendId
          ? { ...prev, unread: false }
          : prev
      );
    });
  }, [onMessageRead]);

  // Register callback for new messages via WebSocket
  useEffect(() => {
    onNewMessage((message) => {
      // Handle all incoming messages, not just selected conversations
      if (
        selectedConversation &&
        message.senderId === selectedConversation.participantId
      ) {
        // Message is from selected conversation: add to messages array
        const newMessage: Message = {
          messageId: `socket-${Date.now()}`,
          senderId: message.senderId,
          sender:
            message.senderId === currentUser?.id
              ? 'You'
              : selectedConversation.name || 'User',
          senderAvatar:
            message.senderId === currentUser?.id
              ? 'https://placehold.co/40x40'
              : selectedConversation.avatar || 'https://placehold.co/40x40',
          isSent: message.senderId === currentUser?.id,
          content: message.content,
          timestamp: message.timestamp,
          timestamp24: new Date(message.timestamp).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          }),
        };
        setMessages((prev) => [...prev, newMessage]);
      } else {
        // Message is from unselected conversation: immediately update unread status and last message
        setConversations((prev) =>
          prev.map((conv) =>
            conv.participantId === message.senderId
              ? {
                  ...conv,
                  unread: true,
                  lastMessage: message.content,
                  lastMessageAt: message.timestamp,
                  timestamp: new Date(message.timestamp).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  }),
                }
              : conv
          )
        );
        // Then refetch to sync with backend
        refetchConversations();
      }
    });
  }, [selectedConversation, currentUser?.id, onNewMessage, refetchConversations]);

  // Handle sending message
  const handleSendMessage = useCallback(
    (content: string) => {
      if (!selectedConversation || !currentUser?.id) return;

      // Send via WebSocket
      sendMessage(selectedConversation.participantId, content);

      // Optimistic update: add message to UI immediately
      const optimisticMessage: Message = {
        messageId: `temp-${Date.now()}`,
        senderId: currentUser.id,
        sender: currentUser.name || 'You',
        senderAvatar: currentUser.image || 'https://placehold.co/40x40',
        isSent: true,
        content,
        timestamp: new Date(),
        timestamp24: new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      };
      setMessages((prev) => [...prev, optimisticMessage]);
    },
    [selectedConversation, currentUser, sendMessage]
  );

  // Handle loading messages when conversation changes
  const handleLoadMessages = useCallback((newMessages: Message[]) => {
    setMessages([...newMessages].reverse());
  }, []);

  // Show loading state
  if (userLoading || conversationsLoading) {
    return (
      <div className="flex w-full h-full items-center justify-center bg-white">
        <p className="text-slate-500">Loading messages...</p>
      </div>
    );
  }

  return (
    <div className="flex w-full h-full gap-0 overflow-hidden bg-white">
      <ConversationSidebar
        conversations={conversations}
        selectedConversation={selectedConversation}
        onSelectConversation={setSelectedConversation}
        isLoading={conversationsLoading}
      />
      {selectedConversation ? (
        <ChatWindow
          conversation={selectedConversation}
          messages={messages}
          onSendMessage={handleSendMessage}
          onLoadMessages={handleLoadMessages}
          currentUserId={currentUser?.id || ''}
          isLoadingHistory={false}
        />
      ) : (
        <div className="flex-1 flex items-center justify-center bg-white">
          <p className="text-slate-500">Select a conversation to start</p>
        </div>
      )}
    </div>
  );
}
