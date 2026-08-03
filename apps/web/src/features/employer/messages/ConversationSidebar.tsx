'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Conversation } from './types';

interface ConversationSidebarProps {
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  onSelectConversation: (conversation: Conversation) => void;
  onMarkAsRead: () => void;
  activeChatId?: string | null;
  isLoading?: boolean;
  isMobileView?: boolean;
}

export function ConversationSidebar({
  conversations,
  selectedConversation,
  onSelectConversation,
  onMarkAsRead,
  activeChatId,
  isLoading = false,
  isMobileView = false,
}: ConversationSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConversations = conversations.filter(
    (conv) =>
      conv.name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false
  );

  const handleSelectConversation = (conversation: Conversation) => {
    onSelectConversation(conversation);
    onMarkAsRead();
  };

  return (
    <div className="w-full lg:w-1/3 border-r border-slate-200 flex flex-col h-full overflow-hidden bg-white">
      {/* Search */}
      <div className="border-b border-slate-200 px-2 sm:px-3 md:px-4 py-2 sm:py-3 md:py-4 shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-400" />
          <Input
            placeholder="Search messages"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 sm:pl-10 bg-slate-50 border-slate-200 text-xs sm:text-sm md:text-base h-8 sm:h-9 md:h-10"
          />
        </div>
      </div>

      {/* Conversations List wrapped in ScrollArea */}
      <ScrollArea className="flex-1 min-w-0 [&>div[data-radix-scroll-area-viewport]>div]:w-full [&>div[data-radix-scroll-area-viewport]>div]:table-fixed">
        <div>
          {isLoading && (
            <div className="px-2 sm:px-3 md:px-4 py-4 text-center text-xs sm:text-sm text-slate-500">
              Loading conversations...
            </div>
          )}
          {!isLoading && filteredConversations.length === 0 && (
            <div className="px-2 sm:px-3 md:px-4 py-4 text-center text-xs sm:text-sm text-slate-500">
              No conversations found
            </div>
          )}
          {filteredConversations.map((conversation) => (
            <button
              key={conversation.chatId}
              onClick={() => handleSelectConversation(conversation)}
              className={`w-full border-b border-slate-100 px-2 sm:px-3 md:px-4 py-2 sm:py-3 md:py-3 text-left transition-colors hover:bg-slate-50 active:bg-slate-100 ${
                selectedConversation?.chatId === conversation.chatId
                  ? 'bg-slate-50'
                  : ''
              }`}
            >
              <div className="flex min-w-0 items-start gap-2 sm:gap-3">
                <div className="relative flex-shrink-0 mt-1">
                  <Avatar className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10">
                    <AvatarImage
                      src={conversation.avatar || undefined}
                      alt={conversation.name || 'User'}
                    />
                    <AvatarFallback>
                      {conversation.name?.charAt(0) || '?'}
                    </AvatarFallback>
                  </Avatar>
                  {conversation.unread && (
                    <div className="absolute -right-1 -top-1 h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-blue-500" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs sm:text-sm md:text-base font-semibold text-slate-900 truncate">
                      {conversation.name}
                    </p>
                    <span className="text-[10px] sm:text-xs text-slate-500 flex-shrink-0">
                      {conversation.timestamp}
                    </span>
                  </div>
                  <p className="mt-0.5 sm:mt-1 max-w-full text-xs sm:text-sm text-slate-600 truncate">
                    {conversation.lastMessage || 'No messages yet'}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
