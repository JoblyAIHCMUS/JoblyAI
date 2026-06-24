import * as Notifications from 'expo-notifications';
import { type Href, useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { useUser } from '../hooks/useUser';
import {
  getNotificationLink,
  registerForPushNotifications,
  syncRefreshedPushToken,
} from '../services/notification.service';

export function NotificationManager() {
  const router = useRouter();
  const { data: user } = useUser();
  const handledResponseId = useRef<string | null>(null);

  useEffect(() => {
    if (!user?.id) {
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
  }, [user?.id]);

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
      const link = getNotificationLink(response);
      if (link) {
        router.push(link as Href);
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
  }, [router, user?.id]);

  return null;
}
