import React from 'react';
import { View } from 'react-native';
import { MessageSkeleton } from '@/components/ui/feedback';

const MessagesLoading: React.FC = () => {
  return (
    <View className="flex-1 px-4 py-6">
      {[0, 1, 2, 3].map((item) => (
        <MessageSkeleton key={item} />
      ))}
    </View>
  );
};

export default MessagesLoading;
