'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useUser } from '@/hooks/useUser';
import { usePageTitle } from '@/contexts/page-title-context';
import { useSocket } from '@/contexts/socket-provider';
import { ConversationSidebar } from '@/features/employer/messages/ConversationSidebar';
import { ChatWindow } from '@/features/employer/messages/ChatWindow';
import { Conversation, Message } from '@/features/employer/messages/types';
import { getSenderAvatar } from '@/features/employer/messages/utils';
import { ChatSummary } from '@/api-client/messages';
import { useGetChatSummary } from '@/api-hook/messages';

export default function CandidateMessagesPage() {
  const searchParams = useSearchParams();
  const { setTitle } = usePageTitle();
  const { data: currentUser, isPending: userLoading } = useUser();
  const { sendMessage, markAsRead, onNewMessage } = useSocket();
  const { fetchChatSummary } = useGetChatSummary();

  useEffect(() => {
    setTitle('Messages');
  }, [setTitle]);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationsLoading, setConversationsLoading] = useState(false);

  // Ref to track the currently active chat for WebSocket listener (prevents stale closures)
  const activeChatIdRef = useRef<string | null>(null);
  const activeConversationRef = useRef<Conversation | null>(null);

  // Keep the ref perfectly synced with the state
  useEffect(() => {
    activeChatIdRef.current = selectedConversation?.participantId || null;
    activeConversationRef.current = selectedConversation || null;
  }, [selectedConversation]);

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

        // Check for recruiterId in query params to auto-select conversation
        const recruiterId = searchParams.get('recruiterId');
        if (recruiterId) {
          const recruiterConversation = transformedConversations.find(
            (conv) => conv.participantId === recruiterId
          );
          if (recruiterConversation) {
            setSelectedConversation(recruiterConversation);
            // Emit mark_read if conversation is unread
            if (recruiterConversation.unread) {
              markAsRead(recruiterConversation.participantId).catch(() => {
                // Silently fail if mark_read cannot be sent
              });
              // ✅ Optimistically update conversations state to clear the unread dot
              setConversations((prevConversations) =>
                prevConversations.map((conv) =>
                  conv.participantId === recruiterConversation.participantId
                    ? { ...conv, unread: false }
                    : conv
                )
              );
            }
          } else {
            // If recruiter conversation not found, select first by default
            const firstConv = transformedConversations[0] || null;
            setSelectedConversation(firstConv);
            // Emit mark_read if conversation is unread
            if (firstConv?.unread) {
              markAsRead(firstConv.participantId).catch(() => {
                // Silently fail if mark_read cannot be sent
              });
              // ✅ Optimistically update conversations state to clear the unread dot
              setConversations((prevConversations) =>
                prevConversations.map((conv) =>
                  conv.participantId === firstConv.participantId
                    ? { ...conv, unread: false }
                    : conv
                )
              );
            }
          }
        } else {
          // Select first conversation by default if available and none is selected
          setSelectedConversation((prev) => {
            const newSelection = prev || transformedConversations[0] || null;
            // Emit mark_read only if we auto-selected (no prev) and conversation is unread
            if (!prev && newSelection?.unread) {
              markAsRead(newSelection.participantId).catch(() => {
                // Silently fail if mark_read cannot be sent
              });
              // ✅ Optimistically update conversations state to clear the unread dot
              setConversations((prevConversations) =>
                prevConversations.map((conv) =>
                  conv.participantId === newSelection.participantId
                    ? { ...conv, unread: false }
                    : conv
                )
              );
            }
            return newSelection;
          });
        }
      } catch (error) {
        console.error('Error fetching conversations:', error);
      } finally {
        setConversationsLoading(false);
      }
    };

    getConversations();
  }, [currentUser?.id, fetchChatSummary, searchParams]);

  // Handle clicking a conversation in the sidebar
  const handleSelectConversation = useCallback((conversation: Conversation) => {
    setSelectedConversation(conversation);

    // Optimistically remove the unread dot immediately
    if (conversation.unread) {
      setConversations((prev) =>
        prev.map((conv) =>
          conv.participantId === conversation.participantId
            ? { ...conv, unread: false }
            : conv
        )
      );
    }
  }, []);

  // Register callback for new messages via WebSocket
  useEffect(() => {
    const off = onNewMessage((message) => {
      const formattedTime = new Date(message.timestamp).toLocaleTimeString(
        'en-US',
        {
          hour: '2-digit',
          minute: '2-digit',
        }
      );

      // Check if this message is from the active chat
      const isActiveChat = activeChatIdRef.current === message.senderId;

      // 1. Update the chat window IF it is the active chat
      if (isActiveChat) {
        const newMessage: Message = {
          messageId: `socket-${Date.now()}`,
          senderId: message.senderId,
          sender: activeConversationRef.current?.name || 'User',
          senderAvatar: getSenderAvatar(
            undefined,
            message.senderId,
            currentUser?.id || '',
            activeConversationRef.current?.avatar
          ),
          isSent: false,
          content: message.content,
          timestamp: message.timestamp,
          timestamp24: formattedTime,
        };
        setMessages((prev) => [...prev, newMessage]);

        // Emit mark_read for messages in the active chat to clear sidebar unread dot
        // ✅ Only emit if page is visible (to avoid marking read while user is away)
        const isPageVisible = document.visibilityState === 'visible';
        if (isPageVisible) {
          markAsRead(message.senderId).catch(() => {
            // Silently fail if mark_read cannot be sent
          });
        }
      }

      // 2. Update the sidebar for EVERY incoming message
      setConversations((prev) => {
        const updatedConversations = prev.map((conv) => {
          if (conv.participantId === message.senderId) {
            return {
              ...conv,
              lastMessage: message.content,
              timestamp: formattedTime,
              // Only mark as unread if this is NOT the currently active chat
              unread: !isActiveChat,
            };
          }
          return conv;
        });

        // Move the conversation with the new message to the top
        return updatedConversations.sort((a, b) => {
          if (a.participantId === message.senderId) return -1;
          if (b.participantId === message.senderId) return 1;
          return 0;
        });
      });
    });
    return () => {
      off?.();
    };
  }, [currentUser?.id, onNewMessage]);

  // Handle sending message
  const handleSendMessage = useCallback(
    (content: string) => {
      if (!selectedConversation || !currentUser?.id) return;

      // Send via WebSocket
      sendMessage(selectedConversation.participantId, content);

      const timestamp24 = new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });

      // Optimistic update: add message to UI immediately
      const optimisticMessage: Message = {
        messageId: `temp-${Date.now()}`,
        senderId: currentUser.id,
        sender: currentUser.name || 'You',
        senderAvatar: getSenderAvatar(
          currentUser.image,
          currentUser.id,
          currentUser.id,
          selectedConversation.avatar
        ),
        isSent: true,
        content,
        timestamp: new Date(),
        timestamp24,
      };

      // Update Chat Window
      setMessages((prev) => [...prev, optimisticMessage]);

      // Update Sidebar (conversations state)
      setConversations((prev) =>
        prev.map((conv) =>
          conv.participantId === selectedConversation.participantId
            ? {
                ...conv,
                lastMessage: content,
                timestamp: timestamp24,
              }
            : conv
        )
      );
    },
    [selectedConversation, currentUser, sendMessage]
  );

  // Handle loading messages when conversation changes
  const handleLoadMessages = useCallback((newMessages: Message[]) => {
    setMessages([...newMessages]);
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
        onSelectConversation={handleSelectConversation}
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
