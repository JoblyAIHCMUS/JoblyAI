import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { AlertCircle } from 'lucide-react-native';

interface ChatErrorProps {
  message: string;
  onRetry: () => void;
  onBack?: () => void;
}

const ChatError: React.FC<ChatErrorProps> = ({ message, onRetry, onBack }) => {
  return (
    <View className="flex-1 items-center justify-center py-16 px-6">
      <AlertCircle size={40} color="#EF4444" />
      <Text className="text-base font-semibold text-app-slate-1 mt-4 text-center">
        Unable to load conversation
      </Text>
      <Text className="text-sm font-normal text-app-text-5 mt-1 text-center">
        {message}
      </Text>
      <View className="flex-row mt-4">
        <TouchableOpacity
          className="px-6 py-2.5 rounded-lg bg-app-primary"
          onPress={onRetry}
          activeOpacity={0.7}
        >
          <Text className="text-base font-semibold text-white">Try again</Text>
        </TouchableOpacity>
        {onBack && (
          <TouchableOpacity
            className="px-6 py-2.5 rounded-lg border border-app-border-3 ml-2"
            onPress={onBack}
            activeOpacity={0.7}
          >
            <Text className="text-base font-semibold text-app-slate-1">
              Back
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default ChatError;
