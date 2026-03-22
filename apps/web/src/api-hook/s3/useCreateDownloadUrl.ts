import { useState } from 'react';
import {
  GenerateDownloadUrlPayload,
  PresignedDownloadUrlResponse,
  generatePresignedDownloadUrl,
} from '@/api-client/s3';

interface UseCreateDownloadUrlOptions {
  onSuccess?: (data: PresignedDownloadUrlResponse) => void;
  onError?: (error: unknown) => void;
}

export function useCreateDownloadUrl(options?: UseCreateDownloadUrlOptions) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown | null>(null);
  const [data, setData] = useState<PresignedDownloadUrlResponse | null>(null);

  const createDownloadUrl = async (payload: GenerateDownloadUrlPayload) => {
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
  };

  return { createDownloadUrl, loading, error, data };
}
