import React from 'react';
import { View, Text } from 'react-native';
import type { Message } from '../utils';

interface MessageBubbleProps {
  message: Message;
}

function formatTime(ts: Date | string): string {
  const d = new Date(ts);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isSent = message.isSent;
  return (
    <View className="my-1">
      {message.showDateSeparator && message.dateLabel && (
        <View className="items-center py-2">
          <Text className="text-xs text-app-slate-3 font-medium">
            {message.dateLabel}
          </Text>
        </View>
      )}
      <View className={`flex-row ${isSent ? 'justify-end' : 'justify-start'}`}>
        <View
          testID={isSent ? 'bubble-sent' : 'bubble-received'}
          className={`max-w-[75%] rounded-2xl px-4 py-2 ${
            isSent
              ? 'bg-app-primary-1 rounded-tr-none'
              : 'bg-white border border-app-border-2 rounded-tl-none'
          }`}
        >
          <Text
            className={`text-base ${
              isSent ? 'text-white' : 'text-app-slate-1'
            }`}
          >
            {message.content}
          </Text>
        </View>
      </View>
      <View
        className={`flex-row px-1 mt-0.5 ${
          isSent ? 'justify-end' : 'justify-start'
        }`}
      >
        <Text className="text-[10px] text-app-text-5">
          {formatTime(message.timestamp)}
        </Text>
      </View>
    </View>
  );
};

export default MessageBubble;
