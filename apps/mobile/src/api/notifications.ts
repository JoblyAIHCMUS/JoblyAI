import { Platform } from 'react-native';
import { apiClient } from './config';

export type MobileNotification = {
  id: number;
  recipientId: string;
  type: string;
  title: string;
  content: string;
  link?: string | null;
  isRead: boolean;
  createdAt: string;
  metadata?: Record<string, unknown> | null;
};

export type RegisterPushTokenPayload = {
  token: string;
  deviceId?: string;
};

export async function listNotifications(): Promise<MobileNotification[]> {
  const response = await apiClient.get<MobileNotification[]>('/notifications');

  return response.data;
}

export async function getUnreadNotificationCount(): Promise<number> {
  const response = await apiClient.get<{ count: number }>(
    '/notifications/unread-count'
  );

  return response.data.count;
}

export async function registerPushToken(payload: RegisterPushTokenPayload) {
  const response = await apiClient.post('/notifications/push-token', {
    ...payload,
    platform: Platform.OS,
  });

  return response.data;
}

export async function markNotificationRead(notificationId: number) {
  const response = await apiClient.patch(
    `/notifications/${notificationId}/read`
  );

  return response.data;
}

export async function markAllNotificationsRead() {
  const response = await apiClient.patch('/notifications/read-all');

  return response.data;
}

export async function unregisterPushToken(token: string) {
  const response = await apiClient.delete('/notifications/push-token', {
    data: { token },
  });

  return response.data;
}
