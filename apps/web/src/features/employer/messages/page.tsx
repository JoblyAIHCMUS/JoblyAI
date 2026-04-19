'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@/hooks/useUser';
import { useMessagesSocket } from '@/hooks/useMessagesSocket';
import { ConversationSidebar } from './ConversationSidebar';
import { ChatWindow } from './ChatWindow';
import { Conversation, Message } from './types';
import { ChatSummary } from '@/api-client/messages';
import { useGetChatSummary } from '@/api-hook/messages';

export default function EmployerMessagesPage() {
  const { data: currentUser, isPending: userLoading } = useUser();
  const { sendMessage, onNewMessage } = useMessagesSocket();
  const { fetchChatSummary } = useGetChatSummary();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationsLoading, setConversationsLoading] = useState(false);

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
  // Register callback for new messages via WebSocket
  useEffect(() => {
    onNewMessage((message) => {
      const formattedTime = new Date(message.timestamp).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });

      // 1. Update the chat window IF the message is for the current conversation
      if (
        selectedConversation &&
        message.senderId === selectedConversation.participantId
      ) {
        const newMessage: Message = {
          messageId: `socket-${Date.now()}`,
          senderId: message.senderId,
          sender: selectedConversation.name || 'User',
          senderAvatar: selectedConversation.avatar || 'https://placehold.co/40x40',
          isSent: false,
          content: message.content,
          timestamp: message.timestamp,
          timestamp24: formattedTime,
        };
        setMessages((prev) => [...prev, newMessage]);
      }

      // 2. Update the sidebar for EVERY incoming message
      setConversations((prev) => {
        const updatedConversations = prev.map((conv) => {
          if (conv.participantId === message.senderId) {
            return {
              ...conv,
              lastMessage: message.content,
              timestamp: formattedTime,
              // Mark as unread if they aren't currently looking at this chat
              unread: selectedConversation?.participantId !== message.senderId,
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
  }, [selectedConversation, currentUser?.id, onNewMessage]);

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
        senderAvatar: currentUser.image || 'https://placehold.co/40x40',
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
