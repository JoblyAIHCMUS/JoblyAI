import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { useEffect, useRef } from 'react';
import { AppState, Platform } from 'react-native';
import Toast from 'react-native-toast-message';
import {
  getUnreadNotificationCount,
  listNotifications,
  MobileNotification,
  registerPushToken,
} from '../api/notifications';
import { User } from './useUser';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

function getProjectId() {
  return (
    Constants.easConfig?.projectId ??
    Constants.expoConfig?.extra?.eas?.projectId ??
    process.env.EXPO_PUBLIC_EAS_PROJECT_ID
  );
}

async function ensureAndroidChannel() {
  if (Platform.OS !== 'android') {
    return;
  }

  await Notifications.setNotificationChannelAsync('default', {
    name: 'Default',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#4f46e5',
  });
}

async function ensureNotificationPermission() {
  await ensureAndroidChannel();

  const currentPermissions = await Notifications.getPermissionsAsync();
  let finalStatus = currentPermissions.status;

  if (currentPermissions.status !== 'granted') {
    const requestedPermissions = await Notifications.requestPermissionsAsync();
    finalStatus = requestedPermissions.status;
  }

  if (finalStatus !== 'granted') {
    return false;
  }

  return true;
}

async function getAndroidExpoPushToken() {
  if (Platform.OS !== 'android' || !Device.isDevice) {
    return null;
  }

  const hasPermission = await ensureNotificationPermission();

  if (!hasPermission) {
    return null;
  }

  const projectId = getProjectId();
  const token = await Notifications.getExpoPushTokenAsync(
    projectId ? { projectId } : undefined
  );

  return token.data;
}

async function showLocalDemoNotification(notification: MobileNotification) {
  Toast.show({
    type: 'info',
    text1: notification.title,
    text2: notification.content,
  });

  if (Platform.OS !== 'ios') {
    return;
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: notification.title,
      body: notification.content,
      data: {
        notificationId: notification.id,
        type: notification.type,
        link: notification.link,
        metadata: notification.metadata,
      },
    },
    trigger: null,
  });
}

export function usePushNotifications(user: User | null | undefined) {
  const registeredForUserRef = useRef<string | null>(null);
  const lastSeenNotificationIdRef = useRef<number | null>(null);
  const unreadCountRef = useRef<number | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function registerCurrentDevice() {
      if (!user?.id || registeredForUserRef.current === user.id) {
        return;
      }

      const token = await getAndroidExpoPushToken();

      if (!token || !isMounted) {
        return;
      }

      await registerPushToken({
        token,
        deviceId: Constants.sessionId,
      });

      registeredForUserRef.current = user.id;
    }

    void registerCurrentDevice().catch(() => {
      Toast.show({
        type: 'error',
        text1: 'Khong the bat thong bao',
        text2: 'Vui long thu lai trong phan cai dat thiet bi.',
      });
    });

    const receivedSubscription =
      Notifications.addNotificationReceivedListener((notification) => {
        Toast.show({
          type: 'info',
          text1: notification.request.content.title ?? 'Thong bao moi',
          text2: notification.request.content.body ?? undefined,
        });
      });

    return () => {
      isMounted = false;
      receivedSubscription.remove();
    };
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) {
      lastSeenNotificationIdRef.current = null;
      unreadCountRef.current = null;
      void Notifications.setBadgeCountAsync(0).catch(() => undefined);
      return;
    }

    let isMounted = true;

    async function syncNotifications({ notify }: { notify: boolean }) {
      const [notifications, unreadCount] = await Promise.all([
        listNotifications(),
        getUnreadNotificationCount(),
      ]);

      if (!isMounted) {
        return;
      }

      await Notifications.setBadgeCountAsync(unreadCount).catch(
        () => undefined
      );

      const latestNotification = notifications[0];
      const lastSeenNotificationId = lastSeenNotificationIdRef.current;
      const previousUnreadCount = unreadCountRef.current;

      lastSeenNotificationIdRef.current = latestNotification?.id ?? null;
      unreadCountRef.current = unreadCount;

      if (
        notify &&
        latestNotification &&
        lastSeenNotificationId !== null &&
        latestNotification.id > lastSeenNotificationId &&
        (previousUnreadCount === null || unreadCount > previousUnreadCount)
      ) {
        await showLocalDemoNotification(latestNotification);
      }
    }

    void ensureNotificationPermission().catch(() => undefined);
    void syncNotifications({ notify: false }).catch(() => undefined);

    const interval = setInterval(() => {
      void syncNotifications({ notify: true }).catch(() => undefined);
    }, 15000);

    const appStateSubscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        void syncNotifications({ notify: true }).catch(() => undefined);
      }
    });

    return () => {
      isMounted = false;
      clearInterval(interval);
      appStateSubscription.remove();
    };
  }, [user?.id]);
}
