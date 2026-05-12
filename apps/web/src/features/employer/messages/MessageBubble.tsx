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
        <div className="flex justify-center py-2 sm:py-3">
          <span className="text-[10px] sm:text-xs text-slate-400 font-medium">
            {message.dateLabel}
          </span>
        </div>
      )}
      <div
        className={`flex gap-2 sm:gap-3 ${
          message.isSent ? 'justify-end' : 'justify-start'
        }`}
      >
        {!message.isSent && (
          <Avatar className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 flex-shrink-0">
            <AvatarImage src={message.senderAvatar} alt={message.sender} />
            <AvatarFallback>{message.sender?.charAt(0) || '?'}</AvatarFallback>
          </Avatar>
        )}

        <div
          className={`flex flex-col gap-0.5 sm:gap-1 max-w-[85%] sm:max-w-[75%] md:max-w-md ${
            message.isSent ? 'items-end' : 'items-start'
          }`}
        >
          <div
            className={`rounded-lg sm:rounded-2xl px-2.5 sm:px-4 py-1.5 sm:py-2.5 text-xs sm:text-sm md:text-base shadow-sm whitespace-pre-wrap break-words ${
              message.isSent
                ? 'bg-indigo-600 text-white rounded-tr-none'
                : 'bg-white border border-slate-200 text-slate-900 rounded-tl-none'
            }`}
          >
            {message.content}
          </div>
          <span className="text-[8px] sm:text-[10px] text-slate-500 font-medium px-1">
            {message.timestamp24}
          </span>
        </div>

        {message.isSent && (
          <Avatar className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 flex-shrink-0">
            <AvatarImage src={message.senderAvatar} alt={message.sender} />
            <AvatarFallback>{message.sender?.charAt(0) || '?'}</AvatarFallback>
          </Avatar>
        )}
      </div>
    </>
  );
}
