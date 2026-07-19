import { useState } from 'react';
import {
  deleteAvatar,
  type UpdateAvatarResponse,
} from '@/api-client/candidate';

interface UseDeleteAvatarOptions {
  onSuccess?: (data: UpdateAvatarResponse) => void;
  onError?: (error: unknown) => void;
}

export function useDeleteAvatar(options?: UseDeleteAvatarOptions) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [data, setData] = useState<UpdateAvatarResponse | null>(null);

  const deleteAvatarRecord = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await deleteAvatar();
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

  return { deleteAvatarRecord, loading, error, data };
}
