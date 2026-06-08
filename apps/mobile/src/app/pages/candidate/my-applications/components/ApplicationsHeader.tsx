import { Bell, Menu } from 'lucide-react-native';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/ui/text';

interface ApplicationsHeaderProps {
  title: string;
  onMenuPress: () => void;
}

export function ApplicationsHeader({ title, onMenuPress }: ApplicationsHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="border-b border-app-border-3 bg-white px-4"
      style={{ paddingTop: insets.top + 8, paddingBottom: 12 }}
    >
      <View className="flex-row items-center justify-between">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open navigation menu"
          className="h-10 w-10 items-center justify-center rounded-full bg-transparent"
          onPress={onMenuPress}
        >
          <Menu size={22} color="#202430" strokeWidth={2.2} />
        </Pressable>

        <Text className="text-xl font-bold text-app-text-4">{title}</Text>

        <View className="flex-row items-center gap-3">
          <View className="h-10 w-10 items-center justify-center rounded-full bg-app-indigo-soft">
            <Text className="text-sm font-bold text-app-indigo-strong">DH</Text>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Notifications"
            className="h-10 w-10 items-center justify-center rounded-full bg-transparent"
          >
            <Bell size={22} color="#202430" strokeWidth={2.1} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}