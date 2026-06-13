import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';

interface ChatHeaderProps {
  name: string;
  avatar: string | null;
  onBack: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  name,
  avatar,
  onBack,
}) => {
  return (
    <SafeAreaView
      edges={['top']}
      className="border-b border-app-border-3 bg-white"
    >
      <View className="flex-row items-center px-4 py-3">
        <TouchableOpacity
          testID="back-button"
          onPress={onBack}
          activeOpacity={0.7}
          className="mr-3"
        >
          <ArrowLeft size={24} color="#1E293B" />
        </TouchableOpacity>
        {avatar ? (
          <Image
            source={{ uri: avatar }}
            className="w-10 h-10 rounded-full mr-3"
          />
        ) : (
          <View className="w-10 h-10 rounded-full bg-app-border-3 items-center justify-center mr-3">
            <Text className="text-base font-semibold text-app-slate-3">
              {name.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        <View className="flex-1">
          <Text
            className="text-base font-semibold text-app-slate-1"
            numberOfLines={1}
          >
            {name}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ChatHeader;
