import { useState } from 'react';
import {
  S3Folder,
  UploadFileResult,
  uploadFile,
  validateS3File,
} from '@/api-client/s3';

interface UseUploadFileOptions {
  onSuccess?: (data: UploadFileResult) => void;
  onError?: (error: unknown) => void;
}

export function useUploadFile(options?: UseUploadFileOptions) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown | null>(null);
  const [data, setData] = useState<UploadFileResult | null>(null);

  const upload = async (file: File, folder: S3Folder = 'resumes') => {
    setLoading(true);
    setError(null);

    try {
      const validation = validateS3File(file, folder);
      if (!validation.valid) {
        throw new Error(validation.message || 'Invalid file for upload.');
      }

      const result = await uploadFile(file, folder);
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

  return { upload, loading, error, data };
}
