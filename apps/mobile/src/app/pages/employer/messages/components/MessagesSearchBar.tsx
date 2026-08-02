import React from 'react';
import { View, TextInput } from 'react-native';
import { Search } from 'lucide-react-native';
import { COLORS } from '@/app/constants/theme';

interface MessagesSearchBarProps {
  searchQuery: string;
  onSearchQueryChange: (text: string) => void;
}

const MessagesSearchBar: React.FC<MessagesSearchBarProps> = ({
  searchQuery,
  onSearchQueryChange,
}) => {
  return (
    <View className="flex-row items-center h-12 rounded-xl border border-app-border-3 bg-white px-3">
      <Search size={16} color={COLORS.slate400} />
      <TextInput
        className="flex-1 ml-2 text-base font-normal text-app-text-1"
        placeholder="Search messages"
        placeholderTextColor={COLORS.slate400}
        value={searchQuery}
        onChangeText={onSearchQueryChange}
        returnKeyType="search"
      />
    </View>
  );
};

export default MessagesSearchBar;
