'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, UserPlus, Star, MoreVertical, ArrowLeft } from 'lucide-react';
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
  onBackClick?: () => void;
  isMobileView?: boolean;
}

export function ChatWindow({
  conversation,
  messages,
  onSendMessage,
  onLoadMessages,
  currentUserId,
  isLoadingHistory = false,
  onBackClick,
  isMobileView = false,
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
    <div className="flex-1 flex flex-col w-full h-full">
      {/* Header */}
      <div className="border-b border-slate-200 px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 flex items-center justify-between bg-white shrink-0">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          {isMobileView && onBackClick && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onBackClick}
              className="h-8 w-8 sm:h-9 sm:w-9 flex-shrink-0"
            >
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600" />
            </Button>
          )}
          <Avatar className="h-10 w-10 sm:h-11 sm:w-11 md:h-12 md:w-12 flex-shrink-0">
            <AvatarImage
              src={conversation.avatar ?? undefined}
              alt={conversation.name ?? undefined}
            />
            <AvatarFallback>
              {(conversation.name ?? 'U').charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm sm:text-base md:text-lg font-semibold text-slate-900 truncate">
              {conversation.name}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 truncate">
              {conversation.role}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10"
          >
            <UserPlus className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 hidden xs:flex"
          >
            <Star className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 hidden sm:flex"
          >
            <MoreVertical className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-2 sm:px-4 md:px-6 py-3 sm:py-4 md:py-6 space-y-3 sm:space-y-4"
      >
        {isLoadingHistory && (
          <div className="text-center text-xs sm:text-sm text-slate-500 mb-6">
            Loading messages...
          </div>
        )}

        {!isLoadingHistory && messages.length === 0 && (
          <div className="text-center text-xs sm:text-sm text-slate-500 mb-6">
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
      <div className="border-t border-slate-200 bg-white px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 shrink-0">
        <div className="flex gap-2 sm:gap-3">
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
            className="flex-1 bg-slate-50 border-slate-200 text-xs sm:text-sm md:text-base h-8 sm:h-9 md:h-10"
          />
          <Button
            onClick={handleSendMessage}
            className="bg-[var(--bg-accent-solid)] hover:bg-[var(--bg-accent-solid-hover)] text-[var(--text-white)] px-2 sm:px-4 md:px-6 h-8 sm:h-9 md:h-10 text-xs sm:text-sm md:text-base flex-shrink-0"
          >
            <Send className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-4 md:w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
