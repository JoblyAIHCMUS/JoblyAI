import { useCallback, useState } from 'react';
import {
  createDownloadUrl,
  type CreateDownloadUrlPayload,
  type PresignedDownloadUrlResponse,
} from '../api/gcs';

interface UseCreateDownloadUrlOptions {
  onSuccess?: (data: PresignedDownloadUrlResponse) => void;
  onError?: (error: unknown) => void;
}

export function useCreateDownloadUrl(options?: UseCreateDownloadUrlOptions) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [data, setData] = useState<PresignedDownloadUrlResponse | null>(null);

  const fetchDownloadUrl = useCallback(
    async (payload: CreateDownloadUrlPayload) => {
      setLoading(true);
      setError(null);
      try {
        const result = await createDownloadUrl(payload);
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
    },
    [options]
  );

  return { fetchDownloadUrl, loading, error, data };
}
