import { Filter, Search } from 'lucide-react-native';
import { View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { COLORS } from '@/app/constants/theme';

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
        <View className="h-11 flex-1 flex-row items-center rounded-xl border border-app-border-light bg-white px-3">
          <Search size={16} color={COLORS.textLight} strokeWidth={2} />
          <Input
            className="h-11 flex-1 border-0 bg-transparent pl-2 text-sm text-app-text-4"
            placeholder="Search company, title, location..."
            placeholderTextColor={COLORS.textLight}
            value={searchQuery}
            onChangeText={onSearchChange}
            returnKeyType="search"
            onSubmitEditing={onSearchSubmit}
          />
        </View>

        <Button
          variant="outline"
          className="h-11 rounded-xl border-app-border-light bg-white px-4"
          onPress={onFilterPress}
        >
          <Filter size={16} color={COLORS.text} strokeWidth={2} />
          <Text className="text-sm font-semibold text-app-text-4">Filter</Text>

          {activeFilterCount > 0 ? (
            <View className="ml-1 h-5 min-w-5 items-center justify-center rounded-full bg-app-indigo-strong px-1.5">
              <Text className="text-[10px] font-bold leading-3 text-white">
                {activeFilterCount}
              </Text>
            </View>
          ) : null}
        </Button>
      </View>
    </View>
  );
}
