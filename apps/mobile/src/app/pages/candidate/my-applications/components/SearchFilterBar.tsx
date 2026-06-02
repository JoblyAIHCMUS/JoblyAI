import { Filter, Search } from 'lucide-react-native';
import { View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';

interface SearchFilterBarProps {
  searchQuery: string;
  activeFilterCount: number;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  onFilterPress: () => void;
}

export function SearchFilterBar({
  searchQuery,
  activeFilterCount,
  onSearchChange,
  onSearchSubmit,
  onFilterPress,
}: SearchFilterBarProps) {
  return (
    <View className="gap-2">
      <View className="flex-row items-center gap-2">
        <Input
          className="h-11 flex-1 rounded-xl border-app-border-light bg-white px-3 text-sm text-app-text-4"
          placeholder="Search company, title, location..."
          placeholderTextColor="#7C8493"
          value={searchQuery}
          onChangeText={onSearchChange}
          returnKeyType="search"
          onSubmitEditing={onSearchSubmit}
        />

        <Button
          variant="outline"
          className="h-11 rounded-xl border-app-border-light bg-white px-4"
          onPress={onSearchSubmit}
        >
          <Search size={16} color="#202430" strokeWidth={2} />
          <Text className="text-sm font-semibold text-app-text-4">Search</Text>
        </Button>
      </View>

      <Button
        variant="outline"
        className="h-11 flex-row items-center justify-start rounded-xl border-app-border-light bg-white px-3"
        onPress={onFilterPress}
      >
        <Filter size={16} color="#202430" strokeWidth={2} />
        <Text className="text-sm font-semibold text-app-text-4">Filter</Text>

        {activeFilterCount > 0 ? (
          <View className="ml-2 h-5 min-w-5 items-center justify-center rounded-full bg-app-indigo-strong px-1.5">
            <Text className="text-[10px] font-bold leading-3 text-white">
              {activeFilterCount}
            </Text>
          </View>
        ) : null}
      </Button>
    </View>
  );
}