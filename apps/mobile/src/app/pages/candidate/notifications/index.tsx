import { useRef, useState } from 'react';
import { FlatList, Pressable, RefreshControl, View } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { Text } from '@/components/ui/text';
import {
  useNotifications,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
} from '@/hooks/useNotifications';
import { getNotificationRoute } from '@/utils/notification-navigation';
import { useUser } from '@/hooks/useUser';
import { COLORS } from '@/app/constants/theme';

export default function NotificationsScreen() {
  const { data: notifications = [], isLoading, refetch } = useNotifications();
  const [refreshing, setRefreshing] = useState(false);
  const refreshingRef = useRef(false);

  const markAsReadMutation = useMarkNotificationAsRead();

  const markAllMutation = useMarkAllNotificationsAsRead();

  const { data: user } = useUser();

  const handleRefresh = async () => {
    if (refreshingRef.current) return;

    refreshingRef.current = true;
    setRefreshing(true);
    try {
      const result = await refetch();
      if (result.isError) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } catch {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      refreshingRef.current = false;
      setRefreshing(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
      <View className="flex-row items-center justify-between border-b border-gray-200 px-4 py-4">
        <View className="flex-row items-center">
          <Pressable onPress={() => router.back()}>
            <ArrowLeft size={24} color={COLORS.textStrong} />
          </Pressable>

          <Text
            className="ml-4 text-xl font-bold"
            style={{ color: COLORS.textStrong }}
          >
            Notifications
          </Text>
        </View>

        {notifications.length > 0 && (
          <Pressable
            onPress={() => markAllMutation.mutate()}
            disabled={markAllMutation.isPending}
          >
            <Text className="font-medium" style={{ color: COLORS.primary }}>
              Mark all
            </Text>
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
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
          contentContainerStyle={{
            flexGrow: notifications.length === 0 ? 1 : 0,
            paddingBottom: 16,
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
                  item.metadata,
                  user?.role,
                  item.link
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
                  <Text
                    className="font-semibold"
                    style={{ color: COLORS.textStrong }}
                  >
                    {item.title}
                  </Text>

                  {!item.isRead && (
                    <View className="ml-2 rounded-full bg-red-500 px-2 py-0.5">
                      <Text className="text-xs text-white">NEW</Text>
                    </View>
                  )}
                </View>

                <Text className="mt-1 text-gray-600">{item.content}</Text>

                <Text className="mt-2 text-xs text-gray-400">
                  {new Date(item.createdAt).toLocaleString()}
                </Text>
              </View>
            </Pressable>
          )}
        />
      )}
    </SafeAreaView>
  );
}
