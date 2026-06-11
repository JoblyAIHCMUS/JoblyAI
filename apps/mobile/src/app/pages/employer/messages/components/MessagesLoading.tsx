import React from 'react';
import { View, ActivityIndicator } from 'react-native';

const MessagesLoading: React.FC = () => {
  return (
    <View className="flex-1 items-center justify-center py-20">
      <ActivityIndicator size="large" color="#4F46E5" />
    </View>
  );
};

export default MessagesLoading;
