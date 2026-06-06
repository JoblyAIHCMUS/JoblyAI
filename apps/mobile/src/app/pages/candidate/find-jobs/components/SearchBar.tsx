import React from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { Search, X } from 'lucide-react-native';

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
      {/* Job title search */}
      <View className="mb-3 flex-row items-center rounded-xl border border-[#e5e7eb] bg-[#f9fafb] px-4 py-1">
        <Search size={20} color="#9ca3af" strokeWidth={2} />
        <TextInput
          className="flex-1 ml-3 text-base text-[#111827]"
          placeholder="Job title or keyword"
          placeholderTextColor="#9ca3af"
          value={searchTerm}
          onChangeText={onSearchTermChange}
          editable={true}
        />
        {searchTerm && (
          <TouchableOpacity onPress={() => onSearchTermChange('')}>
            <X size={18} color="#9ca3af" strokeWidth={2} />
          </TouchableOpacity>
        )}
      </View>

      {/* Location search */}
      <View className="flex-row items-center rounded-xl border border-[#e5e7eb] bg-[#f9fafb] px-4 py-1">
        <Search size={20} color="#9ca3af" strokeWidth={2} />
        <TextInput
          className="flex-1 ml-3 text-base text-[#111827]"
          placeholder="City or location"
          placeholderTextColor="#9ca3af"
          value={location}
          onChangeText={onLocationChange}
          editable={true}
        />
        {location && (
          <TouchableOpacity onPress={() => onLocationChange('')}>
            <X size={18} color="#9ca3af" strokeWidth={2} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default SearchBar;
