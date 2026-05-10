import { useState } from 'react';
import {
  updateAvatar,
  type UpdateAvatarPayload,
  type UpdateAvatarResponse,
} from '@/api-client/candidate';

interface UseUpdateAvatarOptions {
  onSuccess?: (data: UpdateAvatarResponse) => void;
  onError?: (error: unknown) => void;
}

/**
 * Hook for updating user avatar
 *
 * Usage:
 * const { updateAvatarRecord, loading, error, data } = useUpdateAvatar({
 *   onSuccess: (data) => console.log('Avatar updated', data),
 * });
 *
 * // Call after successfully uploading file to S3:
 * await updateAvatarRecord({ fileKey: '...', fileUrl: '...' });
 */
export function useUpdateAvatar(options?: UseUpdateAvatarOptions) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [data, setData] = useState<UpdateAvatarResponse | null>(null);

  const updateAvatarRecord = async (payload: UpdateAvatarPayload) => {
    setLoading(true);
    setError(null);

    try {
      const result = await updateAvatar(payload);
      setData(result);
      options?.onSuccess?.(result);
      return result;
    } catch (err: unknown) {
      setError(err);
      options?.onError?.(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { updateAvatarRecord, loading, error, data };
}
