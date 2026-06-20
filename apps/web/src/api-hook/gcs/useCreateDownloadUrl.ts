import { useState, useCallback } from 'react';
import {
  GenerateDownloadUrlPayload,
  PresignedDownloadUrlResponse,
  generatePresignedDownloadUrl,
} from '@/api-client/gcs';

interface UseCreateDownloadUrlOptions {
  onSuccess?: (data: PresignedDownloadUrlResponse) => void;
  onError?: (error: unknown) => void;
}

export function useCreateDownloadUrl(options?: UseCreateDownloadUrlOptions) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown | null>(null);
  const [data, setData] = useState<PresignedDownloadUrlResponse | null>(null);

  const createDownloadUrl = useCallback(
    async (payload: GenerateDownloadUrlPayload) => {
      setLoading(true);
      setError(null);

      try {
        const result = await generatePresignedDownloadUrl(payload);
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

  return { createDownloadUrl, loading, error, data };
}
