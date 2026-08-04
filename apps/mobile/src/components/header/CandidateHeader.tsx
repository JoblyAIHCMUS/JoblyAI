import { Menu } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui/text';
import { NotificationBell } from './NotificationBell';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUnreadNotificationCount } from '../../hooks/useNotifications';
import { router } from 'expo-router';
import { COLORS } from '@/app/constants/theme';

interface CandidateHeaderProps {
  title: string;
  initials?: string;
  onMenuPress?: () => void;
}

export function CandidateHeader({
  title,
  initials = 'U',
  onMenuPress,
}: CandidateHeaderProps) {
  const { data: unreadCount = 0 } = useUnreadNotificationCount();
  const handleNotificationPress = () => {
    router.push('/pages/candidate/notifications');
  };
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{
        paddingTop: insets.top,
        borderBottomColor: COLORS.border,
      }}
      className="border-b bg-white px-4 py-3"
    >
      <View
        className="border-b bg-white px-4 py-3"
        style={{ borderBottomColor: COLORS.border }}
      >
        <View className="flex-row items-center justify-between">
          <Pressable
            onPress={onMenuPress}
            className="min-h-11 min-w-11 items-center justify-center"
          >
            <Menu size={22} color={COLORS.textStrong} />
          </Pressable>

          <Text
            className="text-xl font-bold"
            style={{ color: COLORS.textStrong }}
          >
            {title}
          </Text>

          <View className="flex-row items-center gap-2">
            <View
              className="h-10 w-10 items-center justify-center rounded-full"
              style={{ backgroundColor: COLORS.bgSelected }}
            >
              <Text
                className="text-sm font-bold"
                style={{ color: COLORS.primary }}
              >
                {initials}
              </Text>
            </View>

            <NotificationBell
              count={unreadCount}
              onPress={handleNotificationPress}
            />
          </View>
        </View>
      </View>
    </View>
  );
}
