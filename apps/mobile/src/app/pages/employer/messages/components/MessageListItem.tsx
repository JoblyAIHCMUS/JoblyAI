import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Conversation } from '../types';
import { formatTimestamp } from '../utils';
import Avatar from '../../../../../components/Avatar';

interface MessageListItemProps {
  conversation: Conversation;
  onPress?: (conversation: Conversation) => void;
  isUnread: boolean;
}

const MessageListItem: React.FC<MessageListItemProps> = ({
  conversation,
  onPress,
  isUnread,
}) => {
  return (
    <TouchableOpacity
      className="flex-row items-center py-3 border-b border-app-border-3"
      activeOpacity={0.7}
      onPress={() => onPress?.(conversation)}
    >
      <View className="relative">
        <Avatar url={conversation.avatar} name={conversation.name} size={48} />
        {isUnread && (
          <View
            testID="unread-dot"
            className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-blue-500 border-2 border-white"
          />
        )}
      </View>
      <View className="flex-1 ml-3">
        <View className="flex-row items-center justify-between">
          <Text
            className={`text-base font-semibold text-app-slate-1 ${
              isUnread ? 'font-bold' : ''
            }`}
            numberOfLines={1}
          >
            {conversation.name}
          </Text>
          <Text className="text-base font-normal text-app-text-5">
            {formatTimestamp(conversation.lastMessageAt)}
          </Text>
        </View>
        <Text
          className="text-base font-normal text-app-text-5 mt-0.5"
          numberOfLines={1}
        >
          {conversation.lastMessage || 'No messages yet'}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default MessageListItem;
