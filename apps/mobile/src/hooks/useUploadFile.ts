import { useState, useCallback } from 'react';
import { uploadFile, type UploadFileResult } from '../api/s3';

interface UseUploadFileOptions {
  onSuccess?: (data: UploadFileResult) => void;
  onError?: (error: unknown) => void;
}

export function useUploadFile(options?: UseUploadFileOptions) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown | null>(null);
  const [data, setData] = useState<UploadFileResult | null>(null);

  const upload = useCallback(
    async (file: Blob, fileName: string, fileType: string) => {
      setLoading(true);
      setError(null);

      try {
        const result = await uploadFile(file, fileName, fileType, 'resumes');
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

  return { upload, loading, error, data };
}
