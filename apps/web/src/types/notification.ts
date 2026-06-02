export interface Notification {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  isRead: boolean;
  link: string | null;
}

export interface MarkNotificationAsReadResponse {
  notification: Notification;
  unreadCount: number;
}

export interface MarkAllNotificationsAsReadResponse {
  updatedCount: number;
  unreadCount: number;
}

export interface DeleteNotificationResponse {
  deletedId: number;
  unreadCount: number;
}
