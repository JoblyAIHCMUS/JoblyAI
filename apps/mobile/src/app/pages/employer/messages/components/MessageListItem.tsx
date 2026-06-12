import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Conversation } from '../types';
import { formatTimestamp } from '../utils';

interface MessageListItemProps {
  conversation: Conversation;
  onPress?: (conversation: Conversation) => void;
}

const MessageListItem: React.FC<MessageListItemProps> = ({
  conversation,
  onPress,
}) => {
  const [avatarError, setAvatarError] = useState(false);

  const renderAvatar = () => {
    if (!conversation.avatar || avatarError) {
      return (
        <View className="w-12 h-12 rounded-full bg-app-border-3 items-center justify-center">
          <Text className="text-base font-semibold text-app-slate-3">
            {conversation.name.charAt(0).toUpperCase()}
          </Text>
        </View>
      );
    }

    return (
      <Image
        source={{ uri: conversation.avatar }}
        className="w-12 h-12 rounded-full"
        resizeMode="cover"
        onError={() => setAvatarError(true)}
      />
    );
  };

  return (
    <TouchableOpacity
      className="flex-row items-center py-3 border-b border-app-border-3"
      activeOpacity={0.7}
      onPress={() => onPress?.(conversation)}
    >
      {renderAvatar()}
      <View className="flex-1 ml-3">
        <View className="flex-row items-center justify-between">
          <Text
            className="text-base font-semibold text-app-slate-1"
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
          {conversation.lastMessage}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default MessageListItem;
