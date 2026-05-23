import { Notification } from '@/types/notification';

export interface PaginatedNotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
}

export interface NotificationsQuery {
  page?: number;
  pageSize?: number;
}
