import { useState } from 'react';
import {
  GenerateUploadUrlPayload,
  PresignedUploadUrlResponse,
  generatePresignedUploadUrl,
} from '@/api-client/s3';

interface UseCreateUploadUrlOptions {
  onSuccess?: (data: PresignedUploadUrlResponse) => void;
  onError?: (error: unknown) => void;
}

export function useCreateUploadUrl(options?: UseCreateUploadUrlOptions) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown | null>(null);
  const [data, setData] = useState<PresignedUploadUrlResponse | null>(null);

  const createUploadUrl = async (payload: GenerateUploadUrlPayload) => {
    setLoading(true);
    setError(null);

    try {
      const result = await generatePresignedUploadUrl(payload);
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

  return { createUploadUrl, loading, error, data };
}
