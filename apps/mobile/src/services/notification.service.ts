import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { registerDevice, type DevicePlatform } from '../api/notifications';

const NOTIFICATION_CHANNEL_ID = 'default';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registerForPushNotifications() {
  console.log('[Notification] Registering...');
  if (Platform.OS !== 'android') {
    return null;
  }

  await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNEL_ID, {
    name: 'Default',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#4f46e5',
    sound: 'default',
  });

  const currentPermissions = await Notifications.getPermissionsAsync();
  const permissions =
    currentPermissions.status === 'granted'
      ? currentPermissions
      : await Notifications.requestPermissionsAsync();

  if (permissions.status !== 'granted') {
    return null;
  }

  const token = await Notifications.getDevicePushTokenAsync();
  if (typeof token.data !== 'string') {
    return null;
  }

  await registerDevice(Platform.OS as DevicePlatform, token.data);
  return token.data;
}

export async function syncRefreshedPushToken(
  token: Notifications.DevicePushToken
) {
  if (Platform.OS !== 'android' || typeof token.data !== 'string') {
    return;
  }

  await registerDevice(Platform.OS, token.data);
}
