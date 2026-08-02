import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { COLORS } from '@/app/constants/theme';

const MessagesLoading: React.FC = () => {
  return (
    <View className="flex-1 items-center justify-center py-20">
      <ActivityIndicator size="large" color={COLORS.primary2} />
    </View>
  );
};

export default MessagesLoading;
