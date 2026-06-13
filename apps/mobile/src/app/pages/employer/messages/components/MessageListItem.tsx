import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { SvgUri } from 'react-native-svg';
import { Conversation } from '../types';
import { formatTimestamp } from '../utils';

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
  const renderAvatar = () => {
    const avatarUrl = conversation.avatar;
    const isSvg =
      !!avatarUrl &&
      (avatarUrl.endsWith('.svg') ||
        avatarUrl.includes('/svg') ||
        avatarUrl.includes('image/svg+xml'));

    if (!avatarUrl) {
      return (
        <View className="w-12 h-12 rounded-full bg-app-border-3 items-center justify-center">
          <Text className="text-base font-semibold text-app-slate-3">
            {conversation.name.charAt(0).toUpperCase()}
          </Text>
        </View>
      );
    }

    if (isSvg) {
      return (
        <View className="w-12 h-12 rounded-full overflow-hidden bg-app-border-3">
          <SvgUri uri={avatarUrl} width="100%" height="100%" />
        </View>
      );
    }

    return (
      <Image
        source={{ uri: avatarUrl }}
        className="w-12 h-12 rounded-full"
        resizeMode="cover"
      />
    );
  };

  return (
    <TouchableOpacity
      className="flex-row items-center py-3 border-b border-app-border-3"
      activeOpacity={0.7}
      onPress={() => onPress?.(conversation)}
    >
      <View className="relative">
        {renderAvatar()}
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
            className={`text-base font-semibold text-app-slate-1 ${isUnread ? 'font-bold' : ''}`}
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
