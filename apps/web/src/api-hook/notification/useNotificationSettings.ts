import { useCallback, useState } from 'react';
import {
  getNotificationSettings,
  updateNotificationSettings,
} from '@/api-client/notification';
import { NotificationSettings } from '@/types/notification';

interface UseNotificationSettingsOptions {
  onSuccess?: (data: NotificationSettings) => void;
  onError?: (error: unknown) => void;
}

export function useNotificationSettings(
  options?: UseNotificationSettingsOptions
) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getNotificationSettings();
      options?.onSuccess?.(result);
      return result;
    } catch (err) {
      setError(err);
      options?.onError?.(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [options]);

  const updateSettings = useCallback(
    async (settings: Partial<NotificationSettings>) => {
      setSaving(true);
      setError(null);
      try {
        const result = await updateNotificationSettings(settings);
        options?.onSuccess?.(result);
        return result;
      } catch (err) {
        setError(err);
        options?.onError?.(err);
        throw err;
      } finally {
        setSaving(false);
      }
    },
    [options]
  );

  return {
    fetchSettings,
    updateSettings,
    loading,
    saving,
    error,
  };
}
