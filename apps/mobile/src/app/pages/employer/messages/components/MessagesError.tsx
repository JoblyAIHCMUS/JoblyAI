import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { AlertCircle } from 'lucide-react-native';

interface MessagesErrorProps {
  message: string;
  onRetry: () => void;
}

const MessagesError: React.FC<MessagesErrorProps> = ({ message, onRetry }) => {
  return (
    <View className="items-center py-16 px-6">
      <AlertCircle size={40} color="#EF4444" />
      <Text className="text-base font-semibold text-app-slate-1 mt-4 text-center">
        Unable to load messages
      </Text>
      <Text className="text-sm font-normal text-app-text-5 mt-1 text-center">
        {message}
      </Text>
      <TouchableOpacity
        className="mt-4 px-6 py-2.5 rounded-lg bg-app-primary"
        onPress={onRetry}
        activeOpacity={0.7}
      >
        <Text className="text-base font-semibold text-white">Try again</Text>
      </TouchableOpacity>
    </View>
  );
};

export default MessagesError;
