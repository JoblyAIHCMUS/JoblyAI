'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Conversation } from './types';

interface ConversationSidebarProps {
  conversations: Conversation[];
  selectedConversation: Conversation;
  onSelectConversation: (conversation: Conversation) => void;
}

export function ConversationSidebar({
  conversations,
  selectedConversation,
  onSelectConversation,
}: ConversationSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConversations = conversations.filter((conv) =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-1/3 border-r border-slate-200 flex flex-col h-full overflow-hidden">
      {/* Search */}
      <div className="border-b border-slate-200 p-4 shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search messages"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-slate-50 border-slate-200"
          />
        </div>
      </div>

      {/* Conversations List wrapped in ScrollArea */}
      <ScrollArea className="flex-1">
        <div>
          {filteredConversations.map((conversation) => (
            <button
              key={conversation.id}
              onClick={() => onSelectConversation(conversation)}
              className={`w-full border-b border-slate-100 p-3 text-left transition-colors hover:bg-slate-50 ${
                selectedConversation.id === conversation.id ? 'bg-slate-50' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="relative mt-1">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={conversation.avatar}
                      alt={conversation.name}
                    />
                    <AvatarFallback>
                      {conversation.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  {conversation.unread && (
                    <div className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-blue-500" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-900">
                      {conversation.name}
                    </p>
                    <span className="text-xs text-slate-500">
                      {conversation.timestamp}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">{conversation.role}</p>
                  <p className="mt-1 text-sm text-slate-600 truncate">
                    {conversation.lastMessage}
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
