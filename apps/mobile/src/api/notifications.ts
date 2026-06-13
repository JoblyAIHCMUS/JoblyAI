import { apiClient } from './config';

export interface NotificationSettings {
  applications: boolean;
  jobs: boolean;
  recommendations: boolean;
}

export type NotificationSettingsKey = keyof NotificationSettings;

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
