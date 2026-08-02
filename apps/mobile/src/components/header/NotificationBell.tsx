import { Bell } from 'lucide-react-native';
import { Pressable, View } from 'react-native';
import { Text } from '@/components/ui/text';
import { COLORS } from '@/app/constants/theme';

interface NotificationBellProps {
  count?: number;
  onPress?: () => void;
}

export function NotificationBell({
  count = 0,
  onPress,
}: NotificationBellProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Notifications"
      className="relative h-10 w-10 items-center justify-center"
    >
      <Bell size={22} color={COLORS.textStrong} />

      {count > 0 && (
        <View
          className="absolute right-0 top-0 min-w-4 h-4 rounded-full items-center justify-center px-1"
          style={{ backgroundColor: COLORS.notification }}
        >
          <Text className="text-xs font-bold text-white">{count}</Text>
        </View>
      )}
    </Pressable>
  );
}
