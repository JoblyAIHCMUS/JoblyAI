'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Message } from './types';

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  return (
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
        className={`flex flex-col gap-1 max-w-xs lg:max-w-md ${
          message.isSent ? 'items-end' : 'items-start'
        }`}
      >
        <p
          className={`rounded-lg px-4 py-2 text-sm ${
            message.isSent
              ? 'bg-indigo-50 text-slate-900 rounded-br-none'
              : 'bg-slate-100 text-slate-900 rounded-bl-none'
          }`}
        >
          {message.content}
        </p>
        <span className="text-xs text-slate-500">{message.timestamp24}</span>
      </div>

      {message.isSent && (
        <Avatar className="h-8 w-8">
          <AvatarImage src={message.senderAvatar} alt={message.sender} />
          <AvatarFallback>{message.sender?.charAt(0) || '?'}</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
