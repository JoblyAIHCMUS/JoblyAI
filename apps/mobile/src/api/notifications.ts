import { apiClient } from './config';

export interface NotificationSettings {
  applications: boolean;
  jobs: boolean;
  recommendations: boolean;
  messages: boolean;
}

export type NotificationSettingsKey = keyof NotificationSettings;

export type DevicePlatform = 'android' | 'ios';

export async function registerDevice(
  platform: DevicePlatform,
  pushToken: string
) {
  const response = await apiClient.post('/devices/register', {
    platform,
    pushToken,
  });
  return response.data;
}

export async function getNotificationSettings(
  signal?: AbortSignal
): Promise<NotificationSettings> {
  const response = await apiClient.get<NotificationSettings>(
    '/notifications/settings',
    { signal }
  );
  return response.data;
}

export async function updateNotificationSettings(
  settings: Partial<NotificationSettings>
): Promise<NotificationSettings> {
  const response = await apiClient.patch<NotificationSettings>(
    '/notifications/settings',
    settings
  );
  return response.data;
}

export const getNotifications = async (signal?: AbortSignal) => {
  const res = await apiClient.get('/notifications', {
    signal,
  });

  return res.data;
};

export const getUnreadNotificationCount = async (signal?: AbortSignal) => {
  const res = await apiClient.get('/notifications/unread-count', {
    signal,
  });

  return res.data.count;
};

export const markNotificationAsRead = async (notificationId: string) => {
  const response = await apiClient.patch(
    `/notifications/${notificationId}/read`
  );

  return response.data;
};

export const markAllNotificationsAsRead = async () => {
  const response = await apiClient.patch('/notifications/read-all');

  return response.data;
};
