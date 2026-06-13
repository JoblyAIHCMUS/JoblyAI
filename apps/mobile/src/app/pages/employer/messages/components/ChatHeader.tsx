import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Circle } from 'lucide-react-native';

interface ChatHeaderProps {
  name: string;
  role: string | null;
  avatar: string | null;
  isOnline: boolean;
  onBack: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  name,
  role,
  avatar,
  isOnline,
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
          {role && (
            <View className="flex-row items-center">
              <Circle
                size={8}
                color={isOnline ? '#22C55E' : '#94A3B8'}
                fill={isOnline ? '#22C55E' : '#94A3B8'}
              />
              <Text className="text-xs text-app-slate-3 ml-1">
                {isOnline ? 'Online' : 'Offline'}
              </Text>
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ChatHeader;
