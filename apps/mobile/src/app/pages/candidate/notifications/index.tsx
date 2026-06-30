import { FlatList, Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/ui/text';
import {
  useNotifications,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
} from '@/hooks/useNotifications';
import { getNotificationRoute } from '@/utils/notification-navigation';
import { useUser } from '@/hooks/useUser';

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();

  const { data: notifications = [], isLoading } = useNotifications();

  const markAsReadMutation = useMarkNotificationAsRead();

  const markAllMutation = useMarkAllNotificationsAsRead();

  const { data: user } = useUser();

  return (
    <View
      className="flex-1 bg-white"
      style={{
        paddingTop: insets.top,
      }}
    >
      <View className="flex-row items-center justify-between border-b border-gray-200 px-4 py-4">
        <View className="flex-row items-center">
          <Pressable onPress={() => router.back()}>
            <ArrowLeft size={24} color="#25324b" />
          </Pressable>

          <Text className="ml-4 text-xl font-bold text-[#25324b]">
            Notifications
          </Text>
        </View>

        {notifications.length > 0 && (
          <Pressable
            onPress={() => markAllMutation.mutate()}
            disabled={markAllMutation.isPending}
          >
            <Text className="font-medium text-[#4640de]">Mark all</Text>
          </Pressable>
        )}
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <Text>Loading notifications...</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            flexGrow: notifications.length === 0 ? 1 : 0,
          }}
          ListEmptyComponent={() => (
            <View className="flex-1 items-center justify-center px-6">
              <Text className="text-center text-gray-500">
                No notifications yet
              </Text>
            </View>
          )}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => {
                if (!item.isRead) {
                  markAsReadMutation.mutate(item.id);
                }
                const route = getNotificationRoute(
                  item.type,
                  item.resourceId,
                  user?.role
                );

                if (route) {
                  router.push(route);
                }
              }}
            >
              <View
                className={`border-b border-gray-100 px-4 py-4 ${
                  !item.isRead ? 'bg-indigo-50' : 'bg-white'
                }`}
              >
                <View className="flex-row items-center">
                  <Text className="font-semibold text-[#25324b]">
                    {item.title}
                  </Text>

                  {!item.isRead && (
                    <View className="ml-2 rounded-full bg-red-500 px-2 py-0.5">
                      <Text className="text-xs text-white">NEW</Text>
                    </View>
                  )}
                </View>

                <Text className="mt-1 text-gray-600">{item.message}</Text>

                <Text className="mt-2 text-xs text-gray-400">
                  {new Date(item.createdAt).toLocaleString()}
                </Text>
              </View>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}
