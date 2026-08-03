import * as Notifications from 'expo-notifications';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import {
  registerDevice,
  unregisterDevice,
  type DevicePlatform,
} from '../api/notifications';
import { COLORS } from '../app/constants/theme';

const NOTIFICATION_CHANNEL_ID = 'default';
const PUSH_TOKEN_STORAGE_KEY = 'jobly.push_token';

let lifecycleGeneration = 0;
let lifecycleQueue: Promise<unknown> = Promise.resolve();
let registrationEnabled = false;

function enqueue<T>(work: () => Promise<T>): Promise<T> {
  const next = lifecycleQueue.catch(() => undefined).then(work);
  lifecycleQueue = next;
  return next;
}

async function readStoredPushToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(PUSH_TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

async function readCurrentPushToken(): Promise<string | null> {
  const storedToken = await readStoredPushToken();
  if (storedToken) {
    return storedToken;
  }

  if (Platform.OS !== 'android') {
    return null;
  }

  try {
    const token = await Notifications.getDevicePushTokenAsync();
    return typeof token.data === 'string' ? token.data : null;
  } catch {
    return null;
  }
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export function registerForPushNotifications() {
  registrationEnabled = true;
  const generation = lifecycleGeneration;

  return enqueue(async () => {
    if (!registrationEnabled || generation !== lifecycleGeneration) {
      return null;
    }

    console.log('[Notification] Registering...');
    if (Platform.OS !== 'android') {
      return null;
    }

    await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNEL_ID, {
      name: 'Default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: COLORS.primary2,
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
    await SecureStore.setItemAsync(PUSH_TOKEN_STORAGE_KEY, token.data);
    return token.data;
  });
}

export function syncRefreshedPushToken(token: Notifications.DevicePushToken) {
  const generation = lifecycleGeneration;
  const tokenValue = token.data;

  return enqueue(async () => {
    if (
      !registrationEnabled ||
      generation !== lifecycleGeneration ||
      Platform.OS !== 'android' ||
      typeof tokenValue !== 'string'
    ) {
      return;
    }

    await registerDevice(Platform.OS, tokenValue);
    await SecureStore.setItemAsync(PUSH_TOKEN_STORAGE_KEY, tokenValue);
  });
}

export function unregisterCurrentDevice() {
  registrationEnabled = false;
  lifecycleGeneration += 1;

  return enqueue(async () => {
    const pushToken = await readCurrentPushToken();
    if (!pushToken) {
      return { deleted: false };
    }

    const result = await unregisterDevice(pushToken);
    await SecureStore.deleteItemAsync(PUSH_TOKEN_STORAGE_KEY);
    return result;
  });
}

export async function clearLocalNotifications(): Promise<void> {
  await Promise.allSettled([
    Notifications.dismissAllNotificationsAsync(),
    Notifications.setBadgeCountAsync(0),
  ]);
}
