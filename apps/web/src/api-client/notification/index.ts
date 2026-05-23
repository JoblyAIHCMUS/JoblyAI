import { apiClient } from '@/lib/api';
import {
  NotificationsQuery,
  PaginatedNotificationsResponse,
} from '@/api-client/notification/types';
import { Notification } from '@/types/notification';

export async function listNotifications(
  query?: NotificationsQuery
): Promise<PaginatedNotificationsResponse> {
  const response = await apiClient.get<PaginatedNotificationsResponse>(
    '/notifications',
    {
      params: query,
    }
  );
  return response.data;
}

export async function markNotificationAsRead(id: number): Promise<Notification> {
  const response = await apiClient.patch<Notification>(
    `/notifications/${id}/read`
  );
  return response.data;
}

export async function markAllNotificationsAsRead(): Promise<{ count: number }> {
  const response = await apiClient.patch<{ count: number }>(
    '/notifications/read-all'
  );
  return response.data;
}

export async function deleteNotification(id: number): Promise<void> {
  await apiClient.delete(`/notifications/${id}`);
}
