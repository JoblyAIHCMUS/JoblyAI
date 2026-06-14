import React from 'react';
import { View, ActivityIndicator } from 'react-native';

const ChatLoading: React.FC = () => {
  return (
    <View className="flex-1 items-center justify-center">
      <ActivityIndicator size="large" color="#4F46E5" />
    </View>
  );
};

export default ChatLoading;
