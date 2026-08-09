import * as Notifications from 'expo-notifications';
import { type Href, useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import {
  clearLocalNotifications,
  registerForPushNotifications,
  syncRefreshedPushToken,
} from '../services/notification.service';
import { getNotificationRoute } from '@/utils/notification-navigation';

export function NotificationManager() {
  const router = useRouter();
  const { user, isPending } = useAuth();
  const handledResponseId = useRef<string | null>(null);

  useEffect(() => {
    if (isPending) {
      return;
    }

    if (!user?.id) {
      void clearLocalNotifications();
      return;
    }

    void registerForPushNotifications().catch((error) => {
      console.warn('[notifications] Could not register device token', error);
    });

    const tokenSubscription = Notifications.addPushTokenListener((token) => {
      void syncRefreshedPushToken(token).catch((error) => {
        console.warn('[notifications] Could not refresh device token', error);
      });
    });

    return () => tokenSubscription.remove();
  }, [isPending, user?.id]);

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    const handleResponse = (response: Notifications.NotificationResponse) => {
      const responseId = response.notification.request.identifier;
      if (handledResponseId.current === responseId) {
        return;
      }

      handledResponseId.current = responseId;
      const data = response.notification.request.content.data;

      const route = getNotificationRoute(
        typeof data.type === 'string' ? data.type : '',
        data.metadata,
        user?.role,
        data.link,
        data.resourceId
      );

      if (route) {
        router.push(route as Href);
      }
    };

    const responseSubscription =
      Notifications.addNotificationResponseReceivedListener(handleResponse);
    const initialResponse = Notifications.getLastNotificationResponse();
    if (initialResponse) {
      handleResponse(initialResponse);
      Notifications.clearLastNotificationResponse();
    }

    return () => responseSubscription.remove();
  }, [router, user?.id, user?.role]);

  return null;
}
