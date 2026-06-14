import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import Avatar from '../../../../../components/Avatar';

interface ChatHeaderProps {
  name: string;
  avatar: string | null;
  role?: string | null;
  onBack: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  name,
  avatar,
  role,
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
        <View className="mr-3">
          <Avatar url={avatar} name={name} size={40} />
        </View>
        <View className="flex-1">
          <Text
            className="text-base font-semibold text-app-slate-1"
            numberOfLines={1}
          >
            {name}
          </Text>
          {role ? (
            <Text className="text-xs text-app-slate-3" numberOfLines={1}>
              {role}
            </Text>
          ) : null}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ChatHeader;
