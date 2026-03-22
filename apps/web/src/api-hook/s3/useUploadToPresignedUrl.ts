import { useState } from 'react';
import {
  S3Folder,
  uploadFileToPresignedUrl,
  validateS3File,
} from '@/api-client/s3';

interface UseUploadToPresignedUrlOptions {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}

export function useUploadToPresignedUrl(
  options?: UseUploadToPresignedUrlOptions
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown | null>(null);
  const [done, setDone] = useState(false);

  const uploadToPresignedUrl = async (
    uploadUrl: string,
    file: File,
    contentType?: string,
    folder: S3Folder = 'resumes'
  ) => {
    setLoading(true);
    setDone(false);
    setError(null);

    try {
      const validation = validateS3File(file, folder);
      if (!validation.valid) {
        throw new Error(validation.message || 'Invalid file for upload.');
      }

      await uploadFileToPresignedUrl(uploadUrl, file, contentType);
      setDone(true);
      options?.onSuccess?.();
    } catch (err: unknown) {
      setError(err);
      options?.onError?.(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { uploadToPresignedUrl, loading, error, done };
}
