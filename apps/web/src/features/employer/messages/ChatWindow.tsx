'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Send, UserPlus, Star, MoreVertical, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Conversation } from './types';
import { MessageBubble } from './MessageBubble';
import { useChatHistory } from '@/hooks/messaging/useChatHistory';
import { useSendMessage } from '@/hooks/messaging/useSendMessage';
import { withDateSeparators } from './utils';

interface ChatWindowProps {
  conversation: Conversation;
  currentUserId: string;
  currentUserAvatar?: string | null;
  onBackClick?: () => void;
  isMobileView?: boolean;
}

export function ChatWindow({
  conversation,
  currentUserId,
  currentUserAvatar,
  onBackClick,
  isMobileView = false,
}: ChatWindowProps) {
  const [messageInput, setMessageInput] = useState('');
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const { data: historyData } = useChatHistory(
    conversation.chatId,
    conversation.participantId
  );
  const sendMessage = useSendMessage({
    chatId: conversation.chatId,
    friendId: conversation.participantId,
    userId: currentUserId,
    currentUserAvatar,
  });

  const messages = useMemo(
    () =>
      withDateSeparators(
        (historyData?.pages ?? []).flatMap((p) => p),
        currentUserId,
        conversation.name,
        conversation.avatar
      ),
    [historyData, currentUserId, conversation.name, conversation.avatar]
  );

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = () => {
    const text = messageInput.trim();
    if (!text) return;
    sendMessage.mutate(text);
    setMessageInput('');
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
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:h-5 text-slate-600" />
            </Button>
          )}
          <Avatar className="h-10 w-10 sm:h-11 sm:h-11 md:h-12 md:w-12 flex-shrink-0">
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
            className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:h-10"
          >
            <UserPlus className="h-4 w-4 sm:h-5 sm:h-5 text-slate-600" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:h-10 hidden xs:flex"
          >
            <Star className="h-4 w-4 sm:h-5 sm:h-5 text-slate-600" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:h-10 hidden sm:flex"
          >
            <MoreVertical className="h-4 w-4 sm:h-5 sm:h-5 text-slate-600" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-2 sm:px-4 md:px-6 py-3 sm:py-4 md:py-6 space-y-3 sm:space-y-4"
      >
        {messages.length === 0 && (
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
            <Send className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-4 md:h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
