import React from 'react';
import { View } from 'react-native';
import { Filter } from 'lucide-react-native';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { COLORS } from '@/app/constants/theme';

interface FilterButtonProps {
  count: number;
  onPress: () => void;
}

const FilterButton: React.FC<FilterButtonProps> = ({ count, onPress }) => {
  return (
    <Button
      variant="outline"
      onPress={onPress}
      accessibilityLabel={count > 0 ? `Filters, ${count} active` : 'Filters'}
      className="h-12 rounded-xl border-app-gray-1 bg-white px-3"
    >
      <Filter size={16} color={COLORS.text} strokeWidth={2} />
      {count > 0 ? (
        <View className="ml-1 h-5 min-w-5 items-center justify-center rounded-full bg-app-primary-2 px-1.5">
          <Text className="text-[10px] font-bold leading-3 text-white group-active:text-white">
            {count}
          </Text>
        </View>
      ) : null}
    </Button>
  );
};

export default FilterButton;
