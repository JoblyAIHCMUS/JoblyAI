import { Menu } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui/text';
import { NotificationBell } from './NotificationBell';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUnreadNotificationCount } from '../../hooks/useNotifications';
import { router } from 'expo-router';

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
      }}
      className="border-b border-[#d6ddeb] bg-white px-4 py-3"
    >
      <View className="border-b border-[#d6ddeb] bg-white px-4 py-3">
        <View className="flex-row items-center justify-between">
          <Pressable onPress={onMenuPress} className="p-2">
            <Menu size={22} color="#25324b" />
          </Pressable>

          <Text className="text-xl font-bold text-[#25324b]">{title}</Text>

          <View className="flex-row items-center gap-2">
            <View className="h-10 w-10 items-center justify-center rounded-full bg-[#eef0ff]">
              <Text className="text-sm font-bold text-[#4640de]">
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
