'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, UserPlus, Star, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Conversation, Message } from './types';
import { MessageBubble } from './MessageBubble';
import { useChatHistory } from '@/api-hook/messages';
import { isNewDate, getDateLabel, getSenderAvatar } from './utils';

interface ChatWindowProps {
  conversation: Conversation;
  messages: Message[];
  onSendMessage: (content: string) => void;
  onLoadMessages: (messages: Message[]) => void;
  currentUserId: string;
  isLoadingHistory?: boolean;
}

export function ChatWindow({
  conversation,
  messages,
  onSendMessage,
  onLoadMessages,
  currentUserId,
  isLoadingHistory = false,
}: ChatWindowProps) {
  const [messageInput, setMessageInput] = useState('');
  const { fetchChatHistory } = useChatHistory();
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Fetch message history when conversation changes
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const history = await fetchChatHistory(conversation.participantId, 50);
        console.log('🔍 Chat history API response:', history);

        // Transform backend messages to frontend format
        const transformedMessages = history.map((msg) => ({
          messageId: msg.messageId,
          senderId: msg.senderId,
          sender:
            msg.senderName ||
            (msg.senderId === currentUserId
              ? 'You'
              : conversation.name || 'User'),
          senderAvatar: getSenderAvatar(
            msg.senderAvatar,
            msg.senderId,
            currentUserId,
            conversation.avatar
          ),
          isSent: msg.senderId === currentUserId,
          content: msg.content,
          timestamp: msg.timestamp,
          timestamp24: new Date(msg.timestamp).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          }),
        }));
        console.log('📝 Transformed messages:', transformedMessages);

        // Ensure messages are in ascending order (oldest first)
        const sortedMessages = transformedMessages.sort(
          (a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );

        // Add date separators between messages from different days
        const messagesWithSeparators = sortedMessages.map((msg, index) => {
          const prevMsg = index > 0 ? sortedMessages[index - 1] : null;
          const showDateSeparator = isNewDate(
            prevMsg ? new Date(prevMsg.timestamp) : null,
            new Date(msg.timestamp)
          );

          return {
            ...msg,
            showDateSeparator,
            dateLabel: showDateSeparator
              ? getDateLabel(new Date(msg.timestamp))
              : undefined,
          };
        });
        console.log('✅ Final sorted messages:', messagesWithSeparators);

        // Send messages to parent in ascending order (oldest first)
        onLoadMessages(messagesWithSeparators);
      } catch (error) {
        console.error('Error loading message history:', error);
      }
    };

    if (conversation.participantId) {
      fetchHistory();
    }
  }, [
    conversation.participantId,
    currentUserId,
    onLoadMessages,
    fetchChatHistory,
  ]);

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      onSendMessage(messageInput);
      setMessageInput('');
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="border-b border-slate-200 p-6 flex items-center justify-between bg-white">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage
              src={conversation.avatar ?? undefined}
              alt={conversation.name ?? undefined}
            />
            <AvatarFallback>
              {(conversation.name ?? 'U').charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {conversation.name}
            </h2>
            <p className="text-sm text-slate-500">{conversation.role}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <UserPlus className="h-5 w-5 text-slate-600" />
          </Button>
          <Button variant="ghost" size="icon">
            <Star className="h-5 w-5 text-slate-600" />
          </Button>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-5 w-5 text-slate-600" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-6 space-y-4"
      >
        {isLoadingHistory && (
          <div className="text-center text-sm text-slate-500 mb-6">
            Loading messages...
          </div>
        )}

        {!isLoadingHistory && messages.length === 0 && (
          <div className="text-center text-sm text-slate-500 mb-6">
            This is the very beginning of your direct message with{' '}
            {conversation.name}
          </div>
        )}

        {messages.map((message, index) => (
          <MessageBubble
            key={message.messageId || `msg-${index}`}
            message={message}
          />
        ))}
      </div>

      {/* Input */}
      <div className="border-t border-slate-200 bg-white p-4">
        <div className="flex gap-3">
          <Input
            placeholder="Reply message"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            className="flex-1 bg-slate-50 border-slate-200"
          />
          <Button
            onClick={handleSendMessage}
            className="bg-[var(--bg-accent-solid)] hover:bg-[var(--bg-accent-solid-hover)] text-[var(--text-white)] px-6"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
