import React from 'react';
import { View, Text } from 'react-native';
import { MessageCircle } from 'lucide-react-native';

const ChatEmptyState: React.FC = () => {
  return (
    <View className="flex-1 items-center justify-center py-20">
      <MessageCircle size={48} color="#94A3B8" />
      <Text className="text-base font-semibold text-app-slate-1 mt-4">
        No messages yet
      </Text>
      <Text className="text-sm text-app-slate-3 mt-1">
        Say hi to start the conversation 👋
      </Text>
    </View>
  );
};

export default ChatEmptyState;
