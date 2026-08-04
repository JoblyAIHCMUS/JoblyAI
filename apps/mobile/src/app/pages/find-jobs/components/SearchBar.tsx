import React, { useRef, useState } from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { Search, X, MapPin } from 'lucide-react-native';
import { COLORS } from '@/app/constants/theme';

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
}) => {
  const locationInputRef = useRef<TextInput>(null);
  const [isLocationFocused, setIsLocationFocused] = useState(false);
  const showLocationInput = isLocationFocused || location.length > 0;

  const handleLocationIconPress = () => {
    setIsLocationFocused(true);
    setTimeout(() => locationInputRef.current?.focus(), 50);
  };

  const handleLocationClear = () => {
    onLocationChange('');
    setIsLocationFocused(false);
  };

  return (
    <View className="h-12 flex-1 flex-row items-center gap-2">
      <View className="h-12 flex-1 flex-row items-center rounded-xl border border-app-gray-1 bg-app-bg-input px-3">
        <Search size={18} color={COLORS.textPlaceholder} strokeWidth={2} />
        <TextInput
          className="ml-2 flex-1 text-sm text-app-dark-text"
          placeholder="Search jobs..."
          placeholderTextColor={COLORS.textPlaceholder}
          value={searchTerm}
          onChangeText={onSearchTermChange}
          returnKeyType="search"
        />
        {searchTerm.length > 0 && (
          <TouchableOpacity
            onPress={() => onSearchTermChange('')}
            className="min-h-11 min-w-11 items-center justify-center"
          >
            <X size={16} color={COLORS.textPlaceholder} strokeWidth={2} />
          </TouchableOpacity>
        )}
      </View>

      {showLocationInput ? (
        <View className="h-12 w-32 flex-row items-center rounded-xl border border-app-gray-1 bg-app-bg-input px-3">
          <TextInput
            ref={locationInputRef}
            className="flex-1 text-sm text-app-dark-text"
            placeholder="Location"
            placeholderTextColor={COLORS.textPlaceholder}
            value={location}
            onChangeText={onLocationChange}
            onBlur={() => setIsLocationFocused(false)}
            returnKeyType="search"
          />
          <TouchableOpacity
            onPress={handleLocationClear}
            className="min-h-11 min-w-11 items-center justify-center"
          >
            <X size={16} color={COLORS.textPlaceholder} strokeWidth={2} />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          onPress={handleLocationIconPress}
          className="h-12 w-12 items-center justify-center rounded-xl border border-app-gray-1 bg-app-bg-input"
        >
          <MapPin size={18} color={COLORS.textPlaceholder} strokeWidth={2} />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default SearchBar;
