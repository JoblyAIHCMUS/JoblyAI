import React from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { Search, X } from 'lucide-react-native';
import { COLORS } from '../../../../../constants/theme';

interface SearchBarProps {
  searchTerm: string;
  location: string;
  onSearchTermChange: (term: string) => void;
  onLocationChange: (location: string) => void;
  onSearch?: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  searchTerm,
  location,
  onSearchTermChange,
  onLocationChange,
  onSearch,
}) => {
  return (
    <View className="bg-white px-4 py-4">
      <View className="mb-3 flex-row items-center rounded-xl border border-app-gray-1 bg-app-bg-input px-4 py-1">
        <Search size={20} color={COLORS.textPlaceholder} strokeWidth={2} />
        <TextInput
          className="flex-1 ml-3 text-base text-app-dark-text"
          placeholder="Job title or keyword"
          placeholderTextColor={COLORS.textPlaceholder}
          value={searchTerm}
          onChangeText={onSearchTermChange}
          editable={true}
        />
        {searchTerm && (
          <TouchableOpacity onPress={() => onSearchTermChange('')}>
            <X size={18} color={COLORS.textPlaceholder} strokeWidth={2} />
          </TouchableOpacity>
        )}
      </View>

      <View className="flex-row items-center rounded-xl border border-app-gray-1 bg-app-bg-input px-4 py-1">
        <Search size={20} color={COLORS.textPlaceholder} strokeWidth={2} />
        <TextInput
          className="flex-1 ml-3 text-base text-app-dark-text"
          placeholder="City or location"
          placeholderTextColor={COLORS.textPlaceholder}
          value={location}
          onChangeText={onLocationChange}
          editable={true}
        />
        {location && (
          <TouchableOpacity onPress={() => onLocationChange('')}>
            <X size={18} color={COLORS.textPlaceholder} strokeWidth={2} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default SearchBar;
