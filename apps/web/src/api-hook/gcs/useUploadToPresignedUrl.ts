import { useState, useCallback } from 'react';
import {
  GcsFolder,
  uploadFileToPresignedUrl,
  validateGcsFile,
} from '@/api-client/gcs';

interface UseUploadToPresignedUrlOptions {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}

interface UploadToPresignedUrlParams {
  contentType?: string;
  folder?: GcsFolder;
}

export function useUploadToPresignedUrl(
  options?: UseUploadToPresignedUrlOptions
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown | null>(null);
  const [done, setDone] = useState(false);

  const uploadToPresignedUrl = useCallback(
    async (
      uploadUrl: string,
      file: File,
      params?: UploadToPresignedUrlParams
    ) => {
      setLoading(true);
      setDone(false);
      setError(null);

      try {
        const folder = params?.folder ?? 'resumes';
        const validation = validateGcsFile(file, folder);
        if (!validation.valid) {
          throw new Error(validation.message || 'Invalid file for upload.');
        }

        await uploadFileToPresignedUrl(uploadUrl, file, params?.contentType);
        setDone(true);
        options?.onSuccess?.();
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

  return { uploadToPresignedUrl, loading, error, done };
}
