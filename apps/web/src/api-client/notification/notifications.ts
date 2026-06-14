import { apiClient } from '@/lib/api';
import {
  Notification,
  NotificationSettings,
  MarkNotificationAsReadResponse,
  MarkAllNotificationsAsReadResponse,
  DeleteNotificationResponse,
} from '@/types/notification';

export async function listNotifications(): Promise<Notification[]> {
  const response = await apiClient.get<Notification[]>('/notifications');
  return response.data;
}

export async function getUnreadCount(): Promise<{ count: number }> {
  const response = await apiClient.get<{ count: number }>(
    '/notifications/unread-count'
  );
  return response.data;
}

export async function getNotificationSettings(): Promise<NotificationSettings> {
  const response = await apiClient.get<NotificationSettings>(
    '/notifications/settings'
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

export async function markNotificationAsRead(
  id: number
): Promise<MarkNotificationAsReadResponse> {
  const response = await apiClient.patch<MarkNotificationAsReadResponse>(
    `/notifications/${id}/read`
  );
  return response.data;
}

export async function markAllNotificationsAsRead(): Promise<MarkAllNotificationsAsReadResponse> {
  const response = await apiClient.patch<MarkAllNotificationsAsReadResponse>(
    '/notifications/read-all'
  );
  return response.data;
}

export async function deleteNotification(
  id: number
): Promise<DeleteNotificationResponse> {
  const response = await apiClient.delete<DeleteNotificationResponse>(
    `/notifications/${id}`
  );
  return response.data;
}
