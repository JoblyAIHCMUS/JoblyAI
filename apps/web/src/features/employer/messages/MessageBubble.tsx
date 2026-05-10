'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Message } from './types';

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  return (
    <>
      {message.showDateSeparator && message.dateLabel && (
        <div className="flex justify-center py-3">
          <span className="text-xs text-slate-400 font-medium">
            {message.dateLabel}
          </span>
        </div>
      )}
      <div
        className={`flex gap-3 ${
          message.isSent ? 'justify-end' : 'justify-start'
        }`}
      >
        {!message.isSent && (
          <Avatar className="h-8 w-8">
            <AvatarImage src={message.senderAvatar} alt={message.sender} />
            <AvatarFallback>{message.sender?.charAt(0) || '?'}</AvatarFallback>
          </Avatar>
        )}

        <div
          className={`flex flex-col gap-1 max-w-[75%] lg:max-w-md ${
            message.isSent ? 'items-end' : 'items-start'
          }`}
        >
          <div
            className={`rounded-2xl px-4 py-2.5 text-sm shadow-sm whitespace-pre-wrap ${
              message.isSent
                ? 'bg-indigo-600 text-white rounded-tr-none'
                : 'bg-white border border-slate-200 text-slate-900 rounded-tl-none'
            }`}
          >
            {message.content}
          </div>
          <span className="text-[10px] text-slate-500 font-medium px-1">
            {message.timestamp24}
          </span>
        </div>

        {message.isSent && (
          <Avatar className="h-8 w-8">
            <AvatarImage src={message.senderAvatar} alt={message.sender} />
            <AvatarFallback>{message.sender?.charAt(0) || '?'}</AvatarFallback>
          </Avatar>
        )}
      </div>
    </>
  );
}
