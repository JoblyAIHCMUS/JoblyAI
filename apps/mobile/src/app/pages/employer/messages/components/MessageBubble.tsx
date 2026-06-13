import React from 'react';
import { View, Text } from 'react-native';
import type { ChatMessage } from '../../../../types/message';

interface MessageBubbleProps {
  message: ChatMessage & { showDateSeparator?: boolean; dateLabel?: string };
  currentUserId: string;
}

function formatTime(ts: string | Date): string {
  const d = new Date(ts);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  currentUserId,
}) => {
  const isSent = message.senderId === currentUserId;
  return (
    <View
      className={`my-1 flex-row ${isSent ? 'justify-end' : 'justify-start'}`}
    >
      <View
        testID={isSent ? 'bubble-sent' : 'bubble-received'}
        className={`max-w-[75%] rounded-2xl px-4 py-2 ${
          isSent ? 'bg-app-primary' : 'bg-app-border-3'
        }`}
      >
        {message.showDateSeparator && message.dateLabel && (
          <Text className="text-xs text-center text-app-slate-3 mb-2">
            {message.dateLabel}
          </Text>
        )}
        <Text
          className={`text-base ${isSent ? 'text-white' : 'text-app-slate-1'}`}
        >
          {message.content}
        </Text>
        <Text
          className={`text-xs mt-1 text-right ${
            isSent ? 'text-white/70' : 'text-app-slate-3'
          }`}
        >
          {formatTime(message.timestamp)}
        </Text>
      </View>
    </View>
  );
};

export default MessageBubble;
